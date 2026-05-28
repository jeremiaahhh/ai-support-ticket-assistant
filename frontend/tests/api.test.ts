import { afterEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "@/lib/api";

describe("api client", () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", ai_provider: "anthropic", mock_mode: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof fetch;

    const result = await api.health();
    expect(result.status).toBe("ok");
    expect(result.mock_mode).toBe(true);
  });

  it("throws ApiError with the structured error code on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "not_found", message: "Ticket missing" } }),
        { status: 404, headers: { "content-type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    await expect(api.getTicket("nope")).rejects.toMatchObject({
      name: "Error",
      status: 404,
      code: "not_found",
    });
    await expect(api.getTicket("nope")).rejects.toBeInstanceOf(ApiError);
  });
});
