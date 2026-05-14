// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { goalFromApi, trackerEntryFromApi, trackerEntryRequest } from "@/api/backendPlanClient";
import type { TrackerEntry } from "@/types/finance";

describe("backendPlanClient tracker journal mapping", () => {
  it("maps UI tracker entries to backend journal requests", () => {
    const entry: Omit<TrackerEntry, "id"> = {
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    };

    expect(trackerEntryRequest(entry)).toEqual({
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    });
  });

  it("maps backend journal entries back to UI tracker entries", () => {
    expect(trackerEntryFromApi({
      id: "entry-1",
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    })).toEqual({
      id: "entry-1",
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    });
  });
});


describe("backendPlanClient goal progress mapping", () => {
  it("uses projected allocation fields for goal progress", () => {
    const goal = goalFromApi({
      id: "goal-1",
      name: "Финансовая подушка",
      icon: "shield",
      currentCost: 1_500_000,
      savedAmount: 0,
      projectedTargetCost: 1_605_000,
      projectedSavedAmount: 1_605_000,
      projectedProgressPct: 100,
      projectedReachable: true,
      projectedCompletionYear: 2026,
      currency: "RUB",
      targetYear: 2027,
      type: "one_time",
      growthType: "inflation",
      growthPct: 7,
      priority: 1,
    } as never, 2037);

    expect(goal.cost).toBe(1_500_000);
    expect(goal.saved).toBe(0);
    expect(goal.projectedCost).toBe(1_605_000);
    expect(goal.projectedSaved).toBe(1_605_000);
    expect(goal.projectedProgressPct).toBe(100);
    expect(goal.reachable).toBe(true);
  });
});
