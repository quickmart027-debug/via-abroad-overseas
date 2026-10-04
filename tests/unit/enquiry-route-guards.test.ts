// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const runEnquiryPipeline = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/enquiry-pipeline", () => ({ runEnquiryPipeline }));

import { readJsonRequestBody } from "@/lib/server/read-json-body";
import { MAX_REQUEST_BYTES } from "@/lib/security/spam-checks";
import { POST as contactPOST } from "@/app/api/enquiries/contact/route";
import { POST as consultationPOST } from "@/app/api/enquiries/consultation/route";
import { POST as findMyOptionsPOST } from "@/app/api/enquiries/find-my-options/route";

function post(body: BodyInit | null, headers: Record<string, string> = {}) {
  return new Request("https://example.test/api/enquiries/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

/** A body stream with no Content-Length, as with chunked transfer encoding. */
function streamedPost(text: string) {
  const bytes = new TextEncoder().encode(text);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += 4096) controller.enqueue(bytes.slice(i, i + 4096));
      controller.close();
    },
  });
  return new Request("https://example.test/api/enquiries/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: stream,
    // Required by Node's fetch for streamed request bodies.
    duplex: "half",
  } as RequestInit);
}

describe("readJsonRequestBody", () => {
  it("parses a JSON body", async () => {
    const result = await readJsonRequestBody(post(JSON.stringify({ a: 1 })));
    expect(result).toEqual({ ok: true, payload: { a: 1 } });
  });

  it("accepts a charset parameter on the media type", async () => {
    const result = await readJsonRequestBody(
      post("{}", { "content-type": "Application/JSON; charset=utf-8" })
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a declared Content-Length over the cap with 413 before reading", async () => {
    const request = post("{}", { "content-length": String(MAX_REQUEST_BYTES + 1) });
    const result = await readJsonRequestBody(request);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
    expect(request.bodyUsed).toBe(false);
  });

  it("measures bytes, not string length (multi-byte characters)", async () => {
    // 7,000 "₹" = 7,000 UTF-16 units but 21,000 UTF-8 bytes (> 20,000 cap).
    const text = JSON.stringify({ message: "₹".repeat(7_000) });
    expect(text.length).toBeLessThan(MAX_REQUEST_BYTES);
    const result = await readJsonRequestBody(streamedPost(text));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("caps a streamed body that has no Content-Length", async () => {
    const result = await readJsonRequestBody(
      streamedPost(JSON.stringify({ message: "a".repeat(MAX_REQUEST_BYTES) }))
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it.each([undefined, "text/plain", "application/x-www-form-urlencoded", "multipart/form-data"])(
    "rejects Content-Type %s with 415",
    async (contentType) => {
      const headers = new Headers();
      if (contentType) headers.set("content-type", contentType);
      const request = new Request("https://example.test/api/enquiries/contact", {
        method: "POST",
        headers,
        body: contentType ? "{}" : null,
      });
      const result = await readJsonRequestBody(request);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(415);
    }
  );

  it("rejects malformed JSON with 400", async () => {
    const result = await readJsonRequestBody(post("{not json"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });
});

describe.each([
  ["contact", contactPOST],
  ["consultation", consultationPOST],
  ["find-my-options", findMyOptionsPOST],
])("/api/enquiries/%s guards", (_name, POST) => {
  it("returns 413 for an oversized payload without running the pipeline", async () => {
    const response = await POST(post(JSON.stringify({ message: "a".repeat(25_000) })));
    expect(response.status).toBe(413);
    expect(runEnquiryPipeline).not.toHaveBeenCalled();
  });

  it("returns 415 for a non-JSON content type", async () => {
    const response = await POST(post("fullName=A", { "content-type": "application/x-www-form-urlencoded" }));
    expect(response.status).toBe(415);
    expect(runEnquiryPipeline).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid payload with no stack trace", async () => {
    const response = await POST(post(JSON.stringify({ fullName: "A" })));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
    expect(runEnquiryPipeline).not.toHaveBeenCalled();
  });
});
