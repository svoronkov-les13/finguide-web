import type { Goal } from "@/types/finance";

export interface GoalFeasibility {
  /** Number of goals projected as reachable */
  reachableCount: number;
  /** Total number of goals */
  totalCount: number;
  /** Weighted completion percentage (by cost) */
  weightedPct: number;
  /** Monthly deficit to cover all goals (0 if no deficit) */
  monthlyDeficit: number;
}

/**
 * Computes goal feasibility metrics from the backend-projected fields.
 *
 * - `reachableCount` — goals where `projectedReachable` or `reachable` is true
 * - `weightedPct` — sum(projectedSaved or saved) / sum(projectedCost or cost) * 100
 * - `monthlyDeficit` — (totalRemainingCost / remainingMonths) - currentMonthlySavings
 *
 * @param goals        Array of Goal objects with backend-computed projections
 * @param monthlySavings  Current monthly savings rate (from dashboardSnapshot)
 * @param currentYear  Current calendar year
 */
export function computeGoalFeasibility(
  goals: Goal[],
  monthlySavings: number,
  currentYear: number,
): GoalFeasibility {
  if (goals.length === 0) {
    return { reachableCount: 0, totalCount: 0, weightedPct: 0, monthlyDeficit: 0 };
  }

  const reachableCount = goals.filter((g) => g.reachable).length;
  const totalCount = goals.length;

  // Weighted by cost: how much of the total projected cost is covered by projected savings
  const totalProjectedCost = goals.reduce((sum, g) => sum + (g.projectedCost ?? g.cost), 0);
  const totalProjectedSaved = goals.reduce((sum, g) => sum + (g.projectedSaved ?? g.saved), 0);
  const weightedPct = totalProjectedCost > 0
    ? Math.min(100, Math.round((totalProjectedSaved / totalProjectedCost) * 100))
    : 0;

  // Monthly deficit: what extra per month is needed to cover all remaining costs
  const totalRemaining = goals.reduce((sum, g) => {
    const cost = g.projectedCost ?? g.cost;
    const saved = g.projectedSaved ?? g.saved;
    return sum + Math.max(0, cost - saved);
  }, 0);

  // Use the furthest goal's target year to determine remaining months
  const maxTargetYear = Math.max(...goals.map((g) => g.targetYear));
  const remainingMonths = Math.max(1, (maxTargetYear - currentYear) * 12);
  const requiredMonthly = totalRemaining / remainingMonths;
  const monthlyDeficit = Math.max(0, Math.round(requiredMonthly - monthlySavings));

  return { reachableCount, totalCount, weightedPct, monthlyDeficit };
}
