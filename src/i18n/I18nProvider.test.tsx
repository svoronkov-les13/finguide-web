// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "./I18nProvider";
import { brand } from "@/config/brand";
import { LocalizedError, errorMessage } from "./errors";

describe("language switching", () => {
  it("updates visible copy, existing errors and document metadata without reloading", () => {
    localStorage.clear();
    const meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const error = new LocalizedError("errors.stalePlan", "Diagnostic");
    function Probe() {
      const { t, setLocale } = useI18n();
      return <button onClick={() => setLocale("en")}>{t("common.appName")} {errorMessage(error, t)}</button>;
    }
    try {
      act(() => root.render(<I18nProvider><Probe /></I18nProvider>));
      expect(container.textContent).toContain("План ещё загружается");
      act(() => container.querySelector("button")!.click());
      expect(container.textContent).toContain("The plan is loading");
      expect(container.textContent).toContain(brand.name);
      expect(document.documentElement.lang).toBe("en");
      expect(document.title).toBe(`${brand.name} | Financial capital`);
      expect(meta.content).toContain("helps you plan");
      expect(localStorage.getItem("finguide.locale")).toBe("en");
    } finally {
      act(() => root.unmount());
      container.remove();
      meta.remove();
      localStorage.clear();
    }
  });
});
