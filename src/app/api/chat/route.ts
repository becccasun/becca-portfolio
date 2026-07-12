import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/chat-context";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_LENGTH = 2000;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured." },
      { status: 503 }
    );
  }

  let messages: IncomingMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_MESSAGES ||
      !messages.every(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.length <= MAX_LENGTH
      )
    ) {
      throw new Error("bad shape");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system: buildSystemPrompt(),
      messages,
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Upstream model error." },
      { status: 502 }
    );
  }

  const data = await res.json();
  const reply =
    data.content?.find((b: { type: string }) => b.type === "text")?.text ??
    "I could not come up with an answer. Try rephrasing?";

  return NextResponse.json({ reply });
}
