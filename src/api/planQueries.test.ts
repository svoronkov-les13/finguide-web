// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { anonymousPlanQueryKey, contributionsQueryKey, monthlyTrackerQueryKey, planQueryKeyForAuth, updateMonthlyTrackerCache, updateSavingsCaches } from "@/api/planQueries";

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

describe("mutation cache updates", () => {
  it("updates contributions cache and invalidates the active plan after savings changes", () => {
    const queryClient = {
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    };
    const planKey = ["financial-plan", "auth", "user-123"] as const;
    const contributions = [{ id: "c1", goalId: "g1", amount: 1000, currency: "RUB", date: "2026-05-15", note: null }];

    updateSavingsCaches(queryClient, planKey, contributions as never);

    expect(queryClient.setQueryData).toHaveBeenCalledWith(contributionsQueryKey, contributions);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: planKey });
  });

  it("writes returned monthly tracker rows directly for immediate calendar updates", () => {
    const queryClient = {
      setQueryData: vi.fn(),
    };
    const rows = [{ month: "2026-05", status: "completed", amount: 150000, note: null }];

    updateMonthlyTrackerCache(queryClient, rows as never);

    expect(queryClient.setQueryData).toHaveBeenCalledWith(monthlyTrackerQueryKey, rows);
  });
});
