import type { Cashflow } from "@/types/finance";

export function pensionExpenseComparison(input: {
  cashflows: Cashflow[];
  currentYear: number;
  inflation: number;
  targetMonthlySpend: number;
  yearsToRetirement: number;
}) {
  const inflationMultiplier = Math.pow(1 + input.inflation, input.yearsToRetirement);
  const currentMonthlyExpenses = input.cashflows
    .filter((cashflow) =>
      cashflow.enabled &&
      cashflow.type === "expense" &&
      cashflow.frequency === "monthly" &&
      cashflow.startYear <= input.currentYear &&
      (cashflow.endYear === null || cashflow.endYear >= input.currentYear)
    )
    .reduce((total, cashflow) => total + cashflow.amount, 0);

  const plannedMonthlyAtRetirement = input.targetMonthlySpend * inflationMultiplier;
  const currentMonthlyAtRetirement = currentMonthlyExpenses * inflationMultiplier;

  return {
    currentMonthlyExpenses,
    plannedMonthlyAtRetirement,
    currentMonthlyAtRetirement,
    plannedPercentOfCurrent: currentMonthlyAtRetirement > 0
      ? Math.round((plannedMonthlyAtRetirement / currentMonthlyAtRetirement) * 100)
      : 0,
  };
}
