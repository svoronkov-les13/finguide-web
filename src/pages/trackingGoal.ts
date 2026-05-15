import type { Goal } from "@/types/finance";

export function trackingActiveGoal(goals: Goal[] | undefined) {
  const ordered = [...(goals ?? [])].sort((left, right) => {
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    return leftPriority - rightPriority;
  });

  return ordered.find((goal) => goal.cost <= 0 || goal.saved < goal.cost) ?? ordered[0];
}
