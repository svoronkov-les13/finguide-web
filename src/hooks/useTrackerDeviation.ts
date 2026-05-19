import { useMemo } from "react";
import { usePlanQuery, useMonthlyTrackerQuery } from "@/api/planQueries";
import { resolveMonthlyActuals, yearDeviation } from "@/engine/resolveTracker";
import { makeEmptyYear } from "@/pages/trackingMonths";
import type { MonthData, MonthStatus } from "@/pages/trackingMonths";

/**
 * Hook that computes the tracker deviation for the current year.
 * Returns the deviation value (positive = above plan, negative = below plan)
 * that can be fed into calculateForecast or used for dashboard adjustments.
 */
export function useTrackerDeviation() {
  const { data: plan } = usePlanQuery();
  const { data: trackerData = [] } = useMonthlyTrackerQuery();

  return useMemo(() => {
    if (!plan) return { deviation: 0, year: new Date().getFullYear(), hasData: false };

    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();
    const monthlyPlan = plan.dashboardSnapshot?.monthlyTargetRub ?? 0;

    // Build month grid for the current year from tracker entries
    const base = makeEmptyYear(currentYear, currentYear, currentMonthIdx);
    const months: MonthData[] = base.map((m, idx) => {
      const entry = trackerData.find((e) => {
        const [eYear, eMonth] = e.month.split("-");
        return Number(eYear) === currentYear && Number(eMonth) - 1 === idx;
      });
      if (!entry) return m;
      return {
        ...m,
        status: entry.status === "pending"
          ? (idx === currentMonthIdx ? "current" : "pending")
          : entry.status as MonthStatus,
        amount: entry.amount ?? undefined,
      };
    });

    const actuals = resolveMonthlyActuals(months, monthlyPlan, currentMonthIdx, true);
    const deviation = yearDeviation(actuals, monthlyPlan);
    const hasData = trackerData.some((e) => e.month.startsWith(String(currentYear)));

    return { deviation, year: currentYear, hasData };
  }, [plan, trackerData]);
}
