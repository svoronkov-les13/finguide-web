import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GoalsTable } from "@/components/dashboard/GoalsTable";
import type { Goal } from "@/types/finance";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string>) => {
      if (key === "goals.reachableCount") return `${values?.count} reachable`;
      if (key === "goals.atRiskCount") return `${values?.count} at risk`;
      if (key === "goals.reachableOf") return `${values?.reachable}/${values?.total}`;
      if (key === "goals.inYears") return `${values?.count}y`;
      if (key === "goals.perYear") return `${values?.pct}%/yr`;
      return key;
    },
  }),
}));

const goal: Goal = {
  id: "goal-1",
  name: "Квартира",
  icon: "Target",
  targetYear: 2030,
  targetMonth: 6,
  priority: 1,
  cost: 1_500_000,
  saved: 250_000,
  projectedCost: 1_500_000,
  projectedSaved: 250_000,
  projectedProgressPct: 17,
  growth: 0.05,
  reachable: true,
  type: "onetime",
};

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({ data: { goals: [goal] } }),
}));

describe("GoalsTable", () => {
  it("renders goal cost and saved amounts in full rubles without compact abbreviations", () => {
    const html = renderToStaticMarkup(<GoalsTable />);
    const normalized = html.replace(/\u00a0/g, " ");

    expect(normalized).toContain("1 500 000 ₽");
    expect(normalized).toContain("250 000 ₽");
    expect(normalized).not.toContain("1,5 млн ₽");
    expect(normalized).not.toContain("250 тыс. ₽");
  });
});
