import type { Page, Route } from "@playwright/test";

const planState = {
  id: "plan-e2e",
  profile: { name: "Тестовый Пользователь", email: "test@example.com", age: 35 },
  pension: { currentAge: 35, retirementAge: 60 },
  modelAssumptions: { startYear: 2026, birthYear: 1991, projectionEndYear: 2030 },
  incomes: [],
  expenses: [],
  goals: [],
};

const dashboard = {
  totalMonthlyIncome: 300_000,
  totalMonthlyExpenses: 180_000,
  monthlyGoalContribution: 50_000,
  availableForPension: 70_000,
  projectedPensionCapital: 12_000_000,
  totalGoalsRemaining: 1_000_000,
  yearsToRetirement: 25,
};

const cashflow = [2026, 2027, 2028, 2029, 2030].map((year, index) => ({
  year,
  age: 35 + index,
  totalIncome: 3_600_000,
  totalExpenses: 2_160_000,
  totalGoalExpenses: 600_000,
  netSavings: 840_000 + index * 100_000,
  capitalEndOfYear: 2_500_000 + index * 1_000_000,
}));

const health = { score: 78, status: "good" };
const scenarios = [
  { id: "base", name: "Базовый", adjustments: { incomeAdjPct: 0, expenseAdjPct: 0, returnAdjPct: 0 } },
  { id: "optimistic", name: "Оптимистичный", adjustments: { incomeAdjPct: 1.5, expenseAdjPct: -0.8, returnAdjPct: 1.5 } },
  { id: "pessimistic", name: "Пессимистичный", adjustments: { incomeAdjPct: -1.2, expenseAdjPct: 1.5, returnAdjPct: -1.8 } },
];

export async function mockDashboardApi(page: Page) {
  await page.route("**/finguide-api/api/v1/plans/current", (route) => fulfill(route, planState));
  await page.route("**/finguide-api/api/v1/plans/*/dashboard", (route) => fulfill(route, dashboard));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/cashflow**", (route) => fulfill(route, cashflow));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/health", (route) => fulfill(route, health));
  await page.route("**/finguide-api/api/v1/scenarios", (route) => fulfill(route, scenarios));
}

function fulfill(route: Route, data: unknown) {
  return route.fulfill({ contentType: "application/json", body: JSON.stringify({ data }) });
}
