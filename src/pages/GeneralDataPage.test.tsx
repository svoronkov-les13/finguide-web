// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeneralDataPage } from "@/pages/GeneralDataPage";

const updateSettingsMutate = vi.hoisted(() => vi.fn());

const mockPlan = vi.hoisted(() => ({
  owner: { name: "Stas" },
  settings: {
    startYear: 2026,
    birthYear: 1990,
    currentAge: 36,
    retirementAge: 60,
    pensionCalculationYears: 25,
    dashboardCalculationYears: 30,
    monthsInYear: 12,
    targetMonthlySpend: 100_000,
    investmentReturn: 0.1,
    pensionInvestmentReturn: 0.1,
    inflation: 0.06,
    startingCapital: 1_000_000,
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => () => {},
}));

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({
    data: mockPlan,
  }),
  useUpdateSettingsMutation: () => ({ mutate: updateSettingsMutate, isPending: false }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    session: {
      profile: {
        name: "Stas",
      },
    },
  }),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/layout/Page", () => ({
  Page: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageHeader: ({ title, description }: { title: ReactNode; description: ReactNode }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

describe("GeneralDataPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    updateSettingsMutate.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("hides pension forecast years from general data", () => {
    const html = renderToStaticMarkup(<GeneralDataPage />);

    expect(html).not.toContain("general.pensionCalculationYears");
    expect(html).not.toContain("general.pensionCalculationYearsHint");
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="pensionCalculationYears"/);
  });

  it("preserves pension forecast years when saving general data", async () => {
    await act(async () => {
      root.render(<GeneralDataPage />);
    });

    const form = container.querySelector("form") as HTMLFormElement;

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(updateSettingsMutate).toHaveBeenCalledWith(expect.objectContaining({
      pensionCalculationYears: 25,
    }));
  });
});
