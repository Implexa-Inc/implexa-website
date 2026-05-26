import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

import {
  getIndexNowKey,
  getIndexNowKeyUrl,
  getLastSubmissionAt,
} from "@/lib/indexnow";

// Dev-only verification endpoint. Lets the founder confirm that the
// IMPLEXA_INDEXNOW_KEY env var is wired correctly on a given environment
// without ever returning the key itself.
//
// In production this route 404s — even existing knowledge that a debug
// surface is here is not useful to an attacker, and we don't need it
// once the integration is verified.

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const key = getIndexNowKey();
  const lastAt = getLastSubmissionAt();

  return NextResponse.json({
    keyConfigured: key !== null,
    // The URL containing the key is intentionally returned: the founder
    // needs to verify that hitting that URL serves the key as plain
    // text. It's not a secret on its own — anyone who knows the URL
    // can also just hit it.
    keyUrl: getIndexNowKeyUrl(),
    lastSubmissionAt: lastAt ? new Date(lastAt).toISOString() : null,
  });
}
