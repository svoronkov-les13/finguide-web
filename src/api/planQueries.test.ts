// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { anonymousPlanQueryKey, planQueryKeyForAuth } from "@/api/planQueries";

describe("planQueryKeyForAuth", () => {
  it("uses anonymous cache key when OIDC auth is disabled", () => {
    expect(planQueryKeyForAuth({ enabled: false, authenticated: true })).toEqual(anonymousPlanQueryKey);
  });

  it("does not reuse anonymous demo cache while auth is pending", () => {
    expect(planQueryKeyForAuth({ enabled: true, authenticated: false })).toEqual(["financial-plan", "auth", "pending"]);
  });

  it("partitions authenticated plan cache by user subject without exposing access token", () => {
    const key = planQueryKeyForAuth({
      enabled: true,
      authenticated: true,
      session: {
        accessToken: "secret-token-value",
        tokenType: "Bearer",
        expiresAt: Date.now() + 60_000,
        profile: { sub: "user-123", email: "user@example.com" },
      },
    });

    expect(key).toEqual(["financial-plan", "auth", "user-123"]);
    expect(JSON.stringify(key)).not.toContain("secret-token-value");
  });
});
