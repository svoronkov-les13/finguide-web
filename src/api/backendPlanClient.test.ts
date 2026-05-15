// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { goalFromApi, mapDashboardSnapshot, mapScenarioComparisonForecasts, monthlyTrackerFromApi, trackerEntryFromApi, trackerEntryRequest } from "@/api/backendPlanClient";
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

describe("backendPlanClient monthly tracker mapping", () => {
  it("preserves saved amount returned by backend monthly tracker", () => {
    expect(monthlyTrackerFromApi({
      month: "2026-05",
      status: "completed",
      amount: 150000,
      note: "Saved",
    })).toEqual({
      month: "2026-05",
      status: "completed",
      amount: 150000,
      note: "Saved",
    });
  });
});


describe("backendPlanClient dashboard mapping", () => {
  it("keeps net monthly balance separate from monthly goal contribution", () => {
    const snapshot = mapDashboardSnapshot({
      totalMonthlyIncome: 345000,
      totalYearlyIncome: 4320000,
      totalMonthlyExpenses: 149000,
      totalYearlyExpenses: 1788000,
      netMonthlyBalance: 196000,
      netYearlyBalance: 2532000,
      savingsRatePct: 58.6,
      totalGoalsCost: 1000000,
      totalGoalsSaved: 0,
      totalGoalsRemaining: 1000000,
      monthlyGoalContribution: 193725,
      availableForPension: 2275,
      projectedPensionCapital: 3000000,
      yearsToRetirement: 28,
      emergencyFundTarget: 894000,
      emergencyFundCurrent: 0,
      emergencyFundPct: 0,
      yearlyProjection: [],
    }, { score: 80, status: "good", signals: [] } as never, { retirementAge: 60 } as never, [{ year: 2026, capital: 0 }] as never);

    expect(snapshot.netMonthlyBalanceRub).toBe(196000);
    expect(snapshot.monthlyTargetRub).toBe(193725);
  });
});


describe("backendPlanClient scenario comparison mapping", () => {
  it("maps backend scenario projections into forecast series", () => {
    const forecasts = mapScenarioComparisonForecasts({
      scenarios: [
        {
          scenarioId: "optimistic",
          projection: [{ year: 2026, age: 33, totalIncome: 1_000_000, totalExpenses: 500_000, totalGoalExpenses: 100_000, netSavings: 400_000, capitalEndOfYear: 3_000_000 }],
        },
        {
          scenarioId: "pessimistic",
          projection: [{ year: 2026, age: 33, totalIncome: 900_000, totalExpenses: 600_000, totalGoalExpenses: 100_000, netSavings: 200_000, capitalEndOfYear: 1_000_000 }],
        },
      ],
    } as never);

    expect(forecasts?.optimistic?.[0]).toMatchObject({ year: 2026, capital: 3_000_000 });
    expect(forecasts?.pessimistic?.[0]).toMatchObject({ year: 2026, capital: 1_000_000 });
  });
});


describe("backendPlanClient goal progress mapping", () => {
  it("keeps projected allocation fields separate from contribution-backed saved amount", () => {
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
      priority: 2,
      type: "one_time",
      growthType: "inflation",
      growthPct: 7,
    } as never, 2037);

    expect(goal.priority).toBe(2);
    expect(goal.cost).toBe(1_500_000);
    expect(goal.saved).toBe(0);
    expect(goal.projectedCost).toBe(1_605_000);
    expect(goal.projectedSaved).toBe(1_605_000);
    expect(goal.projectedProgressPct).toBe(100);
    expect(goal.reachable).toBe(true);
  });
});
