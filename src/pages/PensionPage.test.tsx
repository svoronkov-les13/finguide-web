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
  pensionProjection: {
    preserveCapital: {
      requiredCapitalAtRetirement: 40_000_000 as number | null,
      requiredCapitalStatus: "calculated" as "calculated" | "non_positive_real_return",
    },
    spendDown: { requiredCapitalAtRetirement: 25_000_000 },
  },
  cashflows: [],
  forecast: [{ age: 60, year: 2050, capital: 2_373_688_270 }],
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => () => {},
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
      if (key === "pension.targetCapitalIntro") return `Капитал для ${values?.amount}`;
      if (key === "pension.targetYearInfo") return `${values?.year} / ${values?.age}`;
      if (key === "pension.yearsToSave") return `${values?.years} лет`;
      if (key === "pension.annualReturn") return `${values?.percent}`;
      if (key === "pension.requiredCapitalNonPositiveReturn") return "Доходность должна быть выше инфляции.";
      if (key === "pension.requiredCapitalUnavailable") return "Расчёт необходимого капитала недоступен.";
      if (key === "format.millionRub") return "млн ₽";
      if (key === "format.thousandRub") return "тыс. ₽";
      if (key === "format.symbolRub") return "₽";
      return key;
    },
  }),
}));

describe("PensionPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    mockPlan.settings.withdrawalStrategy = "spend_down_30y";
    mockPlan.dashboardSnapshot.pensionCapitalRub = 80_330_049;
    mockPlan.pensionProjection = {
      preserveCapital: {
        requiredCapitalAtRetirement: 40_000_000,
        requiredCapitalStatus: "calculated",
      },
      spendDown: { requiredCapitalAtRetirement: 25_000_000 },
    };
    mockPlan.forecast = [
      { age: 60, year: 2051, capital: 2_373_688_270 },
      { age: 65, year: 2056, capital: 1_000_000 },
    ];
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

  it("limits the pension chart to the pension forecast horizon", () => {
    const chartData = buildPensionChartData(
      [
        { age: 35, year: 2026, capital: 1_000_000 },
        { age: 36, year: 2027, capital: 1_100_000 },
        { age: 37, year: 2028, capital: 1_200_000 },
        { age: 38, year: 2029, capital: 1_300_000 },
      ],
      { currentAge: 35, pensionCalculationYears: 2 },
    );

    expect(chartData.map((point) => point.age)).toEqual([35, 36, 37]);
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

  it("renders spend-down required capital from the pension projection", () => {
    const html = renderToStaticMarkup(<PensionPage />);
    const capitalStart = html.indexOf('data-testid="required-pension-capital"');
    const capitalMarkup = html.slice(capitalStart, html.indexOf("</div>", capitalStart));

    expect(html).toContain('data-testid="required-pension-capital"');
    expect(html).toContain("25 млн");
    expect(capitalMarkup.match(/₽/g)).toHaveLength(1);
    expect(html).not.toContain("80,3 млн");
    expect(html).not.toContain("80.3 млн");
    expect(html).toMatch(/data-testid="required-pension-capital"[^>]*role="status"[^>]*aria-live="polite"/);
  });

  it("renders preserve-capital required capital from the pension projection", () => {
    mockPlan.settings.withdrawalStrategy = "preserve_capital";

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain('data-testid="required-pension-capital"');
    expect(html).toContain("40 млн");
  });

  it("explains when preserve-capital cannot be calculated with a non-positive real return", () => {
    mockPlan.settings.withdrawalStrategy = "preserve_capital";
    mockPlan.pensionProjection.preserveCapital = {
      requiredCapitalAtRetirement: null,
      requiredCapitalStatus: "non_positive_real_return",
    };

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain('data-testid="required-pension-capital-status"');
    expect(html).toContain("Доходность должна быть выше инфляции.");
    expect(html).not.toContain('data-testid="required-pension-capital"');
    expect(html).toMatch(/data-testid="required-pension-capital-status"[^>]*role="status"[^>]*aria-live="polite"/);
  });

  it("treats calculated preserve-capital with a null amount as unavailable", () => {
    mockPlan.settings.withdrawalStrategy = "preserve_capital";
    mockPlan.pensionProjection.preserveCapital = {
      requiredCapitalAtRetirement: null,
      requiredCapitalStatus: "calculated",
    };

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain("Расчёт необходимого капитала недоступен.");
    expect(html).not.toContain("Доходность должна быть выше инфляции.");
  });

  it("renders an unavailable state when the pension projection is missing", () => {
    const projection = mockPlan.pensionProjection;
    Object.assign(mockPlan, { pensionProjection: undefined });

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain('data-testid="required-pension-capital-status"');
    expect(html).toContain("Расчёт необходимого капитала недоступен.");
    expect(html).not.toContain('data-testid="required-pension-capital"');
    expect(html).not.toContain("80,3 млн");
    expect(html).not.toContain("80.3 млн");

    mockPlan.pensionProjection = projection;
  });

  it("reports that a legitimate zero retirement capital needs adjustment", () => {
    mockPlan.forecast = [{ age: 60, year: 2051, capital: 0 }];

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).toContain("pension.needsAdjustment");
    expect(html).not.toContain("pension.onTrack");
  });

  it("hides sufficiency when the retirement forecast point is missing", () => {
    mockPlan.forecast = [];

    const html = renderToStaticMarkup(<PensionPage />);

    expect(html).not.toContain("pension.onTrack");
    expect(html).not.toContain("pension.needsAdjustment");
  });

  it("keeps result metadata aligned with persisted settings while form edits are unsaved", () => {
    act(() => {
      root.render(<PensionPage />);
    });

    const retirementAge = container.querySelector('input[name="retirementAge"]') as HTMLInputElement;
    const targetSpend = container.querySelector('input[aria-label="pension.desiredExpenses"]') as HTMLInputElement;

    act(() => {
      retirementAge.value = "65";
      retirementAge.dispatchEvent(new Event("input", { bubbles: true }));
      targetSpend.value = "200000";
      targetSpend.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const resultCard = container.querySelector('[data-testid="pension-result-card"]');
    const resultText = resultCard?.textContent?.replace(/\s+/g, " ");

    expect(resultCard).not.toBeNull();
    expect(resultText).toContain("100'000 ₽");
    expect(resultText).toContain("2051 / 60");
    expect(resultText).toContain("25 лет");
    expect(resultText).toContain("10 %");
    expect(resultText).toContain("pension.onTrack");
    expect(resultText).not.toContain("200'000 ₽");
    expect(resultText).not.toContain("2056 / 65");
    expect(resultText).not.toContain("pension.needsAdjustment");
  });

  it("uses pension forecast years only to limit chart rendering", () => {
    const forecast = [
      { age: 35, year: 2026, capital: 100, income: 0, expenses: 0, goals: 0, savings: 0 },
      { age: 36, year: 2027, capital: 200, income: 0, expenses: 0, goals: 0, savings: 0 },
      { age: 37, year: 2028, capital: 300, income: 0, expenses: 0, goals: 0, savings: 0 },
    ];

    expect(buildPensionChartData(forecast, { currentAge: 35, pensionCalculationYears: 1 })).toEqual([
      { age: 35, year: 2026, capital: 100 },
      { age: 36, year: 2027, capital: 200 },
    ]);
  });

  it("windows the chart from five years before retirement to five years past zero-crossing", () => {
    const forecast = Array.from({ length: 41 }, (_, i) => ({
      age: 50 + i,
      year: 2026 + i,
      capital: 50 + i < 70 ? 1_000_000 : 0,
    }));

    const chartData = buildPensionChartData(forecast, { currentAge: 50, pensionCalculationYears: 50 }, 60);

    expect(chartData[0]?.age).toBe(55);
    expect(chartData.at(-1)?.age).toBe(75);
  });

  it("extends the chart to age 100 when the capital never runs out", () => {
    const forecast = Array.from({ length: 61 }, (_, i) => ({
      age: 50 + i,
      year: 2026 + i,
      capital: 1_000_000,
    }));

    const chartData = buildPensionChartData(forecast, { currentAge: 50, pensionCalculationYears: 60 }, 60);

    expect(chartData[0]?.age).toBe(55);
    expect(chartData.at(-1)?.age).toBe(100);
  });
});
