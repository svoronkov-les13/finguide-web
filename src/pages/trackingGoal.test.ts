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

  it("uses target year before priority for the next incomplete goal", () => {
    const first = { ...goal({ id: "first", name: "First", targetYear: 2027, saved: 1000, cost: 1000 }), priority: 1 } as Goal;
    const apartment = { ...goal({ id: "apartment", name: "Apartment", targetYear: 2029, saved: 0, cost: 5000 }), priority: 2 } as Goal;
    const car = { ...goal({ id: "car", name: "Car", targetYear: 2028, saved: 0, cost: 3000 }), priority: 3 } as Goal;

    expect(trackingActiveGoal([first, apartment, car])).toBe(car);
  });
});
