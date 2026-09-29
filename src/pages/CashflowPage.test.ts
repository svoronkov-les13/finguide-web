// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { withFrequency } from "@/pages/CashflowPage";
import type { Cashflow } from "@/types/finance";

const salary: Cashflow = {
  id: "salary",
  type: "income",
  name: "Зарплата",
  amount: 150_000,
  currency: "RUB",
  category: "Ежемесячные доходы",
  frequency: "monthly",
  startYear: 2026,
  endYear: 2040,
  growth: 0,
  enabled: true,
};

describe("withFrequency", () => {
  it("keeps the period when moving between recurring columns", () => {
    expect(withFrequency(salary, "yearly")).toMatchObject({ frequency: "yearly", startYear: 2026, endYear: 2040 });
  });

  it("pins a one-time entry to its start year", () => {
    expect(withFrequency(salary, "onetime")).toMatchObject({ frequency: "onetime", startYear: 2026, endYear: 2026 });
  });

  it("makes a former one-time entry open-ended again", () => {
    const bonus = { ...salary, frequency: "onetime" as const, endYear: 2026 };
    expect(withFrequency(bonus, "monthly")).toMatchObject({ frequency: "monthly", endYear: null });
  });
});
