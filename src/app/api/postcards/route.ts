import { NextResponse } from "next/server";
import {
  appendPostcard,
  listApprovedPostcards,
  PRESET_CARDS,
  ART_OPTIONS,
  STAMP_OPTIONS,
  type PostcardDesign,
} from "@/lib/postcards";
import { moderateMessage } from "@/lib/moderate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 240;
const MAX_NAME = 24;
const MAX_CITY = 32;
const MAX_ROLE = 32;

// One postcard per IP per half minute, per server instance.
const lastPost = new Map<string, number>();

export async function GET() {
  // Presets always anchor the stream; visitor cards join newest-last.
  return NextResponse.json({
    cards: [...PRESET_CARDS, ...(await listApprovedPostcards())],
  });
}

export async function POST(req: Request) {
  let text: string, name: string, city: string, role: string;
  let design: PostcardDesign;
  try {
    const body = await req.json();
    text = String(body.text ?? "").trim();
    name = String(body.name ?? "").trim();
    city = String(body.city ?? "").trim();
    role = String(body.role ?? "").trim();
    design = body.design;
    if (
      text.length < 2 ||
      text.length > MAX_TEXT ||
      name.length > MAX_NAME ||
      city.length > MAX_CITY ||
      role.length > MAX_ROLE ||
      !ART_OPTIONS.some((o) => o.id === design?.art) ||
      !STAMP_OPTIONS.some((o) => o.id === design?.stamp)
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

  // City and role are free text on a public card, so they go through
  // the same moderation gate as the message and the name.
  const approved = await moderateMessage(
    text,
    [name, city, role].filter(Boolean).join(" · ")
  );
  try {
    await appendPostcard({
      id: crypto.randomUUID(),
      design: { art: design.art, stamp: design.stamp },
      text,
      name,
      city,
      role,
      approved,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save your postcard. Try again in a moment." },
      { status: 500 }
    );
  }

  // Moderation outcome is intentionally not disclosed; unapproved cards
  // simply never enter the stream.
  return NextResponse.json({ ok: true });
}
