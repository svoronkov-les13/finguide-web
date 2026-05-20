import { describe, expect, it } from "vitest";
import { sortDashboardGoals } from "@/components/dashboard/dashboardGoals";
import type { Goal } from "@/types/finance";

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: "goal",
    name: "Goal",
    icon: "Target",
    targetYear: 2026,
    targetMonth: 12,
    priority: 1,
    cost: 100_000,
    saved: 0,
    growth: 0,
    reachable: true,
    ...overrides,
  };
}

describe("sortDashboardGoals", () => {
  it("sorts goals by target date then priority", () => {
    const goals = [
      goal({ id: "late-high-priority", targetYear: 2027, targetMonth: 1, priority: 1 }),
      goal({ id: "same-month-low-priority", targetYear: 2026, targetMonth: 5, priority: 3 }),
      goal({ id: "same-month-high-priority", targetYear: 2026, targetMonth: 5, priority: 1 }),
      goal({ id: "early", targetYear: 2026, targetMonth: 4, priority: 5 }),
      goal({ id: "missing-month-defaults-december", targetYear: 2026, targetMonth: undefined, priority: 1 }),
    ];

    expect(sortDashboardGoals(goals).map((item) => item.id)).toEqual([
      "early",
      "same-month-high-priority",
      "same-month-low-priority",
      "missing-month-defaults-december",
      "late-high-priority",
    ]);
  });
});
