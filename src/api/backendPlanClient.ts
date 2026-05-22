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
import { getValidOidcAuthorizationHeader, oidcAuthEnabled } from "@/auth/oidc";
import { apiBaseUrl, demoBearerToken } from "@/shared/api/baseUrl";
import type {
  CashFlowProjectionPoint,
  DashboardMetrics,
  ExpenseItem,
  Goal as ApiGoal,
  HealthScore,
  IncomeSource,
  ModelAssumptions,
  PensionSettings,
  PlanState,
  Scenario as ApiScenario,
} from "@/shared/api/generated/model";
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, MonthlyStatus, MonthlyTrackerEntry, Scenario, ScenarioId, TrackerEntry } from "@/types/finance";
import { calculateForecast } from "@/engine/calculateForecast";

type ApiResponse = {
  status: number;
  data: unknown;
};

type ApiTrackerEntry = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: TrackerEntry["type"];
  status: TrackerEntry["status"];
};

type ApiScenarioComparison = {
  scenarios: Array<{
    scenarioId: string;
    projection: CashFlowProjectionPoint[];
  }>;
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
    const envelope = response.data as { error?: { message?: string } } | undefined;
    const detail = envelope?.error?.message ? `: ${envelope.error.message}` : "";
    throw new Error(`${operation} failed with HTTP ${response.status}${detail}`);
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
    throw new Error(`${operation} failed with HTTP ${res.status}`);
  }
}

interface ApiMonthlyCashflowPoint {
  month: string;
  year: number;
  monthNumber: number;
  age?: number | null;
  income: number;
  expenses: number;
  goalExpenses: number;
  netSavings: number;
  capitalEndOfMonth: number;
}

async function readBackendPlan() {
  const planState = unwrapData<PlanState>(await getPlansCurrent(await requestOptions()), "GET /plans/current");
  const planId = planState.id;

  const [dashboard, cashflow, monthlyCashflow, health, scenarios] = await Promise.all([
    getPlansPlanIdDashboard(planId, await requestOptions()).then((response) => unwrapData<DashboardMetrics>(response, "GET /dashboard")),
    getPlansPlanIdAnalyticsCashflow(planId, undefined, await requestOptions()).then((response) =>
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

  return mapBackendPlan({ planState, dashboard, cashflow, monthlyCashflow, health, scenarios, tracker, scenarioForecasts });
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
  monthlyCashflow: ApiMonthlyCashflowPoint[];
  health: HealthScore;
  scenarios: ApiScenario[];
  tracker: ApiTrackerEntry[];
  scenarioForecasts?: FinancialPlan["scenarioForecasts"];
}): FinancialPlan {
  const { planState, dashboard, cashflow, monthlyCashflow, health, scenarios, tracker, scenarioForecasts } = input;
  const assumptions = planState.modelAssumptions;
  const settings = mapSettings(planState, assumptions);
  
  const baseForecast = cashflow.map(mapForecastPoint);
  const monthlyForecast = monthlyCashflow.map(mapMonthlyForecastPoint);
  const activeScenarioForecast = activeScenario !== "base" ? scenarioForecasts?.[activeScenario] : undefined;
  const forecast = activeScenarioForecast || baseForecast;

  const goals = planState.goals.map((goal) => goalFromApi(goal, forecast.at(-1)?.year ?? settings.startYear));
  const plan: FinancialPlan = {
    planId: planState.id,
    owner: {
      name: planState.profile.name,
      email: planState.profile.email,
      planName: "Основной план",
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

export function mapScenarioComparisonForecasts(comparison: ApiScenarioComparison): FinancialPlan["scenarioForecasts"] {
  return Object.fromEntries(
    comparison.scenarios
      .map((scenario) => [toScenarioId(scenario.scenarioId, 0), scenario.projection.map(mapForecastPoint)] as const)
      .filter(([scenarioId]) => scenarioId === "base" || scenarioId === "optimistic" || scenarioId === "pessimistic"),
  );
}

function mapSettings(planState: PlanState, assumptions: ModelAssumptions | undefined) {
  const startYear = assumptions?.startYear ?? new Date().getFullYear();
  const birthYear = assumptions?.birthYear ?? (planState.profile.age ? startYear - planState.profile.age : startYear - planState.pension.currentAge);

  return {
    startYear,
    birthYear,
    currentAge: planState.profile.age ?? planState.pension.currentAge,
    retirementAge: planState.pension.retirementAge,
    monthsInYear: assumptions?.monthsPerYear ?? 12,
    inflation: firstRate(assumptions?.inflationSchedule, planState.pension.inflationPct) / 100,
    investmentReturn: (assumptions?.investmentReturnPct ?? planState.pension.expectedReturnPct) / 100,
    startingCapital: assumptions?.initialCapital ?? planState.profile.initialBalance,
    targetMonthlySpend: planState.pension.desiredMonthlyExpensesCurrentPrices ?? planState.pension.monthlyExpenses,
  };
}

function firstRate(schedule: ModelAssumptions["inflationSchedule"] | undefined, fallbackPct: number) {
  return schedule?.[0]?.ratePct ?? fallbackPct;
}

function mapForecastPoint(point: CashFlowProjectionPoint) {
  return {
    year: point.year,
    age: point.age ?? 0,
    income: point.totalIncome,
    expenses: -point.totalExpenses,
    goals: -point.totalGoalExpenses,
    savings: point.netSavings,
    capital: point.capitalEndOfYear,
  };
}

export function mapMonthlyForecastPoint(point: ApiMonthlyCashflowPoint) {
  return {
    year: point.year,
    age: point.age ?? 0,
    month: point.month,
    monthNumber: point.monthNumber,
    label: monthLabel(point.month),
    income: point.income,
    expenses: -point.expenses,
    goals: -point.goalExpenses,
    savings: point.netSavings,
    capital: point.capitalEndOfMonth,
  };
}

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  const names = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const index = Number(monthNumber) - 1;
  return `${names[index] ?? monthNumber} ${year}`;
}

function mapIncomeCashflow(source: IncomeSource, assumptions: ModelAssumptions | undefined): Cashflow {
  return {
    id: source.id,
    name: source.name,
    type: "income",
    frequency: toUiFrequency(source.frequency),
    amount: source.amount,
    currency: toUiCurrency(source.currency),
    startYear: source.startYear ?? yearFromDate(source.startDate, assumptions?.startYear ?? new Date().getFullYear()),
    endYear: source.endYear ?? yearFromDate(source.endDate, assumptions?.projectionEndYear ?? assumptions?.startYear ?? new Date().getFullYear()),
    growth: source.growthPct / 100,
    enabled: true,
    category: source.frequency === "monthly" ? "Ежемесячные доходы" : source.frequency === "one_time" ? "Разовые доходы" : "Ежегодные доходы",
  };
}

function mapExpenseCashflow(source: ExpenseItem, assumptions: ModelAssumptions | undefined): Cashflow {
  return {
    id: source.id,
    name: source.name,
    type: "expense",
    frequency: toUiFrequency(source.frequency),
    amount: source.amount,
    currency: toUiCurrency(source.currency),
    startYear: source.startYear ?? yearFromDate(source.startDate, assumptions?.startYear ?? new Date().getFullYear()),
    endYear: source.endYear ?? yearFromDate(source.endDate, assumptions?.projectionEndYear ?? assumptions?.startYear ?? new Date().getFullYear()),
    growth: source.growthPct / 100,
    enabled: true,
    category: source.frequency === "monthly" ? "Ежемесячные расходы" : source.frequency === "one_time" ? "Разовые расходы" : "Ежегодные расходы",
  };
}

function mapGoalCashflow(source: ApiGoal, assumptions: ModelAssumptions | undefined): Cashflow {
  return {
    id: source.id,
    name: source.name,
    type: "goal",
    frequency: toUiFrequency(source.frequency ?? "yearly"),
    amount: source.plannedAmount ?? source.currentCost,
    currency: toUiCurrency(source.currency),
    startYear: source.startYear ?? yearFromDate(source.startDate, assumptions?.startYear ?? new Date().getFullYear()),
    endYear: source.endYear ?? yearFromDate(source.endDate, source.targetYear),
    growth: source.growthPct / 100,
    enabled: true,
    category: "Цели",
  };
}

export function goalFromApi(goal: ApiGoal, lastForecastYear: number): Goal {
  return {
    id: goal.id,
    name: goal.name,
    icon: goal.icon ?? "Target",
    targetYear: goal.targetYear,
    targetMonth: goal.targetMonth ?? 12,
    priority: goal.priority,
    cost: goal.currentCost,
    saved: goal.savedAmount,
    projectedCost: goal.projectedTargetCost,
    projectedSaved: goal.projectedSavedAmount,
    projectedProgressPct: goal.projectedProgressPct,
    growth: goal.growthPct / 100,
    reachable: goal.projectedReachable ?? (goal.savedAmount >= goal.currentCost || goal.targetYear <= lastForecastYear),
    type: goal.type === "recurring" ? "periodic" : "onetime",
  };
}

function mapScenarios(scenarios: ApiScenario[]): Scenario[] {
  const mapped: Scenario[] = scenarios.map((scenario, index) => ({
    id: toScenarioId(scenario.id, index),
    name: scenario.name,
    incomeGrowthDelta: adjustmentPct(scenario.adjustments?.incomeAdjPct),
    expenseGrowthDelta: adjustmentPct(scenario.adjustments?.expenseAdjPct),
    returnDelta: adjustmentPct(scenario.adjustments?.returnAdjPct),
    inflationDelta: adjustmentPct(scenario.adjustments?.inflationAdjPct),
    retirementAgeShift: scenario.adjustments?.retirementAgeShift ?? 0,
    goalsCostDelta: adjustmentPct(scenario.adjustments?.goalsCostAdjPct),
    description: scenario.description,
  }));

  const baseScenarios: Scenario[] = mapped.length > 0
    ? mapped
    : [
        { id: "base", name: "Базовый", incomeGrowthDelta: 0, expenseGrowthDelta: 0, returnDelta: 0 },
        { id: "optimistic", name: "Оптимистичный", incomeGrowthDelta: 0.15, expenseGrowthDelta: 0.05, returnDelta: 0.01, inflationDelta: -0.01, retirementAgeShift: -2, goalsCostDelta: 0 },
        { id: "pessimistic", name: "Пессимистичный", incomeGrowthDelta: -0.1, expenseGrowthDelta: 0.12, returnDelta: -0.02, inflationDelta: 0.02, retirementAgeShift: 3, goalsCostDelta: 0.15 },
      ];

  return baseScenarios.some((scenario) => scenario.id === "whatif")
    ? baseScenarios
    : [...baseScenarios, { id: "whatif", name: "Что если?", incomeGrowthDelta: 0, expenseGrowthDelta: 0, returnDelta: 0, inflationDelta: 0, retirementAgeShift: 0, goalsCostDelta: 0 }];
}

function adjustmentPct(value: number | undefined) {
  return value === undefined ? 0 : value / 100;
}

export function mapDashboardSnapshot(
  dashboard: DashboardMetrics,
  health: HealthScore,
  pension: PensionSettings,
  forecast: FinancialPlan["forecast"],
) {
  const currentYear = forecast[0]?.year ?? new Date().getFullYear();
  const independenceYear = forecast.find((point) => point.capital >= dashboard.totalGoalsRemaining)?.year ?? forecast.at(-1)?.year ?? currentYear;
  const yearsToIndependence = Math.max(0, independenceYear - currentYear);

  return {
    recommendationYear: independenceYear,
    monthlyTargetRub: dashboard.monthlyGoalContribution,
    netMonthlyBalanceRub: dashboard.netMonthlyBalance,
    annualTargetRub: dashboard.monthlyGoalContribution * 12,
    monthlyDeltaRub: dashboard.availableForPension - dashboard.monthlyGoalContribution,
    pensionCapitalRub: dashboard.projectedPensionCapital,
    retirementLabel: `к ${pension.retirementAge} г. · ${dashboard.yearsToRetirement} л.`,
    independenceYear,
    independenceLabel: yearsToIndependence === 0 ? "сейчас" : `через ${yearsToIndependence} лет`,
    healthScore: health.score,
  };
}

export function trackerEntryRequest(input: Omit<TrackerEntry, "id"> | Partial<TrackerEntry>) {
  return {
    ...(input.date !== undefined ? { date: input.date } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
}

export function trackerEntryFromApi(input: ApiTrackerEntry): TrackerEntry {
  return {
    id: input.id,
    date: input.date,
    title: input.title,
    amount: input.amount,
    type: input.type,
    status: input.status,
  };
}

function toUiFrequency(frequency: string): Cashflow["frequency"] {
  if (frequency === "one_time" || frequency === "onetime") return "onetime";
  return frequency === "monthly" ? "monthly" : "yearly";
}



function toUiCurrency(currency: string): Cashflow["currency"] {
  return currency === "USD" ? "USD" : "RUB";
}

function toScenarioId(value: string, index: number): ScenarioId {
  if (value === "base" || value === "optimistic" || value === "pessimistic" || value === "whatif") return value;
  return ["base", "optimistic", "pessimistic", "whatif"][index] as ScenarioId | undefined ?? "whatif";
}

function yearFromDate(value: string | null | undefined, fallback: number) {
  if (!value) return fallback;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : fallback;
}

function startDateFromYear(year: number) {
  return `${year}-01-01`;
}

function endDateFromYear(year: number) {
  return `${year}-12-31`;
}

function baseIncomeFromCashflow(input: Cashflow): IncomeSource {
  const effectiveEndYear = input.endYear ?? input.startYear + 30;
  return {
    id: input.id,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    frequency: input.frequency === "onetime" ? "one_time" : input.frequency,
    growthType: "manual",
    growthPct: input.growth * 100,
    startDate: startDateFromYear(input.startYear),
    endDate: endDateFromYear(effectiveEndYear),
    startYear: input.startYear,
    endYear: effectiveEndYear,
  };
}

function baseExpenseFromCashflow(input: Cashflow): ExpenseItem {
  return {
    ...baseIncomeFromCashflow(input),
    growthLabel: input.growth === 0 ? "Без индексации" : `${Math.round(input.growth * 1000) / 10}%`,
    budgetClass: "needs",
  };
}

export function goalRequestFromGoal(input: Goal, priority: number): ApiGoal {
  return {
    id: input.id,
    name: input.name,
    icon: input.icon,
    currentCost: input.cost,
    savedAmount: input.saved,
    currency: "RUB",
    targetYear: input.targetYear,
    targetMonth: input.targetMonth ?? 12,
    type: input.type === "periodic" ? "recurring" : "one_time",
    growthType: "manual",
    growthPct: input.growth * 100,
    priority,
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

  async setScenario(id: ScenarioId) {
    activeScenario = id;
    return readBackendPlan();
  },

  async updateSettings(patch: EditablePlanPatch) {
    const planId = currentPlanId();
    const current = lastPlanState ?? unwrapData<PlanState>(await getPlansCurrent(await requestOptions()), "GET /plans/current");
    const currentAssumptions = current.modelAssumptions;

    if (currentAssumptions) {
      unwrapData<ModelAssumptions>(await patchPlansPlanIdAnalyticsAssumptions(
        planId,
        {
          ...currentAssumptions,
          startYear: patch.startYear ?? currentAssumptions.startYear,
          birthYear: patch.birthYear ?? currentAssumptions.birthYear,
          monthsPerYear: patch.monthsInYear ?? currentAssumptions.monthsPerYear,
          initialCapital: patch.startingCapital ?? currentAssumptions.initialCapital,
          investmentReturnPct: patch.investmentReturn !== undefined ? patch.investmentReturn * 100 : currentAssumptions.investmentReturnPct,
          inflationSchedule: currentAssumptions.inflationSchedule,
        },
        await requestOptions(),
      ), "PATCH /analytics/assumptions");
    }

    unwrapData<PensionSettings>(await patchPlansPlanIdPension(
      planId,
      {
        ...current.pension,
        retirementAge: patch.retirementAge ?? current.pension.retirementAge,
        desiredMonthlyExpensesCurrentPrices: patch.targetMonthlySpend ?? current.pension.desiredMonthlyExpensesCurrentPrices,
        monthlyExpenses: patch.targetMonthlySpend ?? current.pension.monthlyExpenses,
        expectedReturnPct: patch.investmentReturn !== undefined ? patch.investmentReturn * 100 : current.pension.expectedReturnPct,
        inflationPct: patch.inflation !== undefined ? patch.inflation * 100 : current.pension.inflationPct,
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

    if (next.type === "income") {
      await patchPlansPlanIdIncomesId(planId, id, baseIncomeFromCashflow(next), await requestOptions());
    } else if (next.type === "expense") {
      await patchPlansPlanIdExpensesId(planId, id, baseExpenseFromCashflow(next), await requestOptions());
    } else {
      await patchPlansPlanIdGoalsId(planId, id, goalRequestFromGoal({ ...findGoal(id), id, name: next.name, targetYear: next.endYear ?? new Date().getFullYear(), targetMonth: 12, cost: next.amount, saved: 0, growth: next.growth, reachable: true, icon: "Target" }, 1), await requestOptions());
    }

    return readBackendPlan();
  },

  async addCashflow(input: Omit<Cashflow, "id">) {
    const planId = currentPlanId();
    const cashflow = { ...input, id: `${input.type}-${Date.now()}` };

    if (cashflow.type === "income") {
      await postPlansPlanIdIncomes(planId, baseIncomeFromCashflow(cashflow), await requestOptions());
    } else if (cashflow.type === "expense") {
      await postPlansPlanIdExpenses(planId, baseExpenseFromCashflow(cashflow), await requestOptions());
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
    await patchPlansPlanIdGoalsId(planId, id, goalRequestFromGoal({ ...current, ...patch }, priority), await requestOptions());
    return readBackendPlan();
  },

  async addGoal(input: Omit<Goal, "id">) {
    const planId = currentPlanId();
    await postPlansPlanIdGoals(planId, goalRequestFromGoal({ ...input, id: `goal-${Date.now()}` }, (lastFinancialPlan?.goals.length ?? 0) + 1), await requestOptions());
    return readBackendPlan();
  },

  async deleteGoal(id: string) {
    await deletePlansPlanIdGoalsId(currentPlanId(), id, await requestOptions());
    return readBackendPlan();
  },

  async reorderGoals(goalIds: string[]) {
    const planId = currentPlanId();
    await postPlansPlanIdGoalsReorder(planId, { goalIds }, await requestOptions());
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

  async getMonthlyTracker(planId: string): Promise<MonthlyTrackerEntry[]> {
    const raw = await backendJson<unknown[]>(`/plans/${planId}/calendar/monthly-tracker`, undefined, "GET /monthly-tracker");
    return raw.map(monthlyTrackerFromApi);
  },

  async saveMonthlyTrackerEntry(planId: string, month: string, status: MonthlyStatus, amount?: number | null, note?: string | null) {
    await backendNoContent(`/plans/${planId}/calendar/monthly-tracker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, status, amount: amount ?? undefined, note: note ?? undefined }),
    }, "POST /monthly-tracker");
    return backendPlanClient.getMonthlyTracker(planId);
  },
};



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
