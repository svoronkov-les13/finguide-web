import { describe, expect, it } from "vitest";
import { mockPlan } from "@/data/mock-plan";
import { calculateForecast } from "@/engine/calculateForecast";

describe("calculateForecast", () => {
  it("returns the same number of forecast points and keeps capital non-negative", () => {
    const forecast = calculateForecast(mockPlan);

    expect(forecast).toHaveLength(mockPlan.forecast.length);
    expect(forecast.every((point) => point.capital >= 0)).toBe(true);
  });

  it("responds to scenario changes", () => {
    const base = calculateForecast({ ...mockPlan, activeScenario: "base" }).at(-1)!.capital;
    const optimistic = calculateForecast({ ...mockPlan, activeScenario: "optimistic" }).at(-1)!.capital;

    expect(optimistic).toBeGreaterThan(base);
  });

  it("is backward-compatible without options", () => {
    const withoutOptions = calculateForecast(mockPlan);
    const withEmptyOptions = calculateForecast(mockPlan, {});
    const withZeroDeviation = calculateForecast(mockPlan, { trackerDeviation: 0 });

    expect(withoutOptions).toEqual(withEmptyOptions);
    expect(withoutOptions).toEqual(withZeroDeviation);
  });

  it("positive tracker deviation increases savings for the tracked year", () => {
    const startYear = mockPlan.settings.startYear;
    const basePoint = calculateForecast(mockPlan).find((p) => p.year === startYear)!;
    const boostedPoint = calculateForecast(mockPlan, {
      trackerDeviation: 500_000,
      trackerYear: startYear,
    }).find((p) => p.year === startYear)!;

    expect(boostedPoint.savings).toBe(basePoint.savings + 500_000);
  });

  it("negative tracker deviation decreases savings for the tracked year", () => {
    const startYear = mockPlan.settings.startYear;
    const basePoint = calculateForecast(mockPlan).find((p) => p.year === startYear)!;
    const reducedPoint = calculateForecast(mockPlan, {
      trackerDeviation: -500_000,
      trackerYear: startYear,
    }).find((p) => p.year === startYear)!;

    expect(reducedPoint.savings).toBe(basePoint.savings - 500_000);
  });

  it("tracker deviation only affects the specified year", () => {
    const startYear = mockPlan.settings.startYear;
    // Apply deviation to a non-existent year — should have no effect
    const base = calculateForecast(mockPlan).at(-1)!.capital;
    const noEffect = calculateForecast(mockPlan, {
      trackerDeviation: 1_000_000,
      trackerYear: startYear - 10,
    }).at(-1)!.capital;

    expect(noEffect).toBe(base);
  });
});
