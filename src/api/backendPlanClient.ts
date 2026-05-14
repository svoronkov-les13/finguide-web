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
  postPlansPlanIdIncomes,
} from "@/shared/api/generated/finguide";
import { getValidOidcAuthorizationHeader, oidcAuthEnabled } from "@/auth/oidc";
import { calculateForecast } from "@/engine/calculateForecast";
import { demoBearerToken } from "@/shared/api/baseUrl";
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
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, Scenario, ScenarioId, TrackerEntry } from "@/types/finance";

type ApiResponse = {
  status: number;
  data: unknown;
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

function unwrapData<T>(response: ApiResponse, operation: string): T {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${operation} failed with HTTP ${response.status}`);
  }

  const envelope = response.data as { data?: T; error?: { message?: string } } | undefined;
  if (!envelope || !("data" in envelope)) {
    throw new Error(`${operation} returned an invalid API envelope`);
  }

  return envelope.data as T;
}

async function readBackendPlan() {
  const planState = unwrapData<PlanState>(await getPlansCurrent(await requestOptions()), "GET /plans/current");
  const planId = planState.id;

  const [dashboard, cashflow, health, scenarios] = await Promise.all([
    getPlansPlanIdDashboard(planId, await requestOptions()).then((response) => unwrapData<DashboardMetrics>(response, "GET /dashboard")),
    getPlansPlanIdAnalyticsCashflow(planId, undefined, await requestOptions()).then((response) =>
      unwrapData<CashFlowProjectionPoint[]>(response, "GET /analytics/cashflow"),
    ),
    getPlansPlanIdAnalyticsHealth(planId, await requestOptions()).then((response) => unwrapData<HealthScore>(response, "GET /analytics/health")),
    getScenarios(await requestOptions()).then((response) => unwrapData<ApiScenario[]>(response, "GET /scenarios")),
  ]);

  lastPlanState = planState;

  return mapBackendPlan({ planState, dashboard, cashflow, health, scenarios });
}

function mapBackendPlan(input: {
  planState: PlanState;
  dashboard: DashboardMetrics;
  cashflow: CashFlowProjectionPoint[];
  health: HealthScore;
  scenarios: ApiScenario[];
}): FinancialPlan {
  const { planState, dashboard, cashflow, health, scenarios } = input;
  const assumptions = planState.modelAssumptions;
  const settings = mapSettings(planState, assumptions);
  const forecast = cashflow.map(mapForecastPoint);
  const goals = planState.goals.map((goal) => mapGoal(goal, forecast.at(-1)?.year ?? settings.startYear));
  const plan: FinancialPlan = {
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
    tracker: mapTracker(dashboard),
    forecast,
  };

  const projectedPlan = { ...plan, forecast: calculateForecast(plan) };
  lastFinancialPlan = projectedPlan;
  return projectedPlan;
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

function mapGoal(goal: ApiGoal, lastForecastYear: number): Goal {
  return {
    id: goal.id,
    name: goal.name,
    icon: goal.icon ?? "Target",
    targetYear: goal.targetYear,
    cost: goal.currentCost,
    saved: goal.savedAmount,
    growth: goal.growthPct / 100,
    reachable: goal.savedAmount >= goal.currentCost || goal.targetYear <= lastForecastYear,
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

function mapDashboardSnapshot(
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
    annualTargetRub: dashboard.monthlyGoalContribution * 12,
    monthlyDeltaRub: dashboard.availableForPension - dashboard.monthlyGoalContribution,
    pensionCapitalRub: dashboard.projectedPensionCapital,
    retirementLabel: `к ${pension.retirementAge} г. · ${dashboard.yearsToRetirement} л.`,
    independenceYear,
    independenceLabel: yearsToIndependence === 0 ? "сейчас" : `через ${yearsToIndependence} лет`,
    healthScore: health.score,
  };
}

function mapTracker(dashboard: DashboardMetrics): TrackerEntry[] {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return [
    {
      id: `${month}-income`,
      date: `${month}-01`,
      title: "Плановый доход месяца",
      amount: dashboard.totalMonthlyIncome,
      type: "income",
      status: "planned",
    },
    {
      id: `${month}-expenses`,
      date: `${month}-05`,
      title: "Плановые расходы месяца",
      amount: -dashboard.totalMonthlyExpenses,
      type: "expense",
      status: "planned",
    },
    {
      id: `${month}-goals`,
      date: `${month}-10`,
      title: "Плановый взнос в цели",
      amount: -dashboard.monthlyGoalContribution,
      type: "goal",
      status: "planned",
    },
  ];
}

function toUiFrequency(frequency: string): Cashflow["frequency"] {
  if (frequency === "one_time" || frequency === "onetime") return "onetime";
  return frequency === "monthly" ? "monthly" : "yearly";
}

function toApiFrequency(frequency: Cashflow["frequency"]) {
  return frequency === "onetime" ? "one_time" : frequency;
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

function baseGoalFromGoal(input: Goal, priority: number): ApiGoal {
  return {
    id: input.id,
    name: input.name,
    icon: input.icon,
    currentCost: input.cost,
    savedAmount: input.saved,
    currency: "RUB",
    targetYear: input.targetYear,
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
      await patchPlansPlanIdAnalyticsAssumptions(
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
      );
    }

    await patchPlansPlanIdPension(
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
    );

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
      await patchPlansPlanIdGoalsId(planId, id, baseGoalFromGoal({ ...findGoal(id), id, name: next.name, targetYear: next.endYear ?? new Date().getFullYear(), cost: next.amount, saved: 0, growth: next.growth, reachable: true, icon: "Target" }, 1), await requestOptions());
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
      await postPlansPlanIdGoals(planId, baseGoalFromGoal({ id: cashflow.id, name: cashflow.name, icon: "Target", targetYear: cashflow.endYear ?? new Date().getFullYear(), cost: cashflow.amount, saved: 0, growth: cashflow.growth, reachable: true }, 1), await requestOptions());
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
    await patchPlansPlanIdGoalsId(planId, id, baseGoalFromGoal({ ...current, ...patch }, priority), await requestOptions());
    return readBackendPlan();
  },

  async addGoal(input: Omit<Goal, "id">) {
    const planId = currentPlanId();
    await postPlansPlanIdGoals(planId, baseGoalFromGoal({ ...input, id: `goal-${Date.now()}` }, (lastFinancialPlan?.goals.length ?? 0) + 1), await requestOptions());
    return readBackendPlan();
  },

  async deleteGoal(id: string) {
    await deletePlansPlanIdGoalsId(currentPlanId(), id, await requestOptions());
    return readBackendPlan();
  },

  async addTrackerEntry(input: Omit<TrackerEntry, "id">) {
    const optimistic = await readBackendPlan();
    optimistic.tracker = [{ ...input, id: `tr-${Date.now()}` }, ...optimistic.tracker];
    lastFinancialPlan = optimistic;
    return optimistic;
  },

  async updateTrackerEntry(id: string, patch: Partial<TrackerEntry>) {
    const optimistic = await readBackendPlan();
    optimistic.tracker = optimistic.tracker.map((item) => (item.id === id ? { ...item, ...patch } : item));
    lastFinancialPlan = optimistic;
    return optimistic;
  },

  async deleteTrackerEntry(id: string) {
    const optimistic = await readBackendPlan();
    optimistic.tracker = optimistic.tracker.filter((item) => item.id !== id);
    lastFinancialPlan = optimistic;
    return optimistic;
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
    optimistic.forecast = calculateForecast(optimistic);
    activeScenario = "whatif";
    lastFinancialPlan = optimistic;
    return optimistic;
  },
};
