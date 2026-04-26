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
});
