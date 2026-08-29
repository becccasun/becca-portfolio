import fs from "fs";

/**
 * Intrinsic dimensions of an image, read straight from its header.
 *
 * The bento grid needs every thumbnail's true aspect ratio at build
 * time so it can solve two columns to a flush bottom edge. That is the
 * only thing this file exists for, so it reads headers rather than
 * pulling in a decoder: a few dozen bytes per file, no dependency, and
 * it runs on the server only.
 *
 * Anything it cannot parse returns null, and the grid falls back to a
 * default shape rather than breaking the layout.
 */
export type ImageSize = { width: number; height: number };

/** JPEG frame markers carrying dimensions. C4, C8 and CC are not frames. */
function isStartOfFrame(marker: number): boolean {
  return (
    marker >= 0xc0 &&
    marker <= 0xcf &&
    marker !== 0xc4 &&
    marker !== 0xc8 &&
    marker !== 0xcc
  );
}

function pngSize(buf: Buffer): ImageSize | null {
  // 8-byte signature, then the IHDR chunk: length, type, width, height.
  if (buf.length < 24) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf: Buffer): ImageSize | null {
  if (buf.length < 10) return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function jpegSize(buf: Buffer): ImageSize | null {
  // Walk the segment chain. Each segment is FF, marker, then a 2-byte
  // length that covers the length field itself.
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++; // resync past padding
      continue;
    }
    const marker = buf[offset + 1];
    if (isStartOfFrame(marker)) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  return null;
}

function webpSize(buf: Buffer): ImageSize | null {
  if (buf.length < 30) return null;
  const format = buf.toString("ascii", 12, 16);
  if (format === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (format === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (format === "VP8X") {
    // 24-bit little-endian, stored as one less than the real dimension.
    const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
    const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

function svgSize(buf: Buffer): ImageSize | null {
  // Only the opening tag matters, and these files can be large.
  const head = buf.toString("utf8", 0, Math.min(buf.length, 4096));
  const viewBox = head.match(
    /viewBox\s*=\s*["']\s*[-\d.eE]+[\s,]+[-\d.eE]+[\s,]+([\d.eE]+)[\s,]+([\d.eE]+)/
  );
  if (viewBox) {
    const width = parseFloat(viewBox[1]);
    const height = parseFloat(viewBox[2]);
    if (width > 0 && height > 0) return { width, height };
  }
  // Fall back to width/height, but only when both are plain numbers or
  // px — a percentage says nothing about the intrinsic shape.
  const w = head.match(/\bwidth\s*=\s*["']\s*([\d.]+)(px)?\s*["']/);
  const h = head.match(/\bheight\s*=\s*["']\s*([\d.]+)(px)?\s*["']/);
  if (w && h) {
    const width = parseFloat(w[1]);
    const height = parseFloat(h[1]);
    if (width > 0 && height > 0) return { width, height };
  }
  return null;
}

export function readImageSize(file: string): ImageSize | null {
  let buf: Buffer;
  try {
    const fd = fs.openSync(file, "r");
    try {
      // Enough for every header above, including a generous SVG opening
      // tag, without reading whole photographs into memory.
      buf = Buffer.alloc(8192);
      const read = fs.readSync(fd, buf, 0, 8192, 0);
      buf = buf.subarray(0, read);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return null;
  }

  if (buf.length < 10) return null;

  const png = buf.toString("hex", 0, 8) === "89504e470d0a1a0a";
  if (png) return pngSize(buf);
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  if (buf.toString("ascii", 0, 3) === "GIF") return gifSize(buf);
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return webpSize(buf);
  }

  const head = buf.toString("utf8", 0, Math.min(buf.length, 512));
  if (head.includes("<svg") || head.trimStart().startsWith("<?xml")) {
    return svgSize(buf);
  }
  return null;
}
