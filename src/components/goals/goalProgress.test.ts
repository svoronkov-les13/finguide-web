import { describe, expect, it } from "vitest";
import { goalIsActuallyAchieved, goalProgress } from "@/components/goals/goalProgress";
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

const BEFORE_DEADLINE = new Date(2026, 8, 29);
const AFTER_DEADLINE = new Date(2028, 0, 15);

describe("goalProgress", () => {
  it("uses projected allocation when available", () => {
    expect(goalProgress(baseGoal, BEFORE_DEADLINE)).toEqual({
      cost: 1_605_000,
      saved: 1_605_000,
      percent: 100,
      funded: true,
      achieved: false,
    });
  });

  it("adds projected allocation to the factual saved amount", () => {
    expect(goalProgress({ ...baseGoal, saved: 500_000, projectedSaved: 250_000 }, BEFORE_DEADLINE)).toEqual({
      cost: 1_605_000,
      saved: 750_000,
      percent: 47,
      funded: false,
      achieved: false,
    });
  });

  it("marks a funded goal achieved once its target date has come", () => {
    expect(goalProgress({ ...baseGoal, saved: 1_500_000 }, AFTER_DEADLINE)).toEqual({
      cost: 1_605_000,
      saved: 1_605_000,
      percent: 100,
      funded: true,
      achieved: true,
    });
  });

  it("keeps a future goal funded by projected allocation reachable, not achieved", () => {
    expect(goalProgress({
      ...baseGoal,
      cost: 100_000,
      projectedCost: 100_000,
      saved: 0,
      projectedSaved: 100_000,
      projectedProgressPct: 100,
    }, BEFORE_DEADLINE)).toMatchObject({ percent: 100, funded: true, achieved: false });
  });

  it("does not mark an underfunded goal achieved after its target date", () => {
    expect(goalProgress({ ...baseGoal, projectedSaved: 800_000 }, AFTER_DEADLINE)).toMatchObject({
      funded: false,
      achieved: false,
    });
  });
});

describe("goalIsActuallyAchieved", () => {
  const fullyProjected: Goal = {
    ...baseGoal,
    cost: 75_000_000,
    projectedCost: 75_000_000,
    saved: 0,
    projectedSaved: 75_000_000,
    projectedProgressPct: 100,
  };

  it("does not call a funded goal achieved before its target month", () => {
    expect(goalIsActuallyAchieved({ ...fullyProjected, targetYear: 2026, targetMonth: 12 }, BEFORE_DEADLINE)).toBe(false);
  });

  it("calls a funded goal achieved from its target month on", () => {
    expect(goalIsActuallyAchieved({ ...fullyProjected, targetYear: 2026, targetMonth: 9 }, BEFORE_DEADLINE)).toBe(true);
    expect(goalIsActuallyAchieved(fullyProjected, AFTER_DEADLINE)).toBe(true);
  });
});
