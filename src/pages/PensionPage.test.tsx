import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PensionPage } from "@/pages/PensionPage";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({
    data: {
      settings: {
        birthYear: 1990,
        currentAge: 35,
        retirementAge: 60,
        targetMonthlySpend: 100_000,
        investmentReturn: 0.1,
        inflation: 0.06,
      },
      dashboardSnapshot: { pensionCapitalRub: 80_330_049 },
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
});
