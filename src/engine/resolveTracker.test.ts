import { describe, expect, it } from "vitest";
import { resolveMonthlyActuals, yearActualTotal, yearDeviation } from "@/engine/resolveTracker";
import type { MonthData } from "@/pages/trackingMonths";

function makeMonth(id: number, status: MonthData["status"], amount?: number): MonthData {
  return {
    id: String(id).padStart(2, "0"),
    name: `Month ${id}`,
    status,
    amount,
  };
}

function makeYear(statuses: Array<{ status: MonthData["status"]; amount?: number }>): MonthData[] {
  return statuses.map((s, i) => makeMonth(i + 1, s.status, s.amount));
}

describe("resolveMonthlyActuals", () => {
  const PLAN = 50_000;

  it("returns 12 values", () => {
    const months = makeYear(Array.from({ length: 12 }, () => ({ status: "pending" as const })));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result).toHaveLength(12);
  });

  it("future months use plan amount", () => {
    const months = makeYear(Array.from({ length: 12 }, () => ({ status: "pending" as const })));
    const result = resolveMonthlyActuals(months, PLAN, 5, true); // June is current (idx 5)
    // Months 6-11 (Jul-Dec) are future → plan
    for (let i = 6; i < 12; i++) {
      expect(result[i]).toBe(PLAN);
    }
  });

  it("completed months use their fact amount", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i < 3 ? { status: "completed" as const, amount: 60_000 } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[0]).toBe(60_000);
    expect(result[1]).toBe(60_000);
    expect(result[2]).toBe(60_000);
  });

  it("partial months use their fact amount", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 2 ? { status: "partial" as const, amount: 25_000 } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[2]).toBe(25_000);
  });

  it("missed months return 0", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 1 ? { status: "missed" as const, amount: undefined } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[1]).toBe(0);
  });

  it("missed month with non-zero amount still returns 0", () => {
    // Edge case: user somehow has an amount but status is missed
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 1 ? { status: "missed" as const, amount: 30_000 } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[1]).toBe(0);
  });

  it("current month without fact uses plan", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 5 ? { status: "current" as const } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[5]).toBe(PLAN);
  });

  it("current month with fact uses fact", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 5 ? { status: "current" as const, amount: 70_000 } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[5]).toBe(70_000);
  });

  it("pending past months default to plan", () => {
    const months = makeYear(Array.from({ length: 12 }, () => ({ status: "pending" as const })));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    // Past months 0-4 are pending → plan
    for (let i = 0; i < 5; i++) {
      expect(result[i]).toBe(PLAN);
    }
  });

  it("non-current year: all months resolved by status", () => {
    const months = makeYear([
      { status: "completed", amount: 60_000 },
      { status: "partial", amount: 30_000 },
      { status: "missed" },
      ...Array.from({ length: 9 }, () => ({ status: "pending" as const })),
    ]);
    const result = resolveMonthlyActuals(months, PLAN, 5, false);
    expect(result[0]).toBe(60_000);
    expect(result[1]).toBe(30_000);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(PLAN); // pending → plan
  });

  it("completed without amount falls back to plan", () => {
    const months = makeYear(Array.from({ length: 12 }, (_, i) =>
      i === 0 ? { status: "completed" as const } : { status: "pending" as const }
    ));
    const result = resolveMonthlyActuals(months, PLAN, 5, true);
    expect(result[0]).toBe(PLAN); // completed but no amount → plan
  });
});

describe("yearActualTotal", () => {
  it("sums all values", () => {
    const actuals = [50000, 60000, 0, 50000, 25000, 50000, 50000, 50000, 50000, 50000, 50000, 50000];
    expect(yearActualTotal(actuals)).toBe(535000);
  });
});

describe("yearDeviation", () => {
  it("positive when saved more than planned", () => {
    const actuals = Array.from({ length: 12 }, () => 60_000);
    expect(yearDeviation(actuals, 50_000)).toBe(120_000);
  });

  it("negative when saved less than planned", () => {
    const actuals = Array.from({ length: 12 }, () => 40_000);
    expect(yearDeviation(actuals, 50_000)).toBe(-120_000);
  });

  it("zero when exactly on plan", () => {
    const actuals = Array.from({ length: 12 }, () => 50_000);
    expect(yearDeviation(actuals, 50_000)).toBe(0);
  });
});
