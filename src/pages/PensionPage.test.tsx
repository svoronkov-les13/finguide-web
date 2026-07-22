// @vitest-environment jsdom

import { act } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPensionChartData, PensionPage } from "@/pages/PensionPage";

const mockPlan = vi.hoisted(() => ({
  settings: {
    startYear: 2026,
    birthYear: 1990,
    currentAge: 35,
    retirementAge: 60,
    pensionCalculationYears: 25,
    dashboardCalculationYears: 30,
    monthsInYear: 12,
    targetMonthlySpend: 100_000,
    investmentReturn: 0.1,
    pensionInvestmentReturn: 0.1,
    inflation: 0.06,
    startingCapital: 0,
    withdrawalStrategy: "spend_down_30y",
    statePensionEnabled: true,
    statePensionMonthly: 0,
  },
  dashboardSnapshot: { pensionCapitalRub: 80_330_049 },
  cashflows: [],
  forecast: [{ age: 60, year: 2050, capital: 2_373_688_270 }],
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({
    data: mockPlan,
  }),
  useUpdateSettingsMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === "pension.retirementAge") return "Возраст выхода на пенсию";
      if (key === "pension.year") return "год";
      if (key === "pension.rub") return "₽ RUB - Российский рубль";
      if (key === "pension.targetYearInfo") return `${values?.year} / ${values?.age}`;
      if (key === "pension.yearsToSave") return `${values?.years} лет`;
      if (key === "pension.annualReturn") return `${values?.percent}`;
      return key;
    },
  }),
}));

describe("PensionPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("renders retirement age as an editable read-write field", () => {
    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain("Возраст выхода на пенсию");
    expect(html).toContain('name="retirementAge"');
    expect(html).not.toMatch(/name="retirementAge"[^>]*readOnly/);
    expect(html).not.toMatch(/name="retirementAge"[^>]*disabled/);
  });

  it("keeps retirement age field empty when the user clears it", () => {
    act(() => {
      root.render(<PensionPage />);
    });

    const input = document.querySelector('input[name="retirementAge"]') as HTMLInputElement;

    act(() => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(input.value).toBe("");
  });

  it("uses RUB as the pension currency", () => {
    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain('data-testid="pension-currency-value"');
    expect(html).toContain("₽ RUB");
    expect(html).not.toContain("$ USD");
  });

  it("uses pension forecast years only to limit chart rendering", () => {
    const forecast = [
      { age: 35, year: 2026, capital: 100, income: 0, expenses: 0, goals: 0, savings: 0 },
      { age: 36, year: 2027, capital: 200, income: 0, expenses: 0, goals: 0, savings: 0 },
      { age: 37, year: 2028, capital: 300, income: 0, expenses: 0, goals: 0, savings: 0 },
    ];

    expect(buildPensionChartData(forecast, 35, 1)).toEqual([
      { age: 35, year: 2026, capital: 100 },
      { age: 36, year: 2027, capital: 200 },
    ]);
  });
});
