import { NextResponse } from "next/server";
import {
  appendMessage,
  latestMessage,
  listApproved,
  ICON_IDS,
  PAPER_COLORS,
  type IconId,
  type PaperColor,
} from "@/lib/bottle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 280;
const MAX_NAME = 24;

// One message per IP per half minute, per server instance.
const lastPost = new Map<string, number>();

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.has("list")) {
    return NextResponse.json({ messages: listApproved() });
  }
  return NextResponse.json({ message: latestMessage() });
}

export async function POST(req: Request) {
  let text: string, name: string, color: PaperColor, icon: IconId;
  try {
    const body = await req.json();
    text = String(body.text ?? "").trim();
    name = String(body.name ?? "").trim();
    color = body.color;
    icon = body.icon;
    if (
      text.length < 2 ||
      text.length > MAX_TEXT ||
      name.length > MAX_NAME ||
      !PAPER_COLORS.some((c) => c.id === color) ||
      !ICON_IDS.includes(icon)
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
      { error: "The tide only goes out every so often. Try again shortly." },
      { status: 429 }
    );
  }
  lastPost.set(ip, now);

  const approved = await moderate(text, name);
  appendMessage({
    id: crypto.randomUUID(),
    text,
    name,
    color,
    icon,
    approved,
    createdAt: new Date().toISOString(),
  });

  // Moderation outcome is intentionally not disclosed; unapproved notes
  // simply never surface and the next visitor gets the preset instead.
  return NextResponse.json({ ok: true });
}

async function moderate(text: string, name: string): Promise<boolean> {
  // Links are spam bait on an anonymous wall regardless of wording.
  if (/https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|me|ly)\b/i.test(text)) {
    return false;
  }
  if (!/[a-zA-Z]{2,}/.test(text)) return false;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return true; // basic checks only when unconfigured (dev)

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4,
        system:
          "You moderate an anonymous message-in-a-bottle wall on a personal portfolio, where strangers leave a short kind note for the next visitor. Reply with exactly APPROVE or REJECT. REJECT if the note is hateful, sexual, violent, harassing, spammy, self-promotional, incoherent gibberish, or contains contact info, URLs, or personal data. Otherwise APPROVE. When unsure, REJECT.",
        messages: [
          {
            role: "user",
            content: `Note: ${text}\nSigned: ${name || "anonymous"}`,
          },
        ],
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const verdict = data.content?.find(
      (b: { type: string }) => b.type === "text"
    )?.text;
    return typeof verdict === "string" && verdict.trim() === "APPROVE";
  } catch {
    return false; // fail closed: the preset note is the safe default
  }
}
