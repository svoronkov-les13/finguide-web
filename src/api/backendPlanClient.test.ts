// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { backendPlanClient, cashflowGrowthRangesFromSchedule, cashflowGrowthScheduleFromRanges, goalFromApi, goalRequestFromGoal, mapDashboardSnapshot, mapMonthlyForecastPoint, mapScenarioComparisonForecasts, monthlyTrackerFromApi, trackerEntryFromApi, trackerEntryRequest, unwrapData } from "@/api/backendPlanClient";
import type { TrackerEntry } from "@/types/finance";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("backendPlanClient response handling", () => {
  it("throws backend errors instead of silently accepting failed settings updates", () => {
    expect(() => unwrapData({ status: 403, data: { error: { message: "Plan is read-only" } } }, "PATCH /analytics/assumptions")).toThrow(
      "PATCH /analytics/assumptions failed with HTTP 403: Plan is read-only",
    );
  });
});

describe("backendPlanClient plan management", () => {
  it("calls plan management endpoints and unwraps summaries", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      if (url.endsWith("/plans") && !init?.method) {
        return jsonResponse({ data: [{ id: "plan-1", name: "Основной", current: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }] });
      }
      if (url.endsWith("/plans") && init?.method === "POST") {
        return jsonResponse({ data: { id: "plan-2", name: body.name, current: true, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" } }, 201);
      }
      if (url.endsWith("/plans/plan-1/copy") && init?.method === "POST") {
        return jsonResponse({ data: { id: "plan-3", name: body.name, current: true, createdAt: "2026-01-03T00:00:00Z", updatedAt: "2026-01-03T00:00:00Z" } }, 201);
      }
      if (url.endsWith("/plans/current") && init?.method === "PUT") {
        return jsonResponse({ data: { id: body.planId, name: "Основной", current: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" } });
      }
      throw new Error(`Unexpected request ${init?.method ?? "GET"} ${url}`);
    });

    await expect(backendPlanClient.listPlans()).resolves.toHaveLength(1);
    await expect(backendPlanClient.createPlan("Новый")).resolves.toMatchObject({ id: "plan-2", name: "Новый", current: true });
    await expect(backendPlanClient.copyPlan("plan-1", "Копия")).resolves.toMatchObject({ id: "plan-3", name: "Копия", current: true });
    await expect(backendPlanClient.switchPlan("plan-1")).resolves.toMatchObject({ id: "plan-1", current: true });

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe("backendPlanClient settings mutations", () => {
  it("updates the model inflation schedule when general inflation changes", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      requests.push({ url, body });

      if (url.endsWith("/plans/current") && method === "GET") {
        return jsonResponse({ data: planState([]) });
      }
      if (url.endsWith("/plans/plan-1/analytics/assumptions") && method === "PATCH") {
        return jsonResponse({ data: body });
      }
      if (url.endsWith("/plans/plan-1/pension") && method === "PATCH") {
        return jsonResponse({ data: body });
      }
      if (url.endsWith("/dashboard")) return jsonResponse({ data: dashboardMetrics() });
      if (url.endsWith("/analytics/cashflow")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/cashflow/monthly")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/health")) return jsonResponse({ data: { score: 80, status: "good", signals: [] } });
      if (url.endsWith("/scenarios")) return jsonResponse({ data: [] });
      if (url.endsWith("/tracker/entries")) return jsonResponse({ data: [] });

      throw new Error(`Unexpected request ${method} ${url}`);
    });

    await backendPlanClient.getPlan();
    await backendPlanClient.updateSettings({ inflation: 0.09 });

    const assumptionsPatch = requests.find((request) => request.url.endsWith("/plans/plan-1/analytics/assumptions"))?.body as {
      inflationSchedule?: Array<{ year: number; ratePct: number }>;
    };
    expect(assumptionsPatch.inflationSchedule).toEqual([{ year: 2026, ratePct: 9 }]);
  });

  it("saves pension-specific state without resetting general inflation", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      requests.push({ url, body });

      if (url.endsWith("/plans/current") && method === "GET") return jsonResponse({ data: planState([], { pension: { inflationPct: 0 } }) });
      if (url.endsWith("/plans/plan-1/analytics/assumptions") && method === "PATCH") return jsonResponse({ data: body });
      if (url.endsWith("/plans/plan-1/pension") && method === "PATCH") return jsonResponse({ data: body });
      if (url.endsWith("/dashboard")) return jsonResponse({ data: dashboardMetrics() });
      if (url.endsWith("/analytics/cashflow")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/cashflow/monthly")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/health")) return jsonResponse({ data: { score: 80, status: "good", signals: [] } });
      if (url.endsWith("/scenarios")) return jsonResponse({ data: [] });
      if (url.endsWith("/tracker/entries")) return jsonResponse({ data: [] });
      throw new Error(`Unexpected request ${method} ${url}`);
    });

    await backendPlanClient.getPlan();
    await backendPlanClient.updateSettings({
      pensionInvestmentReturn: 0.12,
      retirementAge: 62,
      statePensionMonthly: 35_000,
      statePensionEnabled: true,
      withdrawalStrategy: "preserve_capital",
    });

    const assumptionsPatch = requests.find((request) => request.url.endsWith("/plans/plan-1/analytics/assumptions"))?.body as {
      investmentReturnPct?: number;
      inflationSchedule?: Array<{ year: number; ratePct: number }>;
    };
    const pensionPatch = requests.find((request) => request.url.endsWith("/plans/plan-1/pension"))?.body as {
      inflationPct?: number;
      retirementAge?: number;
      statePensionMonthly?: number;
      statePensionEnabled?: boolean;
      withdrawalStrategy?: string;
      expectedReturnPct?: number;
    };

    expect(assumptionsPatch.investmentReturnPct).toBe(10);
    expect(assumptionsPatch.inflationSchedule).toEqual([{ year: 2026, ratePct: 7 }]);
    expect(pensionPatch).toMatchObject({
      inflationPct: 7,
      retirementAge: 62,
      statePensionMonthly: 35_000,
      statePensionEnabled: true,
      withdrawalStrategy: "preserve_capital",
      expectedReturnPct: 12,
    });
  });

  it("saves separate pension and dashboard calculation periods from general settings", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      requests.push({ url, body });

      if (url.endsWith("/plans/current") && method === "GET") return jsonResponse({ data: planState([]) });
      if (url.endsWith("/plans/plan-1/analytics/assumptions") && method === "PATCH") return jsonResponse({ data: body });
      if (url.endsWith("/plans/plan-1/pension") && method === "PATCH") return jsonResponse({ data: body });
      if (url.endsWith("/dashboard")) return jsonResponse({ data: dashboardMetrics() });
      if (url.endsWith("/analytics/cashflow")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/cashflow/monthly")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/health")) return jsonResponse({ data: { score: 80, status: "good", signals: [] } });
      if (url.endsWith("/scenarios")) return jsonResponse({ data: [] });
      if (url.endsWith("/tracker/entries")) return jsonResponse({ data: [] });
      throw new Error(`Unexpected request ${method} ${url}`);
    });

    await backendPlanClient.getPlan();
    await backendPlanClient.updateSettings({
      birthYear: 1990,
      pensionCalculationYears: 25,
      dashboardCalculationYears: 15,
    });

    const assumptionsPatch = requests.find((request) => request.url.endsWith("/plans/plan-1/analytics/assumptions"))?.body as {
      birthYear?: number;
      horizonYears?: number;
    };
    const pensionPatch = requests.find((request) => request.url.endsWith("/plans/plan-1/pension"))?.body as {
      currentAge?: number;
      retirementAge?: number;
    };

    expect(assumptionsPatch).toMatchObject({
      birthYear: 1990,
      horizonYears: 15,
    });
    expect(pensionPatch).toMatchObject({
      currentAge: 36,
      retirementAge: 61,
    });
  });
});

describe("backendPlanClient cashflow growth ranges", () => {
  it("maps growth schedules to UI ranges and expands ranges back to per-year rates", () => {
    expect(cashflowGrowthRangesFromSchedule([
      { year: 2026, ratePct: 3 },
      { year: 2027, ratePct: 3 },
      { year: 2028, ratePct: 5 },
      { year: 2029, ratePct: 5 },
    ])).toEqual([
      { startYear: 2026, endYear: 2028, growthPercent: 3 },
      { startYear: 2028, endYear: 2030, growthPercent: 5 },
    ]);

    expect(cashflowGrowthScheduleFromRanges([
      { startYear: 2026, endYear: 2028, growthPercent: 3 },
      { startYear: 2028, endYear: 2030, growthPercent: 5 },
    ], 2030)).toEqual([
      { year: 2026, ratePct: 3 },
      { year: 2027, ratePct: 3 },
      { year: 2028, ratePct: 5 },
      { year: 2029, ratePct: 5 },
    ]);
  });
});

describe("backendPlanClient goal mutations", () => {
  it("rereads analytics after adding a goal so the nearest goal and dashboard forecast recalculate immediately", async () => {
    const initialGoal = apiGoal({ id: "goal-1", name: "Подушка", priority: 1 });
    const createdGoal = apiGoal({ id: "goal-2", name: "Отпуск", priority: 2, targetYear: 2026, currentCost: 500_000 });
    let mutationPhase = false;
    const heavyRequestsAfterMutation: string[] = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (mutationPhase && isHeavyPlanRead(url)) {
        heavyRequestsAfterMutation.push(url);
      }

      if (url.endsWith("/plans/current") && method === "GET") {
        return jsonResponse({ data: planState(mutationPhase ? [initialGoal, createdGoal] : [initialGoal]) });
      }
      if (url.endsWith("/dashboard")) {
        return jsonResponse({
          data: {
            ...dashboardMetrics(),
            monthlyGoalContribution: mutationPhase ? 500_000 : 100_000,
          },
        });
      }
      if (url.endsWith("/analytics/cashflow")) {
        return jsonResponse({
          data: mutationPhase
            ? [{ year: 2026, age: 33, totalIncome: 1_000_000, totalExpenses: 100_000, totalGoalExpenses: 500_000, netSavings: 400_000, capitalEndOfYear: 2_400_000 }]
            : [],
        });
      }
      if (url.endsWith("/analytics/cashflow/monthly")) return jsonResponse({ data: [] });
      if (url.endsWith("/analytics/health")) return jsonResponse({ data: { score: 80, status: "good", signals: [] } });
      if (url.endsWith("/scenarios")) return jsonResponse({ data: [] });
      if (url.endsWith("/tracker/entries")) return jsonResponse({ data: [] });
      if (url.endsWith("/plans/plan-1/goals") && method === "POST") {
        return jsonResponse({ data: createdGoal }, 201);
      }

      throw new Error(`Unexpected request ${method} ${url}`);
    });

    await backendPlanClient.getPlan();
    mutationPhase = true;

    const updated = await backendPlanClient.addGoal({
      name: "Отпуск",
      icon: "Plane",
      targetYear: 2027,
      targetMonth: 8,
      priority: 2,
      cost: 500_000,
      saved: 0,
      growth: 0.07,
      reachable: true,
      type: "onetime",
    });

    expect(heavyRequestsAfterMutation.some((url) => url.endsWith("/dashboard"))).toBe(true);
    expect(heavyRequestsAfterMutation.some((url) => url.endsWith("/analytics/cashflow"))).toBe(true);
    expect(updated.dashboardSnapshot?.monthlyTargetRub).toBe(500_000);
    expect(updated.forecast[0]).toMatchObject({ year: 2026, goals: -500_000 });
    expect(updated.goals.map((goal) => goal.id)).toEqual(["goal-1", "goal-2"]);
    expect(updated.goals.at(-1)).toMatchObject({ id: "goal-2", name: "Отпуск", targetYear: 2026, cost: 500_000 });
  });
});

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


describe("backendPlanClient monthly cashflow mapping", () => {
  it("maps monthly cashflow to forecast points for dashboard line chart", () => {
    expect(mapMonthlyForecastPoint({
      month: "2026-01",
      year: 2026,
      monthNumber: 1,
      age: 33,
      income: 345_000,
      expenses: 149_000,
      goalExpenses: 0,
      netSavings: 5_000,
      capitalEndOfMonth: 2_505_000,
    })).toEqual({
      year: 2026,
      age: 33,
      month: "2026-01",
      monthNumber: 1,
      label: "янв 2026",
      income: 345_000,
      expenses: -149_000,
      goals: -0,
      savings: 5_000,
      capital: 2_505_000,
    });
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

  it("preserves goal target month when reading and saving goals", () => {
    const goal = goalFromApi({
      id: "goal-1",
      name: "Отпуск",
      icon: "Plane",
      currentCost: 500_000,
      savedAmount: 100_000,
      currency: "RUB",
      targetYear: 2026,
      targetMonth: 7,
      priority: 1,
      type: "one_time",
      growthType: "manual",
      growthPct: 5,
    } as never, 2037);

    expect(goal.targetMonth).toBe(7);
    expect(goalRequestFromGoal(goal, 1)).toMatchObject({ targetYear: 2026, targetMonth: 7 });
  });
});

function jsonResponse(payload: unknown, status = 200) {
  return Promise.resolve({
    status,
    headers: new Headers(),
    text: () => Promise.resolve(JSON.stringify(payload)),
  } as Response);
}

function isHeavyPlanRead(url: string) {
  return url.includes("/dashboard")
    || url.includes("/analytics/")
    || url.includes("/tracker/entries")
    || url.endsWith("/scenarios")
    || url.endsWith("/scenarios/compare");
}

function apiGoal(overrides: Record<string, unknown> = {}) {
  return {
    id: "goal-1",
    name: "Цель",
    icon: "Target",
    currentCost: 1_000_000,
    savedAmount: 0,
    currency: "RUB",
    targetYear: 2027,
    targetMonth: 12,
    priority: 1,
    type: "one_time",
    growthType: "inflation",
    growthPct: 7,
    projectedTargetCost: 1_070_000,
    projectedSavedAmount: 0,
    projectedProgressPct: 0,
    projectedReachable: false,
    ...overrides,
  };
}

function planState(goals: unknown[], overrides: { pension?: Record<string, unknown> } = {}) {
  const state = {
    id: "plan-1",
    name: "Основной",
    profile: {
      name: "User",
      email: "user@example.com",
      age: 33,
      initialBalance: 2_000_000,
    },
    pension: {
      currentAge: 33,
      retirementAge: 60,
      monthlyExpenses: 150_000,
      desiredMonthlyExpensesCurrentPrices: 150_000,
      expectedReturnPct: 10,
      inflationPct: 7,
      withdrawalStrategy: "spend_down_30y",
      statePensionEnabled: false,
      statePensionMonthly: 0,
    },
    modelAssumptions: {
      startYear: 2026,
      birthYear: 1993,
      monthsPerYear: 12,
      initialCapital: 2_000_000,
      investmentReturnPct: 10,
      inflationSchedule: [{ year: 2026, ratePct: 7 }],
      projectionEndYear: 2036,
    },
    incomes: [],
    expenses: [],
    goals,
  };
  return {
    ...state,
    pension: {
      ...state.pension,
      ...overrides.pension,
    },
  };
}

function dashboardMetrics() {
  return {
    totalMonthlyIncome: 300_000,
    totalYearlyIncome: 3_600_000,
    totalMonthlyExpenses: 150_000,
    totalYearlyExpenses: 1_800_000,
    netMonthlyBalance: 150_000,
    netYearlyBalance: 1_800_000,
    savingsRatePct: 50,
    totalGoalsCost: 1_000_000,
    totalGoalsSaved: 0,
    totalGoalsRemaining: 1_000_000,
    monthlyGoalContribution: 100_000,
    availableForPension: 50_000,
    projectedPensionCapital: 10_000_000,
    yearsToRetirement: 27,
    emergencyFundTarget: 900_000,
    emergencyFundCurrent: 0,
    emergencyFundPct: 0,
    yearlyProjection: [],
  };
}
