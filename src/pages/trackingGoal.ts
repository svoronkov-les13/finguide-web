import type { Goal } from "@/types/finance";

export function trackingActiveGoal(goals: Goal[] | undefined) {
  const ordered = orderedTrackingGoals(goals);

  return ordered.find((goal) => goal.cost <= 0 || goal.saved < goal.cost) ?? ordered[0];
}

export function nearestGoalMonthlyTarget(goals: Goal[] | undefined, currentYear: number, monthsInYear = 12) {
  const goal = trackingActiveGoal(goals);
  if (!goal) return 0;

  const targetCost = goal.projectedCost ?? goal.cost;
  const remaining = Math.max(0, targetCost - goal.saved);
  const monthsUntilTarget = Math.max(1, (goal.targetYear - currentYear + 1) * monthsInYear);
  return Math.round(remaining / monthsUntilTarget);
}

function orderedTrackingGoals(goals: Goal[] | undefined) {
  return [...(goals ?? [])].sort((left, right) => {
    if (left.targetYear !== right.targetYear) return left.targetYear - right.targetYear;
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    return leftPriority - rightPriority || left.id.localeCompare(right.id);
  });
}
