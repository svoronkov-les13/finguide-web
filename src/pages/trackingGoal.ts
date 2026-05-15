import type { Goal } from "@/types/finance";

export function trackingActiveGoal(goals: Goal[] | undefined) {
  return goals?.find((goal) => goal.cost <= 0 || goal.saved < goal.cost) ?? goals?.[0];
}
