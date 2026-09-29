import type { Goal } from "@/types/finance";

export interface GoalProgress {
  cost: number;
  saved: number;
  percent: number;
  /** The projection covers the full cost by the target date. */
  funded: boolean;
  /** Funded and the target date has already come: the goal is done, not just reachable. */
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

export function goalTargetDateReached(goal: Goal, now = new Date()): boolean {
  const year = now.getFullYear();
  return year > goal.targetYear || (year === goal.targetYear && now.getMonth() + 1 >= (goal.targetMonth ?? 12));
}

export function goalIsActuallyAchieved(goal: Goal, now = new Date()): boolean {
  return goalProgress(goal, now).achieved;
}

export function goalProgress(goal: Goal, now = new Date()): GoalProgress {
  const cost = goalProgressCost(goal);
  const saved = goalFundedAmount(goal);
  const percent = cost > 0 ? Math.min(100, Math.round((saved / cost) * 100)) : 0;
  const funded = cost > 0 && saved >= cost;

  return {
    cost,
    saved,
    percent,
    funded,
    achieved: funded && goalTargetDateReached(goal, now),
  };
}
