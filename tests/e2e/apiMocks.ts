import type { Page, Route } from "@playwright/test";

const planState = {
  id: "plan-e2e",
  profile: { id: "profile-e2e", name: "Тестовый Пользователь", email: "test@example.com", age: 35, initialBalance: 0, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  pension: { currentAge: 35, retirementAge: 60, monthlyExpenses: 180_000, desiredMonthlyExpensesCurrentPrices: 180_000, currency: "RUB", expectedReturnPct: 8, inflationPct: 6, withdrawalStrategy: "spend_down_30y", statePensionEnabled: false, statePensionMonthly: 0 },
  modelAssumptions: { startYear: 2026, birthYear: 1991, projectionEndYear: 2030 },
  incomes: [
    { id: "income-e2e-1", name: "Зарплата", amount: 300_000, currency: "RUB", frequency: "monthly", growthType: "manual", growthPct: 5, startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
    { id: "income-e2e-2", name: "Бонус", amount: 600_000, currency: "RUB", frequency: "yearly", growthType: "none", growthPct: 0, startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
  ],
  expenses: [
    { id: "expense-e2e-1", name: "Аренда", amount: 120_000, currency: "RUB", frequency: "monthly", growthType: "manual", growthPct: 4, startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
    { id: "expense-e2e-2", name: "Еда", amount: 60_000, currency: "RUB", frequency: "monthly", growthType: "manual", growthPct: 4, startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
    { id: "expense-e2e-3", name: "Отпуск", amount: 300_000, currency: "RUB", frequency: "yearly", growthType: "manual", growthPct: 4, startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
  ],
  goals: [
    { id: "goal-e2e-1", name: "Подушка", icon: "Shield", currentCost: 1_000_000, savedAmount: 200_000, currency: "RUB", targetYear: 2027, type: "one_time", growthType: "manual", growthPct: 6, priority: 1 },
    { id: "goal-e2e-2", name: "Ремонт", icon: "Wrench", currentCost: 2_000_000, savedAmount: 100_000, currency: "RUB", targetYear: 2028, type: "one_time", growthType: "manual", growthPct: 6, priority: 2 },
    { id: "goal-e2e-3", name: "Целевой взнос", icon: "Target", currentCost: 500_000, savedAmount: 0, currency: "RUB", targetYear: 2029, type: "recurring", growthType: "manual", growthPct: 6, priority: 3, plannedAmount: 50_000, frequency: "yearly", startDate: "2026-01-01", endDate: null, startYear: 2026, endYear: 2030 },
    { id: "goal-e2e-4", name: "Авто", icon: "Car", currentCost: 3_000_000, savedAmount: 500_000, currency: "RUB", targetYear: 2030, type: "one_time", growthType: "manual", growthPct: 6, priority: 4 },
  ],
  contributions: [],
  budget: { method: "manual", classifications: [] },
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

const pensionProjection = {
  currentAge: 35,
  retirementAge: 60,
  retirementYear: 2051,
  capitalAtRetirement: 12_000_000,
  nominalReturnPct: 8,
  averageInflationPct: 6,
  realReturnPct: 1.8868,
  preserveCapital: {
    annualSpendableAtRetirement: 226_416,
    annualSpendableCurrentPrices: 52_706,
    monthlySpendableCurrentPrices: 4_392,
    requiredCapitalAtRetirement: 114_479_406.78,
    requiredCapitalStatus: "calculated",
  },
  spendDown: {
    desiredMonthlyExpensesCurrentPrices: 180_000,
    desiredAnnualExpensesAtRetirement: 9_838_802.35,
    retirementYears: 30,
    depletionAge: 90,
    requiredCapitalAtRetirement: 188_750_895.42,
    series: [],
  },
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

const monthlyCashflow = [{
  month: "2026-01",
  year: 2026,
  monthNumber: 1,
  age: 35,
  income: 300_000,
  expenses: 180_000,
  goalExpenses: 50_000,
  netSavings: 70_000,
  capitalEndOfMonth: 70_000,
}];

const health = { score: 78, status: "good" };
const scenarios = [
  { id: "base", name: "Базовый", adjustments: { incomeAdjPct: 0, expenseAdjPct: 0, returnAdjPct: 0 } },
  { id: "optimistic", name: "Оптимистичный", adjustments: { incomeAdjPct: 1.5, expenseAdjPct: -0.8, returnAdjPct: 1.5 } },
  { id: "pessimistic", name: "Пессимистичный", adjustments: { incomeAdjPct: -1.2, expenseAdjPct: 1.5, returnAdjPct: -1.8 } },
];

export async function mockDashboardApi(page: Page) {
  await page.route("**/finguide-api/api/v1/plans", (route) => fulfill(route, [{
    id: planState.id,
    name: "Основной план",
    current: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }]));
  await page.route("**/finguide-api/api/v1/plans/current", (route) => fulfill(route, planState));
  await page.route("**/finguide-api/api/v1/plans/*/dashboard", (route) => fulfill(route, dashboard));
  await page.route("**/finguide-api/api/v1/plans/*/pension/projection", (route) => fulfill(route, pensionProjection));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/cashflow**", (route) => fulfill(route, cashflow));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/cashflow/monthly", (route) => fulfill(route, monthlyCashflow));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/health", (route) => fulfill(route, health));
  await page.route("**/finguide-api/api/v1/plans/*/tracker/entries", (route) => fulfill(route, []));
  await page.route("**/finguide-api/api/v1/scenarios/compare", (route) => fulfill(route, {
    scenarios: scenarios.map((scenario) => ({ scenarioId: scenario.id, projection: cashflow })),
  }));
  await page.route("**/finguide-api/api/v1/scenarios", (route) => fulfill(route, scenarios));
}

export async function mockPensionApi(page: Page) {
  await mockDashboardApi(page);

  let pension = { ...planState.pension };
  let assumptions = { ...planState.modelAssumptions };

  await page.route("**/finguide-api/api/v1/plans/current", (route) => fulfill(route, {
    ...planState,
    pension,
    modelAssumptions: assumptions,
  }));
  await page.route("**/finguide-api/api/v1/plans/*/analytics/assumptions", async (route) => {
    assumptions = { ...assumptions, ...(await route.request().postDataJSON()) };
    return fulfill(route, assumptions);
  });
  await page.route("**/finguide-api/api/v1/plans/*/pension", async (route) => {
    pension = { ...pension, ...(await route.request().postDataJSON()) };
    return fulfill(route, pension);
  });
  await page.route("**/finguide-api/api/v1/plans/*/pension/projection", (route) => {
    const desiredMonthly = pension.desiredMonthlyExpensesCurrentPrices;
    const statePension = pension.statePensionEnabled ? pension.statePensionMonthly : 0;
    const monthlyNeed = Math.max(0, desiredMonthly - statePension);
    const realReturnPct = pension.expectedReturnPct - pension.inflationPct;
    const preserveCapitalAvailable = monthlyNeed === 0 || realReturnPct > 0;
    const preserveRequired = monthlyNeed === 0
      ? 0
      : preserveCapitalAvailable ? (monthlyNeed * 12) / (realReturnPct / 100) : null;
    const spendDownRequired = monthlyNeed * 12 * (30 - pension.expectedReturnPct / 2);

    return fulfill(route, {
      ...pensionProjection,
      nominalReturnPct: pension.expectedReturnPct,
      averageInflationPct: pension.inflationPct,
      realReturnPct,
      preserveCapital: {
        ...pensionProjection.preserveCapital,
        requiredCapitalAtRetirement: preserveRequired,
        requiredCapitalStatus: preserveCapitalAvailable ? "calculated" : "non_positive_real_return",
      },
      spendDown: {
        ...pensionProjection.spendDown,
        desiredMonthlyExpensesCurrentPrices: desiredMonthly,
        requiredCapitalAtRetirement: spendDownRequired,
      },
    });
  });
}

function fulfill(route: Route, data: unknown) {
  return route.fulfill({ contentType: "application/json", body: JSON.stringify({ data }) });
}
