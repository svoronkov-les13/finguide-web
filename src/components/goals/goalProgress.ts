import type { Goal } from "@/types/finance";

export interface GoalProgress {
  cost: number;
  saved: number;
  percent: number;
  achieved: boolean;
}

export function goalProgress(goal: Goal): GoalProgress {
  const cost = goal.projectedCost ?? goal.cost;
  const saved = Math.min(cost, goal.saved + (goal.projectedSaved ?? 0));
  const percent = cost > 0 ? Math.min(100, Math.round((saved / cost) * 100)) : 0;

  return {
    cost,
    saved,
    percent,
    achieved: cost > 0 && saved >= cost,
  };
}
