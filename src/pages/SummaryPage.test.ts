// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { effectiveGrowth, formatGrowthPercent } from "@/pages/SummaryPage";

describe("SummaryPage growth display", () => {
  it("shows plan inflation for inflation-indexed items with zero stored growth", () => {
    expect(effectiveGrowth({ growth: 0, growthType: "inflation" }, 0.08)).toBe(0.08);
    expect(formatGrowthPercent(effectiveGrowth({ growth: 0, growthType: "inflation" }, 0.08))).toBe("+8%");
  });

  it("keeps custom zero growth as zero", () => {
    expect(effectiveGrowth({ growth: 0, growthType: "custom" }, 0.08)).toBe(0);
    expect(formatGrowthPercent(0)).toBe("0%");
  });

  it("shows the first configured range growth for range-based cashflows", () => {
    const growth = effectiveGrowth({
      growth: 0,
      growthType: "ranges",
      growthRanges: [
        { startYear: 2026, endYear: null, growthPercent: 5 },
      ],
    }, 0.08);

    expect(growth).toBe(0.05);
    expect(formatGrowthPercent(growth)).toBe("+5%");
  });
});
