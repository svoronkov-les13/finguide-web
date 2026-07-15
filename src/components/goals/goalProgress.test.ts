import { describe, expect, it } from "vitest";
import { goalProgress } from "@/components/goals/goalProgress";
import type { Goal } from "@/types/finance";

const baseGoal: Goal = {
  id: "goal-1",
  name: "Финансовая подушка",
  icon: "Shield",
  targetYear: 2027,
  cost: 1_500_000,
  saved: 0,
  projectedCost: 1_605_000,
  projectedSaved: 1_605_000,
  projectedProgressPct: 100,
  growth: 0.07,
  reachable: true,
  type: "onetime",
};

describe("goalProgress", () => {
  it("uses contribution-backed saved amount instead of projected allocation", () => {
    expect(goalProgress(baseGoal)).toEqual({
      cost: 1_500_000,
      saved: 0,
      percent: 0,
      achieved: false,
    });
  });

  it("does not add projected cashflow allocation to displayed saved amount", () => {
    expect(goalProgress({ ...baseGoal, saved: 500_000, projectedSaved: 250_000 })).toEqual({
      cost: 1_500_000,
      saved: 500_000,
      percent: 33,
      achieved: false,
    });
  });

  it("marks a goal achieved only when factual saved amount reaches cost", () => {
    expect(goalProgress({ ...baseGoal, saved: 1_500_000 })).toEqual({
      cost: 1_500_000,
      saved: 1_500_000,
      percent: 100,
      achieved: true,
    });
  });
});
