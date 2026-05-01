import { describe, expect, it } from "vitest";
import { getSidebarCounters } from "@/components/layout/sidebarCounters";
import type { FinancialPlan } from "@/types/finance";

const basePlan: FinancialPlan = {
  owner: { name: "Тест", email: "test@example.com", planName: "Plan", tier: "Private" },
  settings: {
    startYear: 2026,
    birthYear: 1990,
    currentAge: 36,
    retirementAge: 60,
    monthsInYear: 12,
    inflation: 0.06,
    investmentReturn: 0.08,
    startingCapital: 0,
    targetMonthlySpend: 0,
  },
  scenarios: [],
  activeScenario: "base",
  cashflows: [
    { id: "inc-1", name: "Зарплата", type: "income", frequency: "monthly", amount: 100, currency: "USD", startYear: 2026, endYear: 2030, growth: 0, enabled: true, category: "Доходы" },
    { id: "inc-disabled", name: "Старый доход", type: "income", frequency: "monthly", amount: 100, currency: "USD", startYear: 2026, endYear: 2030, growth: 0, enabled: false, category: "Доходы" },
    { id: "exp-1", name: "Аренда", type: "expense", frequency: "monthly", amount: 50, currency: "USD", startYear: 2026, endYear: 2030, growth: 0, enabled: true, category: "Расходы" },
    { id: "exp-2", name: "Еда", type: "expense", frequency: "monthly", amount: 25, currency: "USD", startYear: 2026, endYear: 2030, growth: 0, enabled: true, category: "Расходы" },
    { id: "goal-flow", name: "Взнос на цель", type: "goal", frequency: "yearly", amount: 1_000, currency: "USD", startYear: 2026, endYear: 2027, growth: 0, enabled: true, category: "Цели" },
  ],
  goals: [
    { id: "goal-1", name: "Подушка", icon: "Shield", targetYear: 2027, cost: 1_000, saved: 100, growth: 0, reachable: true },
    { id: "goal-2", name: "Ремонт", icon: "Wrench", targetYear: 2028, cost: 2_000, saved: 200, growth: 0, reachable: false },
  ],
  tracker: [],
  forecast: [],
};

describe("getSidebarCounters", () => {
  it("derives income, expense and goal counters from current persisted plan state", () => {
    expect(getSidebarCounters(basePlan)).toEqual({ income: "1", expenses: "2", goals: "2" });
  });

  it("returns zero counters for an empty persisted plan instead of demo defaults", () => {
    expect(getSidebarCounters({ ...basePlan, cashflows: [], goals: [] })).toEqual({ income: "0", expenses: "0", goals: "0" });
  });
});
