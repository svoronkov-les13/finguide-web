import { describe, expect, it } from "vitest";
import { cashflowYearlyTotals } from "@/components/cashflow/cashflowSparkline";
import type { Cashflow } from "@/types/finance";

function cashflow(overrides: Partial<Cashflow>): Cashflow {
  return {
    id: "cf-1",
    name: "Зарплата",
    type: "income",
    frequency: "monthly",
    amount: 100_000,
    currency: "RUB",
    startYear: 2026,
    endYear: null,
    growth: 0.08,
    enabled: true,
    category: "Ежемесячные доходы",
    ...overrides,
  };
}

describe("cashflowYearlyTotals", () => {
  it("compounds the fractional growth rate per year", () => {
    const totals = cashflowYearlyTotals([cashflow({})], 2026, 3);

    expect(totals[0]).toBe(1_200_000);
    expect(totals[1]).toBeCloseTo(1_200_000 * 1.08, 5);
    expect(totals[2]).toBeCloseTo(1_200_000 * 1.08 ** 2, 5);
  });

  it("excludes disabled and not-yet-started items", () => {
    const totals = cashflowYearlyTotals(
      [cashflow({ enabled: false }), cashflow({ id: "cf-2", startYear: 2027, growth: 0 })],
      2026,
      2,
    );

    expect(totals[0]).toBe(0);
    expect(totals[1]).toBe(1_200_000);
  });
});
