import type { Goal } from "@/types/finance";

export interface GoalYearSummary {
  totalProjectedCost: number;
  remaining: number;
  monthlyUntilYearEnd: number;
}

export interface GoalPortfolioSummary {
  totalProjectedCost: number;
  totalSaved: number;
  accumulatedPercent: number;
}

export function goalProjectedCost(goal: Goal) {
  return goal.projectedCost ?? goal.cost;
}

export function goalPortfolioSummary(goals: Goal[]): GoalPortfolioSummary {
  const totalProjectedCost = goals.reduce((sum, goal) => sum + goalProjectedCost(goal), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);

  return {
    totalProjectedCost,
    totalSaved,
    accumulatedPercent: totalProjectedCost > 0 ? Math.min(100, Math.round((totalSaved / totalProjectedCost) * 100)) : 0,
  };
}

export function goalYearSummary(
  goals: Goal[],
  targetYear: number,
  currentYear: number,
  currentMonthIdx: number,
  monthsInYear = 12
): GoalYearSummary {
  const yearGoals = goals.filter((goal) => goal.targetYear === targetYear);
  const totalProjectedCost = yearGoals.reduce((total, goal) => total + goalProjectedCost(goal), 0);
  const remaining = yearGoals.reduce((total, goal) => total + Math.max(0, goalProjectedCost(goal) - goal.saved), 0);
  const monthsLeft = Math.max(1, (targetYear - currentYear) * monthsInYear + monthsInYear - currentMonthIdx);

  return {
    totalProjectedCost,
    remaining,
    monthlyUntilYearEnd: Math.round(remaining / monthsLeft),
  };
}
