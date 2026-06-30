import { describe, expect, it } from "vitest";
import { resolveGoalDefaultGrowthPercent } from "@/components/goals/GoalModal";

describe("GoalModal indexation defaults", () => {
  it("uses general inflation for a new goal default growth", () => {
    expect(resolveGoalDefaultGrowthPercent(null, 0.075)).toBe(7.5);
  });

  it("keeps an existing goal growth instead of replacing it with general inflation", () => {
    expect(resolveGoalDefaultGrowthPercent({ growth: 0.03 }, 0.075)).toBe(3);
  });
});
