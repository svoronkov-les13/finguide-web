
export interface BalanceSnapshot {
  year: number;
  monthlyIncome: number;
  yearlyIncome: number;
  totalIncome: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  monthlyGoalExpenses?: number;
  yearlyGoalExpenses?: number;
  goalExpenses: number;
  totalOutflow: number;
  netSavings: number;
}
