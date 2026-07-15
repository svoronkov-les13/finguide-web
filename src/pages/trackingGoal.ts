import { goalProgress } from "@/components/goals/goalProgress";
import type { Goal } from "@/types/finance";

export function trackingActiveGoal(goals: Goal[] | undefined) {
  const ordered = orderedTrackingGoals(goals);

  return ordered.find((goal) => goalTargetCost(goal) <= 0 || goal.saved < goalTargetCost(goal)) ?? ordered[0];
}

export function nearestGoalMonthlyTarget(goals: Goal[] | undefined, currentYear: number, monthsInYear = 12) {
  const goal = trackingActiveGoal(goals);
  if (!goal) return 0;

  const remaining = goalRemaining(goal);
  const monthsUntilTarget = Math.max(1, (goal.targetYear - currentYear + 1) * monthsInYear);
  return Math.round(remaining / monthsUntilTarget);
}

export function goalSavingNeeds(goals: Goal[] | undefined, currentYear: number, currentMonthIdx: number, monthsInYear = 12) {
  const activeGoals = orderedTrackingGoals(goals).filter((goal) => goalTargetCost(goal) <= 0 || goal.saved < goalTargetCost(goal));
  const currentYearGoals = activeGoals.filter((goal) => goal.targetYear === currentYear);
  const summaryGoals = currentYearGoals.length > 0 ? currentYearGoals : activeGoals.slice(0, 1);

  return {
    currentYearSaved: sumSaved(summaryGoals),
    currentYearTotal: sumTargetCost(summaryGoals),
    currentYearMonthly: sumMonthlyNeed(summaryGoals, currentYear, currentMonthIdx, monthsInYear),
    allGoalsMonthly: sumMonthlyNeed(activeGoals, currentYear, currentMonthIdx, monthsInYear),
  };
}

export function goalTargetCost(goal: Goal) {
  return goal.projectedCost ?? goal.cost;
}

export function trackingGoalProgress(goal: Goal) {
  return goalProgress(goal);
}

function sumSaved(goals: Goal[]) {
  return goals.reduce((total, goal) => total + Math.min(goal.saved, goalTargetCost(goal)), 0);
}

function sumTargetCost(goals: Goal[]) {
  return goals.reduce((total, goal) => total + goalTargetCost(goal), 0);
}

function sumMonthlyNeed(goals: Goal[], currentYear: number, currentMonthIdx: number, monthsInYear: number) {
  return goals.reduce((total, goal) => {
    const monthsUntilTarget = monthsToTarget(goal, currentYear, currentMonthIdx, monthsInYear);
    return total + Math.round(goalRemaining(goal) / monthsUntilTarget);
  }, 0);
}

function goalRemaining(goal: Goal) {
  return Math.max(0, goalTargetCost(goal) - goal.saved);
}

function monthsToTarget(goal: Goal, currentYear: number, currentMonthIdx: number, monthsInYear: number) {
  const targetMonth = goal.targetMonth ?? monthsInYear;
  const currentMonth = currentMonthIdx + 1;
  return Math.max(1, (goal.targetYear - currentYear) * monthsInYear + targetMonth - currentMonth + 1);
}

function orderedTrackingGoals(goals: Goal[] | undefined) {
  return [...(goals ?? [])].sort(compareGoalTargetOrder);
}

export function compareGoalTargetOrder(left: Goal, right: Goal) {
  if (left.targetYear !== right.targetYear) return left.targetYear - right.targetYear;

  const leftMonth = left.targetMonth ?? 12;
  const rightMonth = right.targetMonth ?? 12;
  if (leftMonth !== rightMonth) return leftMonth - rightMonth;

  const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
  const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
  return leftPriority - rightPriority || left.id.localeCompare(right.id);
}
