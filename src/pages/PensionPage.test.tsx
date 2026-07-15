import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { buildPensionChartData, PensionPage } from "@/pages/PensionPage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({
    data: {
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
    },
  }),
  useUpdateSettingsMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === "pension.retirementAge") return "Возраст выхода на пенсию";
      if (key === "pension.year") return "год";
      if (key === "pension.targetYearInfo") return `${values?.year} / ${values?.age}`;
      if (key === "pension.yearsToSave") return `${values?.years} лет`;
      if (key === "pension.annualReturn") return `${values?.percent}`;
      return key;
    },
  }),
}));

describe("PensionPage", () => {
  it("renders retirement age as an editable read-write field", () => {
    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain("Возраст выхода на пенсию");
    expect(html).toContain('name="retirementAge"');
    expect(html).not.toMatch(/name="retirementAge"[^>]*readOnly/);
    expect(html).not.toMatch(/name="retirementAge"[^>]*disabled/);
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
