import type { MonthData } from "@/pages/trackingMonths";

/**
 * Resolves the effective savings amount for each month of a year,
 * applying fact-vs-plan rules:
 *
 * - **Past month, fact filled (completed/partial)** → use fact amount
 * - **Past month, missed** → 0 (user explicitly failed)
 * - **Past month, no data (pending)** → use plan amount (default assumption)
 * - **Current month, fact filled** → use fact amount
 * - **Current month, no fact** → use plan amount
 * - **Future months** → plan amount
 *
 * @param months     12-element MonthData array for the year
 * @param monthlyPlan  The planned monthly savings amount
 * @param currentMonthIdx  0-based index of the current month (0 = January)
 * @param isCurrentYear  Whether the months array is for the current calendar year
 * @returns 12-element array of effective amounts
 */
export function resolveMonthlyActuals(
  months: MonthData[],
  monthlyPlan: number,
  currentMonthIdx: number,
  isCurrentYear: boolean,
): number[] {
  return months.map((month, i) => {
    // Future months always use plan
    if (isCurrentYear && i > currentMonthIdx) {
      return monthlyPlan;
    }

    // Non-current year, all months treated uniformly based on status
    if (!isCurrentYear) {
      return resolveByStatus(month, monthlyPlan);
    }

    // Current year, past or current month
    return resolveByStatus(month, monthlyPlan);
  });
}

function resolveByStatus(month: MonthData, monthlyPlan: number): number {
  switch (month.status) {
    case "completed":
    case "partial":
      // User submitted a fact amount
      return month.amount ?? monthlyPlan;
    case "missed":
      // User explicitly marked as failed → 0
      return 0;
    case "current":
      // Current month: use fact if filled, otherwise plan
      return month.amount ?? monthlyPlan;
    case "pending":
    default:
      // No data yet → assume plan
      return monthlyPlan;
  }
}

/**
 * Computes the year total from resolved actuals.
 */
export function yearActualTotal(actuals: number[]): number {
  return actuals.reduce((sum, v) => sum + v, 0);
}

/**
 * Computes the deviation from plan for a full year.
 * Positive = saved more than planned, negative = saved less.
 */
export function yearDeviation(actuals: number[], monthlyPlan: number): number {
  const planned = monthlyPlan * actuals.length;
  return yearActualTotal(actuals) - planned;
}
