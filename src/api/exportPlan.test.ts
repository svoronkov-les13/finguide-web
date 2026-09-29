import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { createPlanWorkbook } from "./exportPlan";
import { createTranslator } from "@/i18n/translate";
import { brand } from "@/config/brand";
import type { FinancialPlan } from "@/types/finance";

describe("plan export locale", () => {
  for (const locale of ["ru", "en"] as const) {
    it(`exports ${locale} headers and statuses, preserving user names and numbers`, async () => {
      const plan = {
        forecast: [{ year: 2030, age: 40, income: 123, expenses: -45, goals: -12, savings: 66, capital: 500 }],
        goals: [{ name: "Моя цель / My goal", targetYear: 2030, cost: 100, saved: 40, reachable: false }],
      } as FinancialPlan;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await createPlanWorkbook(plan, locale));
      const t = createTranslator(locale);
      expect(workbook.creator).toBe(brand.name);
      const forecast = workbook.getWorksheet(t("planExport.forecastSheet"))!;
      expect(forecast.getCell("A1").value).toBe(t("planExport.year"));
      expect(forecast.getCell("C2").value).toBe(123);
      const goals = workbook.getWorksheet(t("planExport.goalsSheet"))!;
      expect(goals.getCell("A2").value).toBe("Моя цель / My goal");
      expect(goals.getCell("E2").value).toBe(t("planExport.no"));
    });
  }
});
