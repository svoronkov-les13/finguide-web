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
  cost: number;
  saved: number;
  projectedCost?: number;
  projectedSaved?: number;
  projectedProgressPct?: number;
  growth: number;
  reachable: boolean;
  type?: "onetime" | "periodic";
}

export interface ForecastPoint {
  year: number;
  age: number;
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
  monthsInYear: number;
  inflation: number;
  investmentReturn: number;
  startingCapital: number;
  targetMonthlySpend: number;
}

export interface FinancialPlan {
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
}

export type EditablePlanPatch = Partial<PlanSettings>;

// ─── Contributions (Savings page) ─────────────────────────────────────────────

export interface Contribution {
  id: string;
  goalId: string | null;
  amount: number;
  currency: "RUB" | "USD";
  date: string; // ISO date "YYYY-MM-DD"
  note: string | null;
}

// ─── Monthly Tracker (Calendar tracker) ───────────────────────────────────────

export type MonthlyStatus = "completed" | "partial" | "missed" | "pending";

export interface MonthlyTrackerEntry {
  month: string; // "YYYY-MM"
  status: MonthlyStatus;
  amount: number | null;
  note: string | null;
}
