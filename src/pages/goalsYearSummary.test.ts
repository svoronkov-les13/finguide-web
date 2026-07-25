import { describe, expect, it } from "vitest";
import { goalPortfolioSummary, goalYearSummary, goalProjectedCost } from "@/pages/goalsYearSummary";
import type { Goal } from "@/types/finance";

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: "goal",
    name: "Goal",
    icon: "Target",
    targetYear: 2026,
    cost: 1000,
    saved: 0,
    growth: 0,
    reachable: true,
    ...overrides,
  };
}

describe("goalProjectedCost", () => {
  it("uses inflation-adjusted projected cost when available", () => {
    expect(goalProjectedCost(goal({ cost: 1_000_000, projectedCost: 1_180_000 }))).toBe(1_180_000);
  });

  it("falls back to the base cost", () => {
    expect(goalProjectedCost(goal({ cost: 1_000_000 }))).toBe(1_000_000);
  });
});

describe("goalYearSummary", () => {
  it("summarizes projected total, remaining amount, and monthly need until year end", () => {
    const goals = [
      goal({ id: "car", targetYear: 2026, cost: 1_000_000, projectedCost: 1_180_000, saved: 180_000 }),
      goal({ id: "trip", targetYear: 2026, cost: 240_000, saved: 40_000 }),
      goal({ id: "future", targetYear: 2027, cost: 500_000, saved: 0 }),
    ];

    expect(goalYearSummary(goals, 2026, 2026, 5)).toEqual({
      totalProjectedCost: 1_420_000,
      remaining: 1_200_000,
      monthlyUntilYearEnd: 171_429,
      saved: 220_000,
    });
  });

  it("includes projected allocations and respects target months for the monthly need", () => {
    const goals = [
      goal({ id: "trip", targetYear: 2027, targetMonth: 1, cost: 451_500, projectedCost: 451_500, saved: 0, projectedSaved: 203_175 }),
      goal({ id: "april", targetYear: 2027, targetMonth: 4, cost: 550_000, projectedCost: 550_000, saved: 0 }),
      goal({ id: "repair", targetYear: 2027, targetMonth: 12, cost: 7_280_000, projectedCost: 7_280_000, saved: 0 }),
    ];

    expect(goalYearSummary(goals, 2027, 2026, 6)).toEqual({
      totalProjectedCost: 8_281_500,
      remaining: 8_078_325,
      monthlyUntilYearEnd: 494_919,
      saved: 203_175,
    });
  });
});

describe("goalPortfolioSummary", () => {
  it("uses inflation-adjusted projected costs for the total goals amount", () => {
    const goals = [
      goal({ id: "car", cost: 1_000_000, projectedCost: 1_180_000, saved: 180_000 }),
      goal({ id: "trip", cost: 240_000, saved: 40_000 }),
    ];

    expect(goalPortfolioSummary(goals)).toEqual({
      totalProjectedCost: 1_420_000,
      totalSaved: 220_000,
      accumulatedPercent: 15,
    });
  });

  it("includes projected allocations in the accumulated percentage", () => {
    const goals = [
      goal({ id: "trip", cost: 451_500, projectedCost: 451_500, saved: 0, projectedSaved: 203_175 }),
      goal({ id: "april", cost: 550_000, projectedCost: 550_000, saved: 0 }),
      goal({ id: "repair", cost: 7_280_000, projectedCost: 7_280_000, saved: 0 }),
    ];

    expect(goalPortfolioSummary(goals)).toEqual({
      totalProjectedCost: 8_281_500,
      totalSaved: 203_175,
      accumulatedPercent: 2,
    });
  });
});
