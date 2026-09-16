import type { Cashflow } from "@/types/finance";

export interface SparklinePaths {
  strokePath: string;
  fillPath: string;
}

/**
 * Yearly totals for a column of cashflow items over the horizon.
 * `growth` on a Cashflow is a fraction (0.08 = 8%/year), not percent.
 */
export function cashflowYearlyTotals(items: Cashflow[], startYear: number, horizon = 20): number[] {
  const yearlyValues: number[] = [];
  for (let year = startYear; year < startYear + horizon; year++) {
    let yearSum = 0;
    for (const item of items) {
      if (!item.enabled) continue;
      const isStarted = year >= item.startYear;
      const isNotEnded = item.endYear === null || year <= item.endYear;
      if (!isStarted || !isNotEnded) continue;
      const yearsFromStart = year - item.startYear;
      const growthFactor = Math.pow(1 + (item.growth ?? 0), yearsFromStart);
      yearSum += (item.frequency === "monthly" ? item.amount * 12 : item.amount) * growthFactor;
    }
    yearlyValues.push(yearSum);
  }
  return yearlyValues;
}

export function buildCashflowSparkline(
  items: Cashflow[],
  startYear: number,
  horizon = 20,
  width = 96,
  height = 32,
): SparklinePaths {
  const yearlyValues = cashflowYearlyTotals(items, startYear, horizon);
  const minVal = Math.min(...yearlyValues);
  const maxVal = Math.max(...yearlyValues);
  const paddingBottom = 4;
  const paddingTop = 4;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = yearlyValues.map((val, i) => {
    const x = (i / (horizon - 1)) * width;
    let y = height - paddingBottom;
    if (maxVal > minVal) {
      y = height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    } else if (maxVal > 0) {
      y = height / 2;
    }
    return { x, y };
  });

  const strokePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return { strokePath, fillPath: `${strokePath} L${width},${height} L0,${height} Z` };
}
