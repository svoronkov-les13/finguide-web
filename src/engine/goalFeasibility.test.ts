import { describe, expect, it } from "vitest";
import { computeGoalFeasibility } from "@/engine/goalFeasibility";
import type { Goal } from "@/types/finance";

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "g1",
    name: "Test Goal",
    icon: "Target",
    targetYear: 2030,
    cost: 1_000_000,
    saved: 200_000,
    growth: 0.05,
    reachable: true,
    ...overrides,
  };
}

describe("computeGoalFeasibility", () => {
  it("returns zeros for empty goals", () => {
    const result = computeGoalFeasibility([], 50_000, 2026);
    expect(result).toEqual({ reachableCount: 0, totalCount: 0, weightedPct: 0, monthlyDeficit: 0 });
  });

  it("counts reachable goals", () => {
    const goals = [
      makeGoal({ id: "g1", reachable: true }),
      makeGoal({ id: "g2", reachable: false }),
      makeGoal({ id: "g3", reachable: true }),
    ];
    const result = computeGoalFeasibility(goals, 50_000, 2026);
    expect(result.reachableCount).toBe(2);
    expect(result.totalCount).toBe(3);
  });

  it("computes weighted percentage from projected fields", () => {
    const goals = [
      makeGoal({ id: "g1", projectedCost: 1_000_000, projectedSaved: 500_000 }),
      makeGoal({ id: "g2", projectedCost: 500_000, projectedSaved: 500_000 }),
    ];
    // Total projected cost = 1.5M, total projected saved = 1M → 67%
    const result = computeGoalFeasibility(goals, 50_000, 2026);
    expect(result.weightedPct).toBe(67);
  });

  it("falls back to cost/saved when projected fields missing", () => {
    const goals = [makeGoal({ cost: 1_000_000, saved: 300_000 })];
    const result = computeGoalFeasibility(goals, 50_000, 2026);
    expect(result.weightedPct).toBe(30);
  });

  it("caps weighted percentage at 100", () => {
    const goals = [makeGoal({ projectedCost: 100_000, projectedSaved: 200_000 })];
    const result = computeGoalFeasibility(goals, 50_000, 2026);
    expect(result.weightedPct).toBe(100);
  });

  it("computes monthly deficit when savings insufficient", () => {
    // 800K remaining, 48 months to 2030 → ~16.7K/mo needed
    // Current savings: 10K/mo → deficit ≈ 6.7K
    const goals = [makeGoal({ cost: 1_000_000, saved: 200_000, targetYear: 2030 })];
    const result = computeGoalFeasibility(goals, 10_000, 2026);
    expect(result.monthlyDeficit).toBeGreaterThan(0);
    expect(result.monthlyDeficit).toBeLessThan(10_000);
  });

  it("returns zero deficit when savings cover all goals", () => {
    const goals = [makeGoal({ cost: 100_000, saved: 90_000, targetYear: 2030 })];
    // Only 10K remaining over 48 months → ~208/mo. Current savings 50K/mo → no deficit
    const result = computeGoalFeasibility(goals, 50_000, 2026);
    expect(result.monthlyDeficit).toBe(0);
  });

  it("handles goals with current year target", () => {
    const goals = [makeGoal({ cost: 100_000, saved: 50_000, targetYear: 2026 })];
    // 0 months remaining → clamps to 1 month
    const result = computeGoalFeasibility(goals, 10_000, 2026);
    expect(result.monthlyDeficit).toBeGreaterThan(0);
  });
});
