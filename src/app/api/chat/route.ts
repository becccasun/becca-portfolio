import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, OFF_TOPIC_LINE } from "@/lib/chat-prompt";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_LENGTH = 2000;
// the whole conversation, so a long chat can't grow into an expensive prompt
const MAX_TOTAL = 8000;

// A small per-visitor budget so one tab can't run up the bill. In memory, so it resets
// on restart and isn't shared across server instances — fine for a portfolio.
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 20;
const hits = new Map<string, number[]>();
function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

let client: Anthropic | null = null;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) {
    return Response.json({ error: "That's a lot of questions! Give me a few minutes." }, { status: 429 });
  }

  let messages: Anthropic.Beta.BetaMessageParam[];
  try {
    const body = await req.json();
    const list = body?.messages;
    const ok =
      Array.isArray(list) &&
      list.length > 0 &&
      list.length <= MAX_MESSAGES &&
      list.every(
        (m: unknown, i: number) =>
          !!m &&
          typeof m === "object" &&
          (m as { role: unknown }).role === (i % 2 === 0 ? "user" : "assistant") &&
          typeof (m as { content: unknown }).content === "string" &&
          (m as { content: string }).content.trim().length > 0 &&
          (m as { content: string }).content.length <= MAX_LENGTH,
      ) &&
      list[list.length - 1].role === "user" &&
      list.reduce((n: number, m: { content: string }) => n + m.content.length, 0) <= MAX_TOTAL;
    if (!ok) throw new Error("bad shape");
    messages = list.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }));
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Credentials: ANTHROPIC_API_KEY in .env.local (or wherever the site is hosted).
  // Checked up front: without one the SDK only fails once the request is sent, with an
  // error that isn't an API error, so it would surface as a generic stumble.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ error: "I'm not set up yet, so I can't answer questions right now." }, { status: 503 });
  }
  client ??= new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-sonnet-5-5",
    // Answers are kept short by the briefing (about 60 words). This cap only stops a runaway
    // reply, and it also has to hold the model's thinking, which counts toward it: at 400,
    // thinking plus answer hit the cap and replies were cut off mid-list.
    max_tokens: 2000,
    // chat answers don't need deep deliberation
    output_config: { effort: "low" },
    // if Sonnet 5.5 declines, eligible requests are re-run server-side on the recommended fallback
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // the briefing is identical on every request, so it is cached as the prompt prefix
    system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
    messages,
  });

  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sent = true;
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        // one line per reply that didn't end normally, to find answers that stop mid-sentence
        if (final.stop_reason !== "end_turn") {
          console.warn(
            "chat reply stopped:",
            JSON.stringify({ stop: final.stop_reason, details: final.stop_details, model: final.model, blocks: final.content.map((b) => b.type), out: final.usage.output_tokens }),
          );
        }
        if (final.stop_reason === "refusal" && !sent) {
          controller.enqueue(enc.encode(OFF_TOPIC_LINE));
        }
      } catch (err) {
        const note =
          err instanceof Anthropic.AuthenticationError
            ? "I'm not set up yet, so I can't answer questions right now."
            : err instanceof Anthropic.RateLimitError
            ? "I'm getting a lot of questions right now. Try again in a minute?"
            : "Sorry, I lost my train of thought. Could you ask that again?";
        controller.enqueue(enc.encode(sent ? `\n\n${note}` : note));
        console.error("chat stream failed:", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
