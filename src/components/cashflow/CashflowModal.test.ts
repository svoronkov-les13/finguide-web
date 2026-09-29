// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { collapseGrowthRangesAtIndex, newGrowthRangeDefaults, nextGrowthRangeStartYear, onetimeDefaultYear } from "@/components/cashflow/CashflowModal";

describe("CashflowModal growth ranges", () => {
  it("starts a new range from the previous range end year", () => {
    expect(nextGrowthRangeStartYear([
      { startYear: 2026, endYear: 2030, growthPercent: 5 },
    ], 2026)).toBe(2030);
  });

  it("uses the cashflow start year for the first range", () => {
    expect(nextGrowthRangeStartYear([], 2026)).toBe(2026);
  });

  it("defaults a new range to one year instead of indefinite", () => {
    expect(newGrowthRangeDefaults([
      { startYear: 2026, endYear: 2031, growthPercent: 5 },
    ], 2026)).toEqual({
      startYear: 2031,
      endYear: 2032,
      growthPercent: 0,
    });
  });

  it("removes ranges after the selected indefinite range", () => {
    expect(collapseGrowthRangesAtIndex([
      { startYear: 2026, endYear: 2030, growthPercent: 5 },
      { startYear: 2030, endYear: 2035, growthPercent: 7 },
      { startYear: 2035, endYear: 2040, growthPercent: 3 },
    ], 1)).toEqual([
      { startYear: 2026, endYear: 2030, growthPercent: 5 },
      { startYear: 2030, endYear: null, growthPercent: 7 },
    ]);
  });
});

describe("onetimeDefaultYear", () => {
  const now = new Date(2026, 8, 29);

  it("dates a new one-time entry this year when the plan started earlier", () => {
    expect(onetimeDefaultYear(2024, now)).toBe(2026);
  });

  it("keeps the plan start year when the plan starts in the future", () => {
    expect(onetimeDefaultYear(2028, now)).toBe(2028);
  });
});
