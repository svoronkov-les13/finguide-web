import { describe, expect, it } from "vitest";
import { trackingYearSummary } from "@/pages/trackingYearSummary";
import type { MonthData } from "@/pages/trackingMonths";

function month(id: number, status: MonthData["status"], amount?: number): MonthData {
  return {
    id: String(id).padStart(2, "0"),
    name: `Month ${id}`,
    status,
    amount,
  };
}

describe("trackingYearSummary", () => {
  it("counts unmarked months as plan and marked months as their actual result", () => {
    const months = [
      month(1, "pending"),
      month(2, "completed", 150_000),
      month(3, "partial", 60_000),
      month(4, "missed"),
      ...Array.from({ length: 8 }, (_, i) => month(i + 5, "pending")),
    ];

    expect(trackingYearSummary(months, 100_000, 6, true)).toEqual({
      totalSaved: 1_110_000,
      totalPlanned: 1_200_000,
      totalPercent: 93,
    });
  });
});
