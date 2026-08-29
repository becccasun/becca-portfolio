import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visitors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hands out one visitor number per arrival.
 *
 * POST rather than GET on purpose: it writes. A GET would be fetched by
 * link previews, prefetchers and crawlers, and the tally would count
 * machines instead of people. The browser only calls this the first
 * time someone visits — after that it remembers its own number — so a
 * refresh does not spend a new one.
 */
export async function POST() {
  try {
    const number = await recordVisit();
    return NextResponse.json({ number });
  } catch (err) {
    console.error("[visitors] could not record visit", err);
    // The footer simply says nothing if this fails; a counter is not
    // worth an error in front of a reader.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
