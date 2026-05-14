import { beforeEach, describe, expect, it } from "vitest";
import { mockApi } from "@/api/mockApi";

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
});
