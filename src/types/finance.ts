export type ScenarioId = "base" | "optimistic" | "pessimistic" | "whatif";

export type CashflowFrequency = "monthly" | "yearly";

export interface Scenario {
  id: ScenarioId;
  name: string;
  incomeGrowthDelta: number;
  expenseGrowthDelta: number;
  returnDelta: number;
}

export interface Cashflow {
  id: string;
  name: string;
  type: "income" | "expense" | "goal";
  frequency: CashflowFrequency;
  amount: number;
  currency: "USD" | "RUB";
  startYear: number;
  endYear: number;
  growth: number;
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
  growth: number;
  reachable: boolean;
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
