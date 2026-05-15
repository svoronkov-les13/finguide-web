import { describe, expect, it } from "vitest";
import { trackingActiveGoal } from "@/pages/trackingGoal";
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
});
