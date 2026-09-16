// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockApi } from "@/api/mockApi";
import { mockPlan } from "@/data/mock-plan";

describe("mockApi", () => {
  beforeEach(async () => {
    await mockApi.resetPlan();
  });

  it("persists cashflow CRUD changes in the mock plan snapshot", async () => {
    const initial = await mockApi.getPlan();
    const added = await mockApi.addCashflow({
      name: "Тестовый доход",
      type: "income",
      frequency: "monthly",
      amount: 500,
      currency: "USD",
      startYear: 2026,
      endYear: 2030,
      growth: 0.02,
      enabled: true,
      category: "Ежемесячные доходы",
    });
    const created = added.cashflows.find((item) => item.name === "Тестовый доход");

    expect(created).toBeDefined();
    expect(added.cashflows).toHaveLength(initial.cashflows.length + 1);

    const updated = await mockApi.updateCashflow(created!.id, { amount: 900 });
    expect(updated.cashflows.find((item) => item.id === created!.id)?.amount).toBe(900);

    const duplicated = await mockApi.duplicateCashflow(created!.id);
    expect(duplicated.cashflows.filter((item) => item.name.startsWith("Тестовый доход"))).toHaveLength(2);

    const deleted = await mockApi.deleteCashflow(created!.id);
    expect(deleted.cashflows.some((item) => item.id === created!.id)).toBe(false);
  });

  it("resets to the Figma dashboard snapshot", async () => {
    await mockApi.updateSettings({ retirementAge: 55 });
    const reset = await mockApi.resetPlan();

    expect(reset.dashboardSnapshot?.independenceYear).toBe(2076);
    expect(reset.settings.retirementAge).toBe(50);
    expect(reset.pensionProjection).toBeDefined();
  });

  it("recalculates pension projection when spending and pension return change", async () => {
    const initial = await mockApi.getPlan();
    const higherSpending = await mockApi.updateSettings({ targetMonthlySpend: 100_000 });
    const higherReturn = await mockApi.updateSettings({ pensionInvestmentReturn: 0.12 });

    expect(higherSpending.pensionProjection!.spendDown.requiredCapitalAtRetirement).toBeGreaterThan(
      initial.pensionProjection!.spendDown.requiredCapitalAtRetirement,
    );
    expect(higherSpending.pensionProjection!.preserveCapital.requiredCapitalAtRetirement).not.toBeNull();
    expect(higherReturn.pensionProjection!.preserveCapital.requiredCapitalAtRetirement!).toBeLessThan(
      higherSpending.pensionProjection!.preserveCapital.requiredCapitalAtRetirement!,
    );
    expect(higherReturn.pensionProjection!.spendDown.requiredCapitalAtRetirement).toBeLessThan(
      higherSpending.pensionProjection!.spendDown.requiredCapitalAtRetirement,
    );
  });

  it("keeps the selected withdrawal strategy while recalculating the projection", async () => {
    await mockApi.updateSettings({
      withdrawalStrategy: "preserve_capital",
      targetMonthlySpend: 100_000,
    });

    const updated = await mockApi.updateSettings({ pensionInvestmentReturn: 0.12 });

    expect(updated.settings.withdrawalStrategy).toBe("preserve_capital");
    expect(updated.pensionProjection?.preserveCapital.requiredCapitalStatus).toBe("calculated");
    expect(updated.pensionProjection?.preserveCapital.requiredCapitalAtRetirement).toBeTypeOf("number");
    expect(updated.pensionProjection?.spendDown.requiredCapitalAtRetirement).toBeTypeOf("number");
  });

  it("applies a what-if scenario without mutating base settings", async () => {
    const initial = await mockApi.getPlan();
    const next = await mockApi.saveWhatIfScenario({
      incomeGrowthDelta: 0.15,
      expenseGrowthDelta: 0.05,
      returnDelta: 0.01,
      inflationDelta: -0.01,
      retirementAgeShift: -2,
      goalsCostDelta: 0,
    });

    expect(next.activeScenario).toBe("whatif");
    expect(next.settings).toEqual(initial.settings);
    expect(next.forecast.at(-1)?.capital).not.toBe(initial.forecast.at(-1)?.capital);
  });

  it("migrates a stored legacy plan without a pension projection on fresh import", async () => {
    const legacyPlan = structuredClone(mockPlan);
    delete legacyPlan.pensionProjection;
    localStorage.setItem("finguide.mock-plan.v1", JSON.stringify(legacyPlan));
    vi.resetModules();

    try {
      const { mockApi: freshMockApi } = await import("@/api/mockApi");
      const migrated = await freshMockApi.getPlan();

      expect(migrated.pensionProjection).toBeDefined();

      await freshMockApi.updateSettings({ targetMonthlySpend: 100_000 });
      const stored = JSON.parse(localStorage.getItem("finguide.mock-plan.v1") ?? "null");
      expect(stored.pensionProjection).toBeDefined();
    } finally {
      localStorage.clear();
      vi.resetModules();
    }
  });
});
