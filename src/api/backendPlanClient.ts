import {
  deletePlansPlanIdExpensesId,
  deletePlansPlanIdGoalsId,
  deletePlansPlanIdIncomesId,
  getPlansCurrent,
  getPlansPlanIdAnalyticsCashflow,
  getPlansPlanIdAnalyticsHealth,
  getPlansPlanIdDashboard,
  getScenarios,
  patchPlansPlanIdAnalyticsAssumptions,
  patchPlansPlanIdExpensesId,
  patchPlansPlanIdGoalsId,
  patchPlansPlanIdIncomesId,
  patchPlansPlanIdPension,
  postPlansPlanIdExpenses,
  postPlansPlanIdGoals,
  postPlansPlanIdGoalsReorder,
  postPlansPlanIdIncomes,
} from "@/shared/api/generated/finguide";
import { clearAuthSession, getValidOidcAuthorizationHeader, oidcAuthEnabled } from "@/auth/oidc";
import { apiBaseUrl, demoBearerToken } from "@/shared/api/baseUrl";
import type {
  CashFlowProjectionPoint,
  DashboardMetrics,
  Goal as ApiGoal,
  HealthScore,
  ModelAssumptions,
  PensionSettings,
  PlanState,
  Scenario as ApiScenario,
} from "@/shared/api/generated/model";
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, MonthlyStatus, MonthlyTrackerEntry, PlanSummary, ScenarioId, TrackerEntry } from "@/types/finance";
import { calculateForecast } from "@/engine/calculateForecast";
import {
  baseExpenseFromCashflow,
  baseIncomeFromCashflow,
  dashboardEndYearFromSettings,
  firstRate,
  goalFromApi,
  goalRequestFromGoal,
  mapDashboardSnapshot,
  mapExpenseCashflow,
  mapForecastPoint,
  mapGoalCashflow,
  mapIncomeCashflow,
  mapMonthlyForecastPoint,
  mapScenarioComparisonForecasts,
  mapScenarios,
  pensionProjectionYearsFromAssumptions,
  trackerEntryFromApi,
  trackerEntryRequest,
} from "@/api/planMappers";
import type { ApiTrackerEntry, ApiScenarioComparison, ApiMonthlyCashflowPoint } from "@/api/planMappers";
export {
  adjustmentPct,
  baseExpenseFromCashflow,
  baseIncomeFromCashflow,
  cashflowGrowthRangesFromSchedule,
  cashflowGrowthScheduleFromRanges,
  dashboardEndYearFromAssumptions,
  dashboardEndYearFromSettings,
  endDateFromYear,
  firstRate,
  goalFromApi,
  goalRequestFromGoal,
  mapDashboardSnapshot,
  mapExpenseCashflow,
  mapForecastPoint,
  mapGoalCashflow,
  mapIncomeCashflow,
  mapMonthlyForecastPoint,
  mapScenarioComparisonForecasts,
  mapScenarios,
  monthLabel,
  pensionProjectionYearsFromAssumptions,
  startDateFromYear,
  toScenarioId,
  toUiCurrency,
  toUiFrequency,
  trackerEntryFromApi,
  trackerEntryRequest,
  yearFromDate,
} from "@/api/planMappers";


type ApiResponse = {
  status: number;
  data: unknown;
};


type ApiPlanSummary = {
  id: string;
  name: string;
  current: boolean;
  createdAt: string;
  updatedAt: string;
};

let activeScenario: ScenarioId = "base";
let lastPlanState: PlanState | undefined;
let lastFinancialPlan: FinancialPlan | undefined;

async function requestOptions(): Promise<RequestInit> {
  const authorization = oidcAuthEnabled ? await getValidOidcAuthorizationHeader() : demoBearerToken ? `Bearer ${demoBearerToken}` : undefined;
  return {
    headers: {
      Accept: "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
    },
  };
}

export function unwrapData<T>(response: ApiResponse, operation: string): T {
  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      clearAuthSession();
    }
    const envelope = response.data as { error?: { message?: string; requestId?: string } } | undefined;
    const detail = envelope?.error?.message ? `: ${envelope.error.message}` : "";
    const requestId = envelope?.error?.requestId ? ` [trace_id: ${envelope.error.requestId}]` : "";
    throw new Error(`${operation} failed with HTTP ${response.status}${detail}${requestId}`);
  }

  const envelope = response.data as { data?: T; error?: { message?: string } } | undefined;
  if (!envelope || !("data" in envelope)) {
    throw new Error(`${operation} returned an invalid API envelope`);
  }

  return envelope.data as T;
}

async function backendJson<T>(path: string, options: RequestInit = {}, operation = path): Promise<T> {
  const baseOptions = await requestOptions();
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...baseOptions,
    ...options,
    headers: {
      ...baseOptions.headers,
      ...options.headers,
    },
  });
  const text = [204, 205, 304].includes(res.status) ? "" : await res.text();
  const data = text ? JSON.parse(text) : undefined;
  return unwrapData<T>({ status: res.status, data }, operation);
}

async function backendNoContent(path: string, options: RequestInit = {}, operation = path) {
  const baseOptions = await requestOptions();
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...baseOptions,
    ...options,
    headers: {
      ...baseOptions.headers,
      ...options.headers,
    },
  });
  if (res.status < 200 || res.status >= 300) {
    if (res.status === 401) {
      clearAuthSession();
    }
    throw new Error(`${operation} failed with HTTP ${res.status}`);
  }
}

async function readBackendPlan() {
  const planState = unwrapData<PlanState>(await getPlansCurrent(await requestOptions()), "GET /plans/current");
  const planId = planState.id;
  const settings = mapSettings(planState, planState.modelAssumptions);

  const [dashboard, cashflow, pensionCashflow, monthlyCashflow, health, scenarios] = await Promise.all([
    getPlansPlanIdDashboard(planId, await requestOptions()).then((response) => unwrapData<DashboardMetrics>(response, "GET /dashboard")),
    getPlansPlanIdAnalyticsCashflow(planId, { years: settings.dashboardCalculationYears }, await requestOptions()).then((response) =>
      unwrapData<CashFlowProjectionPoint[]>(response, "GET /analytics/cashflow"),
    ),
    getPlansPlanIdAnalyticsCashflow(
      planId,
      // The pension chart may extend to age 100, so fetch at least that far.
      { years: Math.max(settings.pensionCalculationYears, 100 - settings.currentAge + 1) },
      await requestOptions(),
    ).then((response) =>
      unwrapData<CashFlowProjectionPoint[]>(response, "GET /analytics/cashflow"),
    ),
    backendJson<ApiMonthlyCashflowPoint[]>(`/plans/${planId}/analytics/cashflow/monthly`, undefined, "GET /analytics/cashflow/monthly")
      .catch(() => [] as ApiMonthlyCashflowPoint[]),
    getPlansPlanIdAnalyticsHealth(planId, await requestOptions()).then((response) => unwrapData<HealthScore>(response, "GET /analytics/health")),
    getScenarios(await requestOptions()).then((response) => unwrapData<ApiScenario[]>(response, "GET /scenarios")),
  ]);

  lastPlanState = planState;

  const [tracker, scenarioForecasts] = await Promise.all([
    backendJson<ApiTrackerEntry[]>(`/plans/${planId}/tracker/entries`, undefined, "GET /tracker/entries")
      .catch(() => [] as ApiTrackerEntry[]), // read-only anonymous demo plan may return empty
    readScenarioForecasts(scenarios),
  ]);

  return mapBackendPlan({ planState, dashboard, cashflow, pensionCashflow, monthlyCashflow, health, scenarios, tracker, scenarioForecasts });
}

async function readScenarioForecasts(scenarios: ApiScenario[]): Promise<FinancialPlan["scenarioForecasts"]> {
  const scenarioIds = ["base", "optimistic", "pessimistic"].filter((id) => scenarios.some((scenario) => scenario.id === id));
  if (scenarioIds.length === 0) return undefined;
  const comparison = await backendJson<ApiScenarioComparison>("/scenarios/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioIds }),
  }, "POST /scenarios/compare");
  return mapScenarioComparisonForecasts(comparison);
}

function mapBackendPlan(input: {
  planState: PlanState;
  dashboard: DashboardMetrics;
  cashflow: CashFlowProjectionPoint[];
  pensionCashflow: CashFlowProjectionPoint[];
  monthlyCashflow: ApiMonthlyCashflowPoint[];
  health: HealthScore;
  scenarios: ApiScenario[];
  tracker: ApiTrackerEntry[];
  scenarioForecasts?: FinancialPlan["scenarioForecasts"];
}): FinancialPlan {
  const { planState, dashboard, cashflow, pensionCashflow, monthlyCashflow, health, scenarios, tracker, scenarioForecasts } = input;
  const assumptions = planState.modelAssumptions;
  const settings = mapSettings(planState, assumptions);
  const planName = (planState as PlanState & { name?: string }).name ?? "Основной план";
  
  const baseForecast = cashflow.map(mapForecastPoint);
  const pensionForecast = pensionCashflow.map(mapForecastPoint);
  const monthlyForecast = monthlyCashflow.map(mapMonthlyForecastPoint);
  const activeScenarioForecast = activeScenario !== "base" ? scenarioForecasts?.[activeScenario] : undefined;
  const forecast = activeScenarioForecast || baseForecast;

  const goals = planState.goals.map((goal) => goalFromApi(goal, forecast.at(-1)?.year ?? settings.startYear));
  const plan: FinancialPlan = {
    planId: planState.id,
    owner: {
      name: planState.profile.name,
      email: planState.profile.email,
      planName,
      tier: "Backend API",
    },
    settings,
    scenarios: mapScenarios(scenarios),
    activeScenario,
    dashboardSnapshot: mapDashboardSnapshot(dashboard, health, planState.pension, forecast),
    cashflows: [
      ...planState.incomes.map((item) => mapIncomeCashflow(item, assumptions)),
      ...planState.expenses.map((item) => mapExpenseCashflow(item, assumptions)),
      ...planState.goals.filter((item) => item.type === "recurring").map((item) => mapGoalCashflow(item, assumptions)),
    ],
    goals,
    tracker: tracker.map(trackerEntryFromApi),
    forecast,
    pensionForecast,
    monthlyForecast,
    scenarioForecasts,
  };

  if (activeScenario === "whatif") {
    plan.forecast = calculateForecast(plan);
    plan.dashboardSnapshot = mapDashboardSnapshot(dashboard, health, planState.pension, plan.forecast);
  }

  lastFinancialPlan = plan;
  return plan;
}

function mapSettings(planState: PlanState, assumptions: ModelAssumptions | undefined) {
  const startYear = assumptions?.startYear ?? new Date().getFullYear();
  const birthYear = assumptions?.birthYear ?? (planState.profile.age ? startYear - planState.profile.age : startYear - planState.pension.currentAge);
  const currentAge = Math.max(0, startYear - birthYear);
  const pensionCalculationYears = pensionProjectionYearsFromAssumptions(assumptions) ?? Math.max(1, planState.pension.retirementAge - currentAge);

  return {
    startYear,
    birthYear,
    currentAge,
    retirementAge: planState.pension.retirementAge,
    pensionCalculationYears,
    dashboardCalculationYears: assumptions?.horizonYears ?? 12,
    monthsInYear: assumptions?.monthsPerYear ?? 12,
    inflation: firstRate(assumptions?.inflationSchedule, planState.pension.inflationPct) / 100,
    investmentReturn: (assumptions?.investmentReturnPct ?? planState.pension.expectedReturnPct) / 100,
    pensionInvestmentReturn: planState.pension.expectedReturnPct / 100,
    startingCapital: assumptions?.initialCapital ?? planState.profile.initialBalance,
    targetMonthlySpend: planState.pension.desiredMonthlyExpensesCurrentPrices ?? planState.pension.monthlyExpenses,
    withdrawalStrategy: planState.pension.withdrawalStrategy,
    statePensionEnabled: planState.pension.statePensionEnabled,
    statePensionMonthly: planState.pension.statePensionMonthly,
  };
}

function findCashflow(id: string) {
  return lastFinancialPlan?.cashflows.find((item) => item.id === id);
}

function findGoal(id: string) {
  return lastFinancialPlan?.goals.find((item) => item.id === id);
}

function currentPlanId() {
  return lastPlanState?.id ?? "plan_demo";
}

export const backendPlanClient = {
  async getPlan() {
    return readBackendPlan();
  },

  async listPlans(): Promise<PlanSummary[]> {
    return backendJson<ApiPlanSummary[]>("/plans", undefined, "GET /plans").then((plans) => plans.map(planSummaryFromApi));
  },

  async createPlan(name: string): Promise<PlanSummary> {
    return backendJson<ApiPlanSummary>("/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }, "POST /plans").then(planSummaryFromApi);
  },

  async copyPlan(planId: string, name: string): Promise<PlanSummary> {
    return backendJson<ApiPlanSummary>(`/plans/${planId}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }, "POST /plans/{planId}/copy").then(planSummaryFromApi);
  },

  async switchPlan(planId: string): Promise<PlanSummary> {
    return backendJson<ApiPlanSummary>("/plans/current", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    }, "PUT /plans/current").then(planSummaryFromApi);
  },

  async setScenario(id: ScenarioId) {
    activeScenario = id;
    return readBackendPlan();
  },

  async updateSettings(patch: EditablePlanPatch) {
    const planId = currentPlanId();
    const current = lastPlanState ?? unwrapData<PlanState>(await getPlansCurrent(await requestOptions()), "GET /plans/current");
    const currentAssumptions = current.modelAssumptions;
    const startYear = patch.startYear ?? currentAssumptions?.startYear ?? new Date().getFullYear();
    const birthYear = patch.birthYear ?? currentAssumptions?.birthYear ?? (current.profile.age ? startYear - current.profile.age : startYear - current.pension.currentAge);
    const currentAge = Math.max(0, startYear - birthYear);
    const pensionCalculationYears = patch.pensionCalculationYears ?? pensionProjectionYearsFromAssumptions(currentAssumptions) ?? Math.max(1, current.pension.retirementAge - currentAge);
    const retirementAge = patch.retirementAge ?? current.pension.retirementAge;
    const pensionInflationPct = patch.inflation !== undefined
      ? patch.inflation * 100
      : firstRate(currentAssumptions?.inflationSchedule, current.pension.inflationPct);

    if (currentAssumptions) {
      unwrapData<ModelAssumptions>(await patchPlansPlanIdAnalyticsAssumptions(
        planId,
        {
          ...currentAssumptions,
          startYear,
          birthYear,
          projectionEndYear: startYear + pensionCalculationYears - 1,
          horizonYears: patch.dashboardCalculationYears ?? currentAssumptions.horizonYears,
          monthsPerYear: patch.monthsInYear ?? currentAssumptions.monthsPerYear,
          initialCapital: patch.startingCapital ?? currentAssumptions.initialCapital,
          investmentReturnPct: patch.investmentReturn !== undefined ? patch.investmentReturn * 100 : currentAssumptions.investmentReturnPct,
          inflationSchedule: patch.inflation !== undefined
            ? updateInflationSchedule(currentAssumptions, patch.inflation * 100)
            : currentAssumptions.inflationSchedule,
        },
        await requestOptions(),
      ), "PATCH /analytics/assumptions");
    }

    unwrapData<PensionSettings>(await patchPlansPlanIdPension(
      planId,
      {
        ...current.pension,
        currentAge,
        retirementAge,
        desiredMonthlyExpensesCurrentPrices: patch.targetMonthlySpend ?? current.pension.desiredMonthlyExpensesCurrentPrices,
        monthlyExpenses: patch.targetMonthlySpend ?? current.pension.monthlyExpenses,
        expectedReturnPct: patch.pensionInvestmentReturn !== undefined
          ? patch.pensionInvestmentReturn * 100
          : patch.investmentReturn !== undefined ? patch.investmentReturn * 100 : current.pension.expectedReturnPct,
        inflationPct: pensionInflationPct,
        withdrawalStrategy: patch.withdrawalStrategy ?? current.pension.withdrawalStrategy,
        statePensionEnabled: patch.statePensionEnabled ?? current.pension.statePensionEnabled,
        statePensionMonthly: patch.statePensionMonthly ?? current.pension.statePensionMonthly,
      },
      await requestOptions(),
    ), "PATCH /pension");

    return readBackendPlan();
  },

  async updateCashflow(id: string, patch: Partial<Cashflow>) {
    const planId = currentPlanId();
    const current = findCashflow(id);
    if (!current) throw new Error(`Cashflow ${id} was not found`);
    const next = { ...current, ...patch };
    const fallbackEndYear = dashboardEndYearFromSettings(lastFinancialPlan, next.startYear);

    if (next.type === "income") {
      await patchPlansPlanIdIncomesId(planId, id, baseIncomeFromCashflow(next, fallbackEndYear), await requestOptions());
    } else if (next.type === "expense") {
      await patchPlansPlanIdExpensesId(planId, id, baseExpenseFromCashflow(next, fallbackEndYear), await requestOptions());
    } else {
      await patchPlansPlanIdGoalsId(planId, id, goalRequestFromGoal({ ...findGoal(id), id, name: next.name, targetYear: next.endYear ?? new Date().getFullYear(), targetMonth: 12, cost: next.amount, saved: 0, growth: next.growth, reachable: true, icon: "Target" }, 1), await requestOptions());
    }

    return readBackendPlan();
  },

  async addCashflow(input: Omit<Cashflow, "id">) {
    const planId = currentPlanId();
    const cashflow = { ...input, id: `${input.type}-${Date.now()}` };
    const fallbackEndYear = dashboardEndYearFromSettings(lastFinancialPlan, cashflow.startYear);

    if (cashflow.type === "income") {
      await postPlansPlanIdIncomes(planId, baseIncomeFromCashflow(cashflow, fallbackEndYear), await requestOptions());
    } else if (cashflow.type === "expense") {
      await postPlansPlanIdExpenses(planId, baseExpenseFromCashflow(cashflow, fallbackEndYear), await requestOptions());
    } else {
      await postPlansPlanIdGoals(planId, goalRequestFromGoal({ id: cashflow.id, name: cashflow.name, icon: "Target", targetYear: cashflow.endYear ?? new Date().getFullYear(), targetMonth: 12, cost: cashflow.amount, saved: 0, growth: cashflow.growth, reachable: true }, 1), await requestOptions());
    }

    return readBackendPlan();
  },

  async duplicateCashflow(id: string) {
    const source = findCashflow(id);
    if (!source) throw new Error(`Cashflow ${id} was not found`);
    return this.addCashflow({
      name: `${source.name} (копия)`,
      type: source.type,
      frequency: source.frequency,
      amount: source.amount,
      currency: source.currency,
      startYear: source.startYear,
      endYear: source.endYear,
      growth: source.growth,
      enabled: source.enabled,
      category: source.category,
    });
  },

  async deleteCashflow(id: string) {
    const planId = currentPlanId();
    const current = findCashflow(id);
    if (!current) throw new Error(`Cashflow ${id} was not found`);

    if (current.type === "income") {
      await deletePlansPlanIdIncomesId(planId, id, await requestOptions());
    } else if (current.type === "expense") {
      await deletePlansPlanIdExpensesId(planId, id, await requestOptions());
    } else {
      await deletePlansPlanIdGoalsId(planId, id, await requestOptions());
    }

    return readBackendPlan();
  },

  async updateGoal(id: string, patch: Partial<Goal>) {
    const planId = currentPlanId();
    const current = findGoal(id);
    if (!current) throw new Error(`Goal ${id} was not found`);
    const priority = (lastFinancialPlan?.goals.findIndex((goal) => goal.id === id) ?? 0) + 1;
    unwrapData<ApiGoal>(
      await patchPlansPlanIdGoalsId(planId, id, goalRequestFromGoal({ ...current, ...patch }, priority), await requestOptions()),
      "PATCH /goals/{id}",
    );
    return readBackendPlan();
  },

  async addGoal(input: Omit<Goal, "id">) {
    const planId = currentPlanId();
    unwrapData<ApiGoal>(
      await postPlansPlanIdGoals(planId, goalRequestFromGoal({ ...input, id: `goal-${Date.now()}` }, (lastFinancialPlan?.goals.length ?? 0) + 1), await requestOptions()),
      "POST /goals",
    );
    return readBackendPlan();
  },

  async deleteGoal(id: string) {
    await deletePlansPlanIdGoalsId(currentPlanId(), id, await requestOptions());
    return readBackendPlan();
  },

  async reorderGoals(goalIds: string[]) {
    const planId = currentPlanId();
    unwrapData<ApiGoal[]>(
      await postPlansPlanIdGoalsReorder(planId, { goalIds }, await requestOptions()),
      "POST /goals/reorder",
    );
    return readBackendPlan();
  },

  async addTrackerEntry(input: Omit<TrackerEntry, "id">) {
    await backendJson<ApiTrackerEntry>(`/plans/${currentPlanId()}/tracker/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackerEntryRequest(input)),
    }, "POST /tracker/entries");
    return readBackendPlan();
  },

  async updateTrackerEntry(id: string, patch: Partial<TrackerEntry>) {
    await backendJson<ApiTrackerEntry>(`/plans/${currentPlanId()}/tracker/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackerEntryRequest(patch)),
    }, "PATCH /tracker/entries/{id}");
    return readBackendPlan();
  },

  async deleteTrackerEntry(id: string) {
    await backendNoContent(`/plans/${currentPlanId()}/tracker/entries/${id}`, { method: "DELETE" }, "DELETE /tracker/entries/{id}");
    return readBackendPlan();
  },

  async resetPlan() {
    activeScenario = "base";
    return readBackendPlan();
  },

  async saveWhatIfScenario(input: {
    incomeGrowthDelta: number;
    expenseGrowthDelta: number;
    returnDelta: number;
    inflationDelta?: number;
    retirementAgeShift?: number;
    goalsCostDelta?: number;
    description?: string;
  }) {
    const optimistic = await readBackendPlan();
    optimistic.activeScenario = "whatif";
    optimistic.scenarios = optimistic.scenarios.some((scenario) => scenario.id === "whatif")
      ? optimistic.scenarios.map((scenario) => (scenario.id === "whatif" ? { ...scenario, ...input } : scenario))
      : [...optimistic.scenarios, { id: "whatif", name: "Что если?", ...input }];
    activeScenario = "whatif";
    lastFinancialPlan = optimistic;
    return optimistic;
  },



  // ─── Monthly Tracker ──────────────────────────────────────────────────────

  async getMonthlyTracker(planId: string, year?: number): Promise<MonthlyTrackerEntry[]> {
    const yearParam = year != null ? `?year=${year}` : "";
    const raw = await backendJson<unknown[]>(`/plans/${planId}/calendar/monthly-tracker${yearParam}`, undefined, "GET /monthly-tracker");
    return raw.map(monthlyTrackerFromApi);
  },

  async saveMonthlyTrackerEntry(planId: string, month: string, status: MonthlyStatus, amount?: number | null, note?: string | null) {
    await backendNoContent(`/plans/${planId}/calendar/monthly-tracker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, status, amount: amount ?? undefined, note: note ?? undefined }),
    }, "POST /monthly-tracker");
    const year = Number(month.split("-")[0]) || undefined;
    return backendPlanClient.getMonthlyTracker(planId, year);
  },
};

function updateInflationSchedule(assumptions: ModelAssumptions, inflationPct: number) {
  if (assumptions.inflationSchedule.length === 0) {
    return [{ year: assumptions.startYear, ratePct: inflationPct }];
  }
  return assumptions.inflationSchedule.map((point) => ({ ...point, ratePct: inflationPct }));
}

function planSummaryFromApi(raw: ApiPlanSummary): PlanSummary {
  return {
    id: raw.id,
    name: raw.name,
    current: Boolean(raw.current),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}



// ─── Monthly Tracker mappers ─────────────────────────────────────────────────

export function monthlyTrackerFromApi(raw: unknown): MonthlyTrackerEntry {
  const r = raw as Record<string, unknown>;
  return {
    month: String(r.month ?? ""),
    status: (r.status as MonthlyStatus) ?? "pending",
    amount: r.amount != null ? Number(r.amount) : null,
    note: r.note ? String(r.note) : null,
  };
}
