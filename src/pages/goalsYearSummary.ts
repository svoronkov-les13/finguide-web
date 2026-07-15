import type { Goal } from "@/types/finance";
import { goalProgress } from "@/components/goals/goalProgress";

export interface GoalYearSummary {
  totalProjectedCost: number;
  remaining: number;
  monthlyUntilYearEnd: number;
  saved: number;
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
  const progressByGoal = yearGoals.map((goal) => ({ goal, progress: goalProgress(goal) }));
  const totalProjectedCost = progressByGoal.reduce((total, item) => total + item.progress.cost, 0);
  const saved = progressByGoal.reduce((total, item) => total + item.progress.saved, 0);
  const remaining = progressByGoal.reduce((total, item) => total + Math.max(0, item.progress.cost - item.progress.saved), 0);
  const monthlyNeed = progressByGoal.reduce((total, item) => {
    const monthsLeft = monthsToTarget(item.goal, currentYear, currentMonthIdx, monthsInYear);
    return total + Math.max(0, item.progress.cost - item.progress.saved) / monthsLeft;
  }, 0);

  return {
    totalProjectedCost,
    remaining,
    monthlyUntilYearEnd: Math.round(monthlyNeed),
    saved,
  };
}

function monthsToTarget(goal: Goal, currentYear: number, currentMonthIdx: number, monthsInYear: number) {
  const targetMonth = goal.targetMonth ?? monthsInYear;
  const currentMonth = currentMonthIdx + 1;
  return Math.max(1, (goal.targetYear - currentYear) * monthsInYear + targetMonth - currentMonth + 1);
}
