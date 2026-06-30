// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { nextGrowthRangeStartYear } from "@/components/cashflow/CashflowModal";

describe("CashflowModal growth ranges", () => {
  it("starts a new range from the previous range end year", () => {
    expect(nextGrowthRangeStartYear([
      { startYear: 2026, endYear: 2030, growthPercent: 5 },
    ], 2026)).toBe(2030);
  });

  it("uses the cashflow start year for the first range", () => {
    expect(nextGrowthRangeStartYear([], 2026)).toBe(2026);
  });
});
