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

export function goalSavingNeeds(goals: Goal[] | undefined, currentYear: number, currentMonthIdx: number, monthsInYear = 12) {
  const activeGoals = (goals ?? []).filter((goal) => goal.cost <= 0 || goal.saved < (goal.projectedCost ?? goal.cost));
  const currentYearGoals = activeGoals.filter((goal) => goal.targetYear === currentYear);

  return {
    currentYearTotal: sumRemaining(currentYearGoals),
    currentYearMonthly: sumMonthlyNeed(currentYearGoals, currentYear, currentMonthIdx, monthsInYear),
    allGoalsMonthly: sumMonthlyNeed(activeGoals, currentYear, currentMonthIdx, monthsInYear),
  };
}

function sumRemaining(goals: Goal[]) {
  return goals.reduce((total, goal) => total + goalRemaining(goal), 0);
}

function sumMonthlyNeed(goals: Goal[], currentYear: number, currentMonthIdx: number, monthsInYear: number) {
  return goals.reduce((total, goal) => {
    const monthsUntilTarget = monthsToTarget(goal, currentYear, currentMonthIdx, monthsInYear);
    return total + Math.round(goalRemaining(goal) / monthsUntilTarget);
  }, 0);
}

function goalRemaining(goal: Goal) {
  return Math.max(0, (goal.projectedCost ?? goal.cost) - goal.saved);
}

function monthsToTarget(goal: Goal, currentYear: number, currentMonthIdx: number, monthsInYear: number) {
  const targetMonth = goal.targetMonth ?? monthsInYear;
  const currentMonth = currentMonthIdx + 1;
  return Math.max(1, (goal.targetYear - currentYear) * monthsInYear + targetMonth - currentMonth + 1);
}

function orderedTrackingGoals(goals: Goal[] | undefined) {
  return [...(goals ?? [])].sort((left, right) => {
    if (left.targetYear !== right.targetYear) return left.targetYear - right.targetYear;
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    return leftPriority - rightPriority || left.id.localeCompare(right.id);
  });
}
