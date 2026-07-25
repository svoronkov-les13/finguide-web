import { describe, expect, it } from "vitest";
import { goalSavingNeeds, nearestGoalMonthlyTarget, trackingActiveGoal, trackingGoalProgress } from "@/pages/trackingGoal";
import type { Goal } from "@/types/finance";

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: "goal",
    name: "Goal",
    icon: "Target",
    targetYear: 2027,
    cost: 1000,
    saved: 0,
    growth: 0,
    reachable: true,
    ...overrides,
  };
}

describe("trackingActiveGoal", () => {
  it("selects the next incomplete goal after the current goal is fully funded", () => {
    const first = goal({ id: "first", name: "First", saved: 1000, cost: 1000, reachable: true });
    const second = goal({ id: "second", name: "Second", saved: 100, cost: 2000, reachable: true });

    expect(trackingActiveGoal([first, second])).toBe(second);
  });

  it("selects the next incomplete goal after projected allocation closes the current goal", () => {
    const first = goal({ id: "first", name: "First", saved: 0, cost: 1000, projectedSaved: 1000, reachable: true });
    const second = goal({ id: "second", name: "Second", saved: 100, cost: 2000, reachable: true });

    expect(trackingActiveGoal([first, second])).toBe(second);
  });

  it("keeps a goal active until inflation-adjusted cost is funded", () => {
    const first = goal({ id: "first", name: "First", saved: 1000, cost: 1000, projectedCost: 1200 });
    const second = goal({ id: "second", name: "Second", saved: 0, cost: 2000 });

    expect(trackingActiveGoal([first, second])).toBe(first);
  });

  it("uses target year before priority for the next incomplete goal", () => {
    const first = { ...goal({ id: "first", name: "First", targetYear: 2027, saved: 1000, cost: 1000 }), priority: 1 } as Goal;
    const apartment = { ...goal({ id: "apartment", name: "Apartment", targetYear: 2029, saved: 0, cost: 5000 }), priority: 2 } as Goal;
    const car = { ...goal({ id: "car", name: "Car", targetYear: 2028, saved: 0, cost: 3000 }), priority: 3 } as Goal;

    expect(trackingActiveGoal([first, apartment, car])).toBe(car);
  });

  it("uses target month before manual priority within the same year", () => {
    const decemberGoal = goal({ id: "december", name: "December", targetYear: 2027, targetMonth: 12, priority: 1 });
    const augustGoal = goal({ id: "august", name: "August", targetYear: 2027, targetMonth: 8, priority: 2 });

    expect(trackingActiveGoal([decemberGoal, augustGoal])).toBe(augustGoal);
  });

  it("computes the monthly target for the nearest incomplete goal", () => {
    const first = goal({ id: "first", targetYear: 2027, cost: 1_500_000, saved: 0, projectedCost: 1_605_000 });
    const second = goal({ id: "second", targetYear: 2029, cost: 5_000_000, saved: 0, projectedCost: 6_298_560 });

    expect(nearestGoalMonthlyTarget([second, first], 2026)).toBe(66_875);
  });

  it("summarizes current-year and all-goals monthly needs using inflation-adjusted goal totals", () => {
    const juneGoal = goal({ id: "june", targetYear: 2026, targetMonth: 6, cost: 120_000, projectedCost: 132_000, saved: 20_000 });
    const decemberGoal = goal({ id: "december", targetYear: 2026, targetMonth: 12, cost: 240_000, projectedCost: 264_000, saved: 0 });
    const futureGoal = goal({ id: "future", targetYear: 2027, targetMonth: 3, cost: 330_000, projectedCost: 396_000, saved: 0 });

    expect(goalSavingNeeds([juneGoal, decemberGoal, futureGoal], 2026, 4)).toEqual({
      currentYearSaved: 20_000,
      currentYearTotal: 396_000,
      currentYearMonthly: 89_000,
      allGoalsMonthly: 125_000,
    });
  });

  it("uses the nearest active goal for the year summary when no goal ends this year", () => {
    const futureGoal = goal({
      id: "future",
      targetYear: 2027,
      cost: 1_800_000,
      projectedCost: 2_000_000,
      saved: 100_000,
    });

    expect(goalSavingNeeds([futureGoal], 2026, 5)).toEqual({
      currentYearSaved: 100_000,
      currentYearTotal: 2_000_000,
      currentYearMonthly: 100_000,
      allGoalsMonthly: 100_000,
    });
  });

  it("includes projected cashflow allocation in active goal progress", () => {
    expect(trackingGoalProgress(goal({
      id: "active",
      cost: 550_000,
      saved: 0,
      projectedSaved: 120_000,
    }))).toEqual({
      cost: 550_000,
      saved: 120_000,
      percent: 22,
      achieved: false,
    });
  });
});
