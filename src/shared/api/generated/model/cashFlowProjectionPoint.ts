
export interface CashFlowProjectionPoint {
  year: number;
  /** @nullable */
  age: number | null;
  periodNo: number;
  monthlyIncome?: number;
  yearlyIncome?: number;
  totalIncome: number;
  monthlyExpenses?: number;
  yearlyExpenses?: number;
  totalExpenses: number;
  monthlyGoalExpenses?: number;
  yearlyGoalExpenses?: number;
  totalGoalExpenses: number;
  netSavings: number;
  investmentReturnPct?: number;
  capitalStartOfYear?: number;
  capitalEndOfYear: number;
}
