import type { Goal } from "@/types/finance";

export interface GoalProgress {
  cost: number;
  saved: number;
  percent: number;
  achieved: boolean;
}

export function goalProgressCost(goal: Goal): number {
  return goal.projectedCost ?? goal.cost;
}

export function goalFundedAmount(goal: Goal): number {
  const cost = goalProgressCost(goal);
  const projectedAllocation = goal.projectedSaved ?? 0;

  return Math.min(cost, goal.saved + Math.max(0, projectedAllocation));
}

export function goalProgress(goal: Goal): GoalProgress {
  const cost = goalProgressCost(goal);
  const saved = goalFundedAmount(goal);
  const percent = cost > 0 ? Math.min(100, Math.round((saved / cost) * 100)) : 0;

  return {
    cost,
    saved,
    percent,
    achieved: cost > 0 && saved >= cost,
  };
}
