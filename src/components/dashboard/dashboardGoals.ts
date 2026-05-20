import type { Goal } from "@/types/finance";

export function computeDashboardGoalCounts(goals: Goal[]) {
  const reachable = goals.filter((goal) => goal.reachable).length;
  const total = goals.length;

  return {
    total,
    reachable,
    atRisk: total - reachable,
  };
}

export function sortDashboardGoals(goals: Goal[]) {
  return [...goals].sort((a, b) => {
    const dateDiff = a.targetYear - b.targetYear || (a.targetMonth ?? 12) - (b.targetMonth ?? 12);
    if (dateDiff !== 0) return dateDiff;

    const priorityDiff = (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
    if (priorityDiff !== 0) return priorityDiff;

    return a.id.localeCompare(b.id);
  });
}
