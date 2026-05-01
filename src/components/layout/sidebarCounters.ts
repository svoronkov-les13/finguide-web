import type { FinancialPlan } from "@/types/finance";

export interface SidebarCounters {
  income: string;
  expenses: string;
  goals: string;
}

export function getSidebarCounters(plan: FinancialPlan): SidebarCounters {
  return {
    income: String(plan.cashflows.filter((item) => item.type === "income" && item.enabled).length),
    expenses: String(plan.cashflows.filter((item) => item.type === "expense" && item.enabled).length),
    goals: String(plan.goals.length),
  };
}

export function sidebarBadgeForHref(href: string, counters?: SidebarCounters) {
  if (!counters) return undefined;

  switch (href) {
    case "/income":
      return counters.income;
    case "/expenses":
      return counters.expenses;
    case "/goals":
      return counters.goals;
    default:
      return undefined;
  }
}
