import type { Goal } from "@/types/finance";

export interface GoalYearSummary {
  totalProjectedCost: number;
  remaining: number;
  monthlyUntilYearEnd: number;
}

export function goalProjectedCost(goal: Goal) {
  return goal.projectedCost ?? goal.cost;
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
