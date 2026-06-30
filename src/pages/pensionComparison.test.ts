import { describe, expect, it } from "vitest";
import { pensionExpenseComparison } from "@/pages/pensionComparison";
import type { Cashflow } from "@/types/finance";

function cashflow(overrides: Partial<Cashflow>): Cashflow {
  return {
    id: "cashflow",
    name: "Cashflow",
    type: "expense",
    frequency: "monthly",
    amount: 0,
    currency: "RUB",
    startYear: 2026,
    endYear: null,
    growth: 0,
    enabled: true,
    category: "Расходы",
    ...overrides,
  };
}

describe("pensionExpenseComparison", () => {
  it("inflates current monthly expenses to the retirement year independently from planned spend", () => {
    const comparison = pensionExpenseComparison({
      cashflows: [
        cashflow({ id: "rent", amount: 120_000 }),
        cashflow({ id: "food", amount: 68_014.12 }),
        cashflow({ id: "old", amount: 50_000, endYear: 2025 }),
        cashflow({ id: "disabled", amount: 10_000, enabled: false }),
        cashflow({ id: "annual", amount: 120_000, frequency: "yearly" }),
      ],
      currentYear: 2026,
      inflation: 0.08,
      targetMonthlySpend: 300_000,
      yearsToRetirement: 25,
    });

    expect(Math.round(comparison.plannedMonthlyAtRetirement)).toBe(2_054_543);
    expect(Math.round(comparison.currentMonthlyAtRetirement)).toBe(1_287_610);
    expect(comparison.plannedPercentOfCurrent).toBe(160);
  });
});
