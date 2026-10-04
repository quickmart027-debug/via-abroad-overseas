import "server-only";
import { NextResponse } from "next/server";
import { MAX_REQUEST_BYTES } from "@/lib/security/spam-checks";
import { readBoundedJson } from "@/lib/server/bounded-json";

export type JsonBodyResult =
  | { ok: true; payload: unknown }
  | { ok: false; response: NextResponse };

/**
 * Shared request guard for the public enquiry routes. Delegates the
 * Content-Type, Content-Length, streamed byte cap, UTF-8 and JSON checks to
 * `readBoundedJson` and maps each failure to its HTTP response:
 * 415 non-JSON media type, 413 oversized body, 400 malformed body.
 */
export async function readJsonRequestBody(
  request: Request,
  maxBytes: number = MAX_REQUEST_BYTES
): Promise<JsonBodyResult> {
  const body = await readBoundedJson(request, maxBytes);
  switch (body.status) {
    case "valid":
      return { ok: true, payload: body.value };
    case "unsupported_media_type":
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Content-Type must be application/json." },
          { status: 415 }
        ),
      };
    case "too_large":
      return {
        ok: false,
        response: NextResponse.json({ error: "Request payload too large." }, { status: 413 }),
      };
    case "malformed_json":
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid request body." }, { status: 400 }),
      };
  }
}
