import type { FinancialPlan, ForecastPoint } from "@/types/finance";

export function calculateForecast(plan: FinancialPlan): ForecastPoint[] {
  const scenario = plan.scenarios.find((item) => item.id === plan.activeScenario) ?? plan.scenarios[0];
  let capital = plan.settings.startingCapital / 80;

  return plan.forecast.map((point) => {
    const yearsFromStart = point.year - plan.settings.startYear;
    const incomeFactor = Math.pow(1 + scenario.incomeGrowthDelta, Math.max(0, yearsFromStart));
    const expenseFactor = Math.pow(1 + scenario.expenseGrowthDelta, Math.max(0, yearsFromStart));
    const returnFactor = Math.pow(1 + plan.settings.investmentReturn + scenario.returnDelta, Math.max(0, yearsFromStart));
    const income = Math.round(point.income * incomeFactor);
    const expenses = Math.round(point.expenses * expenseFactor);
    const goals = Math.round(point.goals * expenseFactor);
    const savings = Math.round(income + expenses + goals);

    capital = Math.max(0, Math.round((capital + savings) * (1 + plan.settings.investmentReturn + scenario.returnDelta)));

    return {
      ...point,
      income,
      expenses,
      goals,
      savings,
      capital: Math.max(Math.round(point.capital * Math.max(0.65, returnFactor)), capital),
    };
  });
}
