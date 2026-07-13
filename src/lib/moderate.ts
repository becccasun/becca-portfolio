/**
 * Shared moderation for visitor-submitted text (postcards). Regex
 * checks catch links and gibberish; Claude Haiku judges the rest.
 * Fails closed: any API problem means not approved, and unapproved
 * content simply never surfaces.
 */
export async function moderateMessage(
  text: string,
  name: string
): Promise<boolean> {
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
          "You moderate an anonymous postcard wall on a personal portfolio, where strangers leave a short kind note for other visitors. Reply with exactly APPROVE or REJECT. REJECT if the note is hateful, sexual, violent, harassing, spammy, self-promotional, incoherent gibberish, or contains contact info, URLs, or personal data. Otherwise APPROVE. When unsure, REJECT.",
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
    return false;
  }
}
