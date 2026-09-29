import { describe, expect, it } from "vitest";
import { ru, en } from "./messages";
import { translate, createTranslator } from "./translate";
import { brand, planExportFilename } from "@/config/brand";
import { appManifest, localizeHtml } from "@/config/metadata";
import { errorMessage, LocalizedError } from "./errors";
import { validationError } from "./validation";
import { settingsSchema } from "@/forms/settingsSchema";

function flatten(value: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, text]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof text === "string" ? [[path, text]] : Object.entries(flatten(text, path));
  }));
}

describe("localization contract", () => {
  it("has matching keys and interpolation tokens in both languages", () => {
    const russian = flatten(ru);
    const english = flatten(en);
    expect(Object.keys(russian).sort()).toEqual(Object.keys(english).sort());
    for (const [key, value] of Object.entries(russian)) {
      const tokens = (text: string) => [...text.matchAll(/\{\{\w+\}\}/g)].map(([token]) => token).sort();
      expect(tokens(english[key]), key).toEqual(tokens(value));
      expect(english[key].trim(), key).not.toBe("");
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("uses the configured brand in every locale, metadata and export filename", () => {
    for (const locale of ["ru", "en"] as const) {
      expect(translate(locale, "common.appName")).toBe(brand.name);
      expect(translate(locale, "auth.promoDescription")).toContain(brand.name);
      expect(translate(locale, "app.documentTitle")).toContain(brand.name);
      expect(translate(locale, "common.appName", { brand: "Override" })).toBe(brand.name);
    }
    expect(appManifest().name).toBe(brand.name);
    expect(planExportFilename()).toBe(`${brand.name}-plan.xlsx`);
    expect(localizeHtml('<title>__APP_TITLE__</title><meta content="__APP_DESCRIPTION__">')).toContain(brand.name);
    for (const text of Object.values(flatten(ru)).concat(Object.values(flatten(en)))) {
      expect(text).not.toMatch(/FinPlan|FinGuide|Finguide|Finiq/);
    }
  });

  it("interpolates zero values and does not interpret user-supplied template text", () => {
    expect(translate("en", "dashboard.yearsLabel", { count: 0 })).toBe("0 years");
    expect(translate("en", "common.copyName", { name: "{{brand}}" })).toBe("{{brand}} (copy)");
  });

  it("localizes errors at render time, preserving diagnostics without exposing server text", () => {
    const error = new LocalizedError("errors.forbidden", "Internal database detail", {}, "request-123");
    expect(error.message).toBe("Internal database detail");
    expect(errorMessage(error, createTranslator("en"))).toContain("permission");
    expect(errorMessage(error, createTranslator("ru"))).toContain("Недостаточно прав");
    expect(errorMessage(error, createTranslator("en"))).toContain("request-123");
    expect(errorMessage(new Error("Internal secret"), createTranslator("en"))).not.toContain("Internal secret");
  });

  it("localizes numeric validation boundaries", () => {
    for (const locale of ["ru", "en"] as const) {
      const t = createTranslator(locale);
      const result = settingsSchema.shape.startYear.safeParse(2010, { error: validationError(t) });
      expect(result.error?.issues[0].message).toBe(t("validation.min", { min: 2020 }));
      const fractional = settingsSchema.shape.startYear.safeParse(2025.5, { error: validationError(t) });
      expect(fractional.error?.issues[0].message).toBe(t("validation.integer"));
    }
  });
});
