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
  it("combines contribution-backed saved amount with projected cashflow allocation", () => {
    expect(goalProgress(baseGoal)).toEqual({
      cost: 1_605_000,
      saved: 1_605_000,
      percent: 100,
      achieved: true,
    });
  });

  it("keeps initial saved amount separate from projected cashflow allocation", () => {
    expect(goalProgress({ ...baseGoal, saved: 500_000, projectedSaved: 250_000 })).toEqual({
      cost: 1_605_000,
      saved: 750_000,
      percent: 47,
      achieved: false,
    });
  });

  it("marks a goal achieved when actual plus projected allocation reaches projected cost", () => {
    expect(goalProgress({ ...baseGoal, saved: 1_000_000, projectedSaved: 605_000 })).toEqual({
      cost: 1_605_000,
      saved: 1_605_000,
      percent: 100,
      achieved: true,
    });
  });
});
