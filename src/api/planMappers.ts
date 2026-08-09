import type {
  CashFlowProjectionPoint,
  DashboardMetrics,
  ExpenseItem,
  Goal as ApiGoal,
  HealthScore,
  IncomeSource,
  ModelAssumptions,
  PensionSettings,
  Scenario as ApiScenario,
  YearRatePoint,
} from "@/shared/api/generated/model";
import type { Cashflow, FinancialPlan, Goal, Scenario, ScenarioId, TrackerEntry } from "@/types/finance";

export type ApiTrackerEntry = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: TrackerEntry["type"];
  status: TrackerEntry["status"];
};

export type ApiScenarioComparison = {
  scenarios: Array<{
    scenarioId: string;
    projection: CashFlowProjectionPoint[];
  }>;
};

export type ApiMonthlyCashflowPoint = {
  month: string;
  year: number;
  monthNumber: number;
  age?: number | null;
  income: number;
  expenses: number;
  goalExpenses: number;
  netSavings: number;
  capitalEndOfMonth: number;
};

export function mapScenarioComparisonForecasts(comparison: ApiScenarioComparison): FinancialPlan["scenarioForecasts"] {
  return Object.fromEntries(
    comparison.scenarios
      .map((scenario) => [toScenarioId(scenario.scenarioId, 0), scenario.projection.map(mapForecastPoint)] as const)
      .filter(([scenarioId]) => scenarioId === "base" || scenarioId === "optimistic" || scenarioId === "pessimistic"),
  );
}


export function firstRate(schedule: ModelAssumptions["inflationSchedule"] | undefined, fallbackPct: number) {
  return schedule?.[0]?.ratePct ?? fallbackPct;
}

export function dashboardEndYearFromAssumptions(assumptions: ModelAssumptions | undefined) {
  const startYear = assumptions?.startYear ?? new Date().getFullYear();
  if (assumptions?.horizonYears) return startYear + assumptions.horizonYears - 1;
  return assumptions?.projectionEndYear ?? startYear + 11;
}

export function pensionProjectionYearsFromAssumptions(assumptions: ModelAssumptions | undefined) {
  if (!assumptions?.projectionEndYear) return undefined;
  const startYear = assumptions.startYear ?? new Date().getFullYear();
  return Math.max(1, assumptions.projectionEndYear - startYear + 1);
}

export function dashboardEndYearFromSettings(plan: FinancialPlan | undefined, fallbackStartYear: number) {
  if (!plan) return fallbackStartYear + 11;
  return plan.settings.startYear + plan.settings.dashboardCalculationYears - 1;
}

export function mapForecastPoint(point: CashFlowProjectionPoint) {
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

export function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  const names = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const index = Number(monthNumber) - 1;
  return `${names[index] ?? monthNumber} ${year}`;
}

export function mapIncomeCashflow(source: IncomeSource, assumptions: ModelAssumptions | undefined): Cashflow {
  const defaultEndYear = dashboardEndYearFromAssumptions(assumptions);
  const endYear = source.endYear ?? yearFromDate(source.endDate, defaultEndYear);
  return {
    id: source.id,
    name: source.name,
    type: "income",
    frequency: toUiFrequency(source.frequency),
    amount: source.amount,
    currency: toUiCurrency(source.currency),
    startYear: source.startYear ?? yearFromDate(source.startDate, assumptions?.startYear ?? new Date().getFullYear()),
    endYear,
    growth: source.growthPct / 100,
    growthType: source.growthSchedule?.length ? "ranges" : source.growthType === "inflation" ? "inflation" : "custom",
    growthRanges: cashflowGrowthRangesFromSchedule(source.growthSchedule, endYear),
    continueAfterRetirement: source.continueAfterRetirement ?? true,
    enabled: true,
    category: source.frequency === "monthly" ? "Ежемесячные доходы" : source.frequency === "one_time" ? "Разовые доходы" : "Ежегодные доходы",
  };
}

export function mapExpenseCashflow(source: ExpenseItem, assumptions: ModelAssumptions | undefined): Cashflow {
  const defaultEndYear = dashboardEndYearFromAssumptions(assumptions);
  const endYear = source.endYear ?? yearFromDate(source.endDate, defaultEndYear);
  return {
    id: source.id,
    name: source.name,
    type: "expense",
    frequency: toUiFrequency(source.frequency),
    amount: source.amount,
    currency: toUiCurrency(source.currency),
    startYear: source.startYear ?? yearFromDate(source.startDate, assumptions?.startYear ?? new Date().getFullYear()),
    endYear,
    growth: source.growthPct / 100,
    growthType: source.growthSchedule?.length ? "ranges" : source.growthType === "inflation" ? "inflation" : "custom",
    growthRanges: cashflowGrowthRangesFromSchedule(source.growthSchedule, endYear),
    enabled: true,
    category: source.frequency === "monthly" ? "Ежемесячные расходы" : source.frequency === "one_time" ? "Разовые расходы" : "Ежегодные расходы",
  };
}

export function mapGoalCashflow(source: ApiGoal, assumptions: ModelAssumptions | undefined): Cashflow {
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
    growthType: goal.growthType === "inflation" ? "inflation" : "custom",
    reachable: goal.projectedReachable ?? (goal.savedAmount >= goal.currentCost || goal.targetYear <= lastForecastYear),
    type: goal.type === "recurring" ? "periodic" : "onetime",
  };
}

export function mapScenarios(scenarios: ApiScenario[]): Scenario[] {
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

export function adjustmentPct(value: number | undefined) {
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

export function toUiFrequency(frequency: string): Cashflow["frequency"] {
  if (frequency === "one_time" || frequency === "onetime") return "onetime";
  return frequency === "monthly" ? "monthly" : "yearly";
}



export function toUiCurrency(currency: string): Cashflow["currency"] {
  return currency === "USD" ? "USD" : "RUB";
}

export function toScenarioId(value: string, index: number): ScenarioId {
  if (value === "base" || value === "optimistic" || value === "pessimistic" || value === "whatif") return value;
  return ["base", "optimistic", "pessimistic", "whatif"][index] as ScenarioId | undefined ?? "whatif";
}

export function yearFromDate(value: string | null | undefined, fallback: number) {
  if (!value) return fallback;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : fallback;
}

export function startDateFromYear(year: number) {
  return `${year}-01-01`;
}

export function endDateFromYear(year: number) {
  return `${year}-12-31`;
}

export function cashflowGrowthRangesFromSchedule(schedule: YearRatePoint[] | undefined, cashflowEndYear?: number | null): Cashflow["growthRanges"] {
  if (!schedule?.length) return [];
  const sorted = schedule.slice().sort((a, b) => a.year - b.year);
  const ranges: NonNullable<Cashflow["growthRanges"]> = [];

  for (const point of sorted) {
    const last = ranges.at(-1);
    if (last && last.growthPercent === point.ratePct && last.endYear === point.year) {
      last.endYear = point.year + 1;
    } else {
      ranges.push({ startYear: point.year, endYear: point.year + 1, growthPercent: point.ratePct });
    }
  }

  const last = ranges.at(-1);
  if (last && cashflowEndYear != null && last.endYear === cashflowEndYear) {
    last.endYear = null;
  }

  return ranges;
}

export function cashflowGrowthScheduleFromRanges(ranges: Cashflow["growthRanges"], fallbackEndYear: number): YearRatePoint[] {
  if (!ranges?.length) return [];
  const points: YearRatePoint[] = [];
  for (const range of ranges) {
    const endYear = range.endYear ?? fallbackEndYear;
    for (let year = range.startYear; year < endYear; year += 1) {
      points.push({ year, ratePct: range.growthPercent });
    }
  }
  return points;
}

export function baseIncomeFromCashflow(input: Cashflow, fallbackEndYear = input.startYear + 30): IncomeSource {
  const effectiveEndYear = input.endYear ?? Math.max(input.startYear, fallbackEndYear);
  const growthSchedule = input.growthType === "ranges" || input.growthRanges?.length
    ? cashflowGrowthScheduleFromRanges(input.growthRanges, effectiveEndYear)
    : [];
  return {
    id: input.id,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    frequency: input.frequency === "onetime" ? "one_time" : input.frequency,
    growthType: input.growthType === "inflation" ? "inflation" : "manual",
    growthPct: input.growth * 100,
    continueAfterRetirement: input.continueAfterRetirement ?? true,
    growthSchedule,
    startDate: startDateFromYear(input.startYear),
    endDate: endDateFromYear(effectiveEndYear),
    startYear: input.startYear,
    endYear: effectiveEndYear,
  };
}

export function baseExpenseFromCashflow(input: Cashflow, fallbackEndYear?: number): ExpenseItem {
  // continueAfterRetirement is income-only; keep it out of expense payloads
  const base: Partial<IncomeSource> = { ...baseIncomeFromCashflow(input, fallbackEndYear) };
  delete base.continueAfterRetirement;
  return {
    ...(base as Omit<IncomeSource, "continueAfterRetirement">),
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

