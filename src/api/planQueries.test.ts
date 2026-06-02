// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { anonymousPlanQueryKey, monthlyTrackerQueryKey, planQueryKeyForAuth, plansQueryKey, updateMonthlyTrackerCache, updatePlanManagementCaches } from "@/api/planQueries";

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

  it("writes returned monthly tracker rows and invalidates plan progress immediately", () => {
    const queryClient = {
      getQueryData: vi.fn().mockReturnValue([]),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    };
    const planKey = ["financial-plan", "auth", "user-123"] as const;
    const rows = [{ month: "2026-05", status: "completed", amount: 150000, note: null }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMonthlyTrackerCache(queryClient as any, planKey, rows as never);

    expect(queryClient.getQueryData).toHaveBeenCalledWith(monthlyTrackerQueryKey);
    expect(queryClient.setQueryData).toHaveBeenCalledWith(monthlyTrackerQueryKey, rows);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: planKey });
  });

  it("invalidates plan, plan list, and tracker state after plan management mutations", () => {
    const queryClient = {
      invalidateQueries: vi.fn(),
    };
    const planKey = ["financial-plan", "auth", "user-123"] as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatePlanManagementCaches(queryClient as any, planKey);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: planKey });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: plansQueryKey });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: monthlyTrackerQueryKey });
  });

  it("merges year-scoped data without discarding entries from other years", () => {
    const existingRows = [
      { month: "2026-05", status: "completed", amount: 100000, note: null },
      { month: "2027-01", status: "partial", amount: 50000, note: null },
    ];
    const queryClient = {
      getQueryData: vi.fn().mockReturnValue(existingRows),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    };
    const planKey = ["financial-plan", "auth", "user-123"] as const;
    const incoming = [{ month: "2027-01", status: "completed", amount: 80000, note: "bonus" }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMonthlyTrackerCache(queryClient as any, planKey, incoming as never);

    // Should keep 2026 entries, replace 2027 entries
    expect(queryClient.setQueryData).toHaveBeenCalledWith(monthlyTrackerQueryKey, [
      existingRows[0], // 2026-05 kept
      incoming[0],     // 2027-01 replaced
    ]);
  });
});
