export type ScenarioId = "base" | "optimistic" | "pessimistic" | "whatif";

export type CashflowFrequency = "monthly" | "yearly" | "onetime";

export interface Scenario {
  id: ScenarioId;
  name: string;
  incomeGrowthDelta: number;
  expenseGrowthDelta: number;
  returnDelta: number;
  inflationDelta?: number;
  retirementAgeShift?: number;
  goalsCostDelta?: number;
  description?: string;
}

export interface GrowthRange {
  startYear: number;
  endYear: number | null;
  growthPercent: number;
}

export interface Cashflow {
  id: string;
  name: string;
  type: "income" | "expense" | "goal";
  frequency: CashflowFrequency;
  amount: number;
  currency: "USD" | "RUB";
  startYear: number;
  endYear: number | null;
  growth: number;
  growthType?: "inflation" | "custom" | "ranges";
  growthRanges?: GrowthRange[];
  enabled: boolean;
  category: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetYear: number;
  /** Month within targetYear (1–12). Default 12 (December) if not set. */
  targetMonth?: number;
  priority?: number;
  cost: number;
  saved: number;
  projectedCost?: number;
  projectedSaved?: number;
  projectedProgressPct?: number;
  growth: number;
  growthType?: "inflation" | "custom";
  reachable: boolean;
  type?: "onetime" | "periodic";
}

export interface ForecastPoint {
  year: number;
  age: number;
  month?: string;
  monthNumber?: number;
  label?: string;
  income: number;
  expenses: number;
  goals: number;
  savings: number;
  capital: number;
}

export interface TrackerEntry {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: "income" | "expense" | "goal";
  status: "planned" | "actual";
}

export interface DashboardSnapshot {
  recommendationYear: number;
  monthlyTargetRub: number;
  netMonthlyBalanceRub: number;
  annualTargetRub: number;
  monthlyDeltaRub: number;
  pensionCapitalRub: number;
  retirementLabel: string;
  independenceYear: number;
  independenceLabel: string;
  healthScore: number;
}

export interface PlanSettings {
  startYear: number;
  birthYear: number;
  currentAge: number;
  retirementAge: number;
  pensionCalculationYears: number;
  dashboardCalculationYears: number;
  monthsInYear: number;
  inflation: number;
  investmentReturn: number;
  pensionInvestmentReturn: number;
  startingCapital: number;
  targetMonthlySpend: number;
  withdrawalStrategy: "preserve_capital" | "spend_down_30y";
  statePensionEnabled: boolean;
  statePensionMonthly: number;
}

export interface FinancialPlan {
  planId?: string;
  owner: {
    name: string;
    email: string;
    planName: string;
    tier: string;
  };
  settings: PlanSettings;
  scenarios: Scenario[];
  activeScenario: ScenarioId;
  dashboardSnapshot?: DashboardSnapshot;
  cashflows: Cashflow[];
  goals: Goal[];
  tracker: TrackerEntry[];
  forecast: ForecastPoint[];
  monthlyForecast?: ForecastPoint[];
  scenarioForecasts?: Partial<Record<ScenarioId, ForecastPoint[]>>;
}

export type EditablePlanPatch = Partial<PlanSettings>;

export interface PlanSummary {
  id: string;
  name: string;
  current: boolean;
  createdAt: string;
  updatedAt: string;
}


// ─── Monthly Tracker (Calendar tracker) ───────────────────────────────────────

export type MonthlyStatus = "completed" | "partial" | "missed" | "pending";

export interface MonthlyTrackerEntry {
  month: string; // "YYYY-MM"
  status: MonthlyStatus;
  amount: number | null;
  note: string | null;
}
