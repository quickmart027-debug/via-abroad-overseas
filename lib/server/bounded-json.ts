import "server-only";

export type BoundedJsonResult =
  | { status: "valid"; value: unknown }
  | { status: "malformed_json" }
  | { status: "too_large" }
  | { status: "unsupported_media_type" };

/**
 * Reads and parses a JSON request body without ever buffering more than
 * `maxBytes`. Checks, in order and before any JSON parsing:
 * 1. only `application/json` (optionally with parameters) is accepted;
 * 2. a declared Content-Length over the cap is rejected without reading;
 * 3. the body is streamed and counted in UTF-8 BYTES (not UTF-16 string
 *    length), cancelling the stream as soon as the cap is crossed, so a
 *    missing or lying Content-Length can't force an unbounded read;
 * 4. the bytes must be valid UTF-8 and valid JSON.
 */
export async function readBoundedJson(
  request: Request,
  maxBytes: number
): Promise<BoundedJsonResult> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") return { status: "unsupported_media_type" };

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return { status: "too_large" };

  if (!request.body) return { status: "malformed_json" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { status: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { status: "malformed_json" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { status: "valid", value: JSON.parse(text) as unknown };
  } catch {
    return { status: "malformed_json" };
  }
}
