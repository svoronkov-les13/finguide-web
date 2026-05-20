import { describe, expect, it } from "vitest";
import { makeEmptyYear, monthFormTarget, monthlyNormTarget, shouldShowEmptyAmountPlaceholder } from "@/pages/trackingMonths";

describe("makeEmptyYear", () => {
  it("marks past months in the current year as pending (not missed) when no data exists", () => {
    const months = makeEmptyYear(2026, 2026, 4);

    // Past months without data are 'pending' — only explicit user action creates 'missed'
    expect(months[0].status).toBe("pending");
    expect(months[3].status).toBe("pending");
    expect(months[4].status).toBe("current");
    expect(months[5].status).toBe("pending");
  });

  it("marks months from previous years as pending when no data exists", () => {
    const months = makeEmptyYear(2025, 2026, 4);

    // All months pending — they default to plan in resolveMonthlyActuals
    expect(months.every((month) => month.status === "pending")).toBe(true);
  });

  it("does not show an extra placeholder for pending months because the status label already says ahead", () => {
    expect(shouldShowEmptyAmountPlaceholder("pending")).toBe(false);
  });

  it("uses the nearest-goal target for month form completion", () => {
    expect(monthFormTarget({ allGoalsTarget: 305_283, nearestGoalTarget: 66_875 })).toBe(66_875);
  });

  it("shows the monthly norm from backend monthly goal contribution, not recalculated net balance", () => {
    expect(monthlyNormTarget({ monthlyTarget: 196_000, netMonthlyBalance: 85_000 })).toBe(196_000);
  });
});
