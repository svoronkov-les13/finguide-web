import type { YearlyProjectionPoint } from './yearlyProjectionPoint';

export interface DashboardMetrics {
  totalMonthlyIncome: number;
  totalYearlyIncome: number;
  totalMonthlyExpenses: number;
  totalYearlyExpenses: number;
  netMonthlyBalance: number;
  netYearlyBalance: number;
  savingsRatePct: number;
  totalGoalsCost: number;
  totalGoalsSaved: number;
  totalGoalsRemaining: number;
  monthlyGoalContribution: number;
  availableForPension: number;
  projectedPensionCapital: number;
  yearsToRetirement: number;
  emergencyFundTarget: number;
  emergencyFundCurrent: number;
  emergencyFundPct: number;
  yearlyProjection: YearlyProjectionPoint[];
}
