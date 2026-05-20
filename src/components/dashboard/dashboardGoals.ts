import type { Goal } from "@/types/finance";

export function sortDashboardGoals(goals: Goal[]) {
  return [...goals].sort((a, b) => {
    const dateDiff = a.targetYear - b.targetYear || (a.targetMonth ?? 12) - (b.targetMonth ?? 12);
    if (dateDiff !== 0) return dateDiff;

    const priorityDiff = (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
    if (priorityDiff !== 0) return priorityDiff;

    return a.id.localeCompare(b.id);
  });
}
