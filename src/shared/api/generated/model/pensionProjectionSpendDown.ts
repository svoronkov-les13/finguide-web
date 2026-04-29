import type { PensionSpendDownPoint } from './pensionSpendDownPoint';

export type PensionProjectionSpendDown = {
  desiredMonthlyExpensesCurrentPrices: number;
  desiredAnnualExpensesAtRetirement: number;
  retirementYears: number;
  depletionAge: number;
  series: PensionSpendDownPoint[];
};
