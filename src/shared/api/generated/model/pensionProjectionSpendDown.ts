import type { PensionSpendDownPoint } from './pensionSpendDownPoint';

export type PensionProjectionSpendDown = {
  desiredMonthlyExpensesCurrentPrices: number;
  desiredAnnualExpensesAtRetirement: number;
  requiredCapitalAtRetirement: number;
  retirementYears: number;
  depletionAge: number;
  series: PensionSpendDownPoint[];
};
