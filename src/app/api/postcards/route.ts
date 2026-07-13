import { NextResponse } from "next/server";
import {
  appendPostcard,
  listApprovedPostcards,
  PRESET_CARDS,
  BG_OPTIONS,
  FG_OPTIONS,
  DECO_OPTIONS,
  type PostcardDesign,
} from "@/lib/postcards";
import { moderateMessage } from "@/lib/moderate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 240;
const MAX_NAME = 24;

// One postcard per IP per half minute, per server instance.
const lastPost = new Map<string, number>();

export async function GET() {
  // Presets always anchor the stream; visitor cards join newest-last.
  return NextResponse.json({
    cards: [...PRESET_CARDS, ...listApprovedPostcards()],
  });
}

export async function POST(req: Request) {
  let text: string, name: string, design: PostcardDesign;
  try {
    const body = await req.json();
    text = String(body.text ?? "").trim();
    name = String(body.name ?? "").trim();
    design = body.design;
    if (
      text.length < 2 ||
      text.length > MAX_TEXT ||
      name.length > MAX_NAME ||
      !BG_OPTIONS.some((o) => o.id === design?.bg) ||
      !FG_OPTIONS.some((o) => o.id === design?.fg) ||
      !DECO_OPTIONS.some((o) => o.id === design?.deco)
    ) {
      throw new Error("bad shape");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  if (now - (lastPost.get(ip) ?? 0) < 30_000) {
    return NextResponse.json(
      { error: "The mail only goes out every so often. Try again shortly." },
      { status: 429 }
    );
  }
  lastPost.set(ip, now);

  const approved = await moderateMessage(text, name);
  appendPostcard({
    id: crypto.randomUUID(),
    design: { bg: design.bg, fg: design.fg, deco: design.deco },
    text,
    name,
    approved,
    createdAt: new Date().toISOString(),
  });

  // Moderation outcome is intentionally not disclosed; unapproved cards
  // simply never enter the stream.
  return NextResponse.json({ ok: true });
}
