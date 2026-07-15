import type { Goal } from "@/types/finance";

export interface GoalProgress {
  cost: number;
  saved: number;
  percent: number;
  achieved: boolean;
}

export function goalProgress(goal: Goal): GoalProgress {
  const cost = goal.cost;
  const saved = goal.saved;
  const percent = cost > 0 ? Math.min(100, Math.round((saved / cost) * 100)) : 0;

  return {
    cost,
    saved,
    percent,
    achieved: cost > 0 && saved >= cost,
  };
}
