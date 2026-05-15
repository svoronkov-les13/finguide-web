// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildForecastChartData, projectionYearsLabel } from "@/components/dashboard/ForecastChart";
import type { ForecastPoint } from "@/types/finance";

const point = (patch: Partial<ForecastPoint>): ForecastPoint => ({
  year: 2024,
  age: 31,
  income: 1_000_000,
  expenses: -500_000,
  goals: -100_000,
  savings: 400_000,
  capital: 2_000_000,
  ...patch,
});

describe("ForecastChart data", () => {
  it("uses backend RUB values directly as millions without FX conversion", () => {
    const [row] = buildForecastChartData([point({})]);

    expect(row.incomeRubMln).toBe(1);
    expect(row.expensesRubMln).toBe(0.5);
    expect(row.goalsAbs).toBe(0.1);
    expect(row.capitalRubMln).toBe(2);
  });

  it("keeps the backend forecast period instead of hardcoding 2026+", () => {
    const data = buildForecastChartData([
      point({ year: 2024 }),
      point({ year: 2025 }),
      point({ year: 2026 }),
    ]);

    expect(data.map((row) => row.year)).toEqual([2024, 2025, 2026]);
  });

  it("derives projection length from data", () => {
    expect(projectionYearsLabel([point({ year: 2024 }), point({ year: 2026 })])).toBe(3);
    expect(projectionYearsLabel([])).toBe(0);
  });
});
