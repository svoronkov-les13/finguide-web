import type { FinancialPlan, ForecastPoint } from "@/types/finance";

export interface ForecastOptions {
  /**
   * Optional tracker actuals for the current year.
   * When provided, the forecast for the current year adjusts capital
   * based on the deviation between actual savings and planned savings.
   */
  trackerDeviation?: number;
  /** The year the tracker data applies to (defaults to current calendar year) */
  trackerYear?: number;
}

export function calculateForecast(plan: FinancialPlan, options?: ForecastOptions): ForecastPoint[] {
  const scenario = plan.scenarios.find((item) => item.id === plan.activeScenario) ?? plan.scenarios[0];
  let capital = plan.settings.startingCapital / 80;
  const returnRate = Math.max(-0.95, plan.settings.investmentReturn + scenario.returnDelta);
  const expenseDelta = scenario.expenseGrowthDelta + (scenario.inflationDelta ?? 0);
  const goalsDelta = expenseDelta + (scenario.goalsCostDelta ?? 0);

  const trackerDeviation = options?.trackerDeviation ?? 0;
  const trackerYear = options?.trackerYear;

  return plan.forecast.map((point) => {
    const yearsFromStart = point.year - plan.settings.startYear;
    const incomeFactor = Math.pow(1 + scenario.incomeGrowthDelta, Math.max(0, yearsFromStart));
    const expenseFactor = Math.pow(1 + expenseDelta, Math.max(0, yearsFromStart));
    const goalsFactor = Math.pow(1 + goalsDelta, Math.max(0, yearsFromStart));
    const returnFactor = Math.pow(1 + returnRate, Math.max(0, yearsFromStart));
    const income = Math.round(point.income * incomeFactor);
    const expenses = Math.round(point.expenses * expenseFactor);
    const goals = Math.round(point.goals * goalsFactor);
    let savings = Math.round(income + expenses + goals);

    // Apply tracker deviation for the tracked year:
    // Positive deviation = saved more than planned → increase savings
    // Negative deviation = saved less than planned → decrease savings
    if (trackerYear != null && point.year === trackerYear && trackerDeviation !== 0) {
      savings += trackerDeviation;
    }

    capital = Math.max(0, Math.round((capital + savings) * (1 + returnRate)));

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
