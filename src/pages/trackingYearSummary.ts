import { resolveMonthlyActuals, yearActualTotal } from "@/engine/resolveTracker";
import type { MonthData } from "@/pages/trackingMonths";

export function trackingYearSummary(
  months: MonthData[],
  monthlyPlan: number,
  currentMonthIdx: number,
  isCurrentYear: boolean,
) {
  const actuals = resolveMonthlyActuals(months, monthlyPlan, currentMonthIdx, isCurrentYear);
  const totalSaved = yearActualTotal(actuals);
  const totalPlanned = monthlyPlan * actuals.length;
  const totalPercent = totalPlanned > 0 ? Math.round((totalSaved / totalPlanned) * 100) : 0;

  return { totalSaved, totalPlanned, totalPercent };
}
