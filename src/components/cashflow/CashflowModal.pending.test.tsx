// @vitest-environment jsdom

import { act } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Cashflow } from "@/types/finance";

const mockPlan = vi.hoisted(() => ({ settings: { startYear: 2026 } }));

vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <>{children}</> : null,
  Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
  Overlay: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  Content: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  Title: (props: HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  Close: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  SelectValue: () => <span />,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
    <button type="button" aria-pressed={checked} onClick={() => onCheckedChange(!checked)} />
  ),
}));

vi.mock("@/api/planQueries", () => ({
  usePlanQuery: () => ({
    data: mockPlan,
  }),
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string) => ({
      "cashflow.save": "Сохранить",
      "cashflow.saving": "Сохраняем...",
      "cashflow.add": "Добавить",
      "cashflow.cancel": "Отмена",
      "cashflow.delete": "Удалить",
      "cashflow.deleting": "Удаляем...",
    }[key] ?? key),
  }),
}));

const initialCashflow: Partial<Cashflow> = {
  id: "salary",
  name: "Salary",
  amount: 100_000,
  currency: "RUB",
  category: "Work",
  startYear: 2026,
  endYear: null,
  growth: 0,
  growthRanges: [],
  enabled: true,
  type: "income",
  frequency: "monthly",
};

describe("CashflowModal pending state", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("keeps the modal open after submit until the parent closes it", async () => {
    const { CashflowModal } = await import("@/components/cashflow/CashflowModal");
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    act(() => {
      root.render(
        <CashflowModal
          open
          onOpenChange={onOpenChange}
          initialData={initialCashflow}
          type="income"
          onSubmit={onSubmit}
        />,
      );
    });

    const form = document.getElementById("cashflow-form");
    expect(form).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("shows a disabled saving action while the save mutation is pending", async () => {
    const { CashflowModal } = await import("@/components/cashflow/CashflowModal");

    act(() => {
      root.render(
        <CashflowModal
          open
          saving
          onOpenChange={vi.fn()}
          initialData={initialCashflow}
          type="income"
          onSubmit={vi.fn()}
        />,
      );
    });

    const saveButton = document.querySelector<HTMLButtonElement>('button[type="submit"][form="cashflow-form"]');
    expect(saveButton?.disabled).toBe(true);
    expect(saveButton?.textContent).toContain("Сохраняем...");
    expect(document.getElementById("cashflow-form")?.getAttribute("aria-busy")).toBe("true");
  });
});
