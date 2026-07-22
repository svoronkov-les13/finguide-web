import { afterEach, describe, expect, it, vi } from "vitest";

describe("requestPasswordReset", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the email to the backend password reset endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));
    const { requestPasswordReset } = await import("@/auth/passwordReset");

    await requestPasswordReset("stas@example.com");

    expect(fetchMock).toHaveBeenCalledWith("/finguide-api/api/v1/auth/password/forgot", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "stas@example.com" }),
    });
  });

  it("throws when the backend rejects the reset request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("smtp unavailable", { status: 503 }));
    const { requestPasswordReset } = await import("@/auth/passwordReset");

    await expect(requestPasswordReset("stas@example.com")).rejects.toThrow("smtp unavailable");
  });
});
