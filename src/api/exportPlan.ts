import { brand, planExportFilename } from "@/config/brand";
import { createTranslator, readLocale } from "@/i18n/translate";
import type { Locale } from "@/i18n/messages";
import type { FinancialPlan } from "@/types/finance";

export async function createPlanWorkbook(plan: FinancialPlan, locale: Locale = readLocale()): Promise<ArrayBuffer> {
  const t = createTranslator(locale);
  // exceljs is heavy, so it stays out of the main bundle until export is clicked
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = brand.name;

  const forecast = workbook.addWorksheet(t("planExport.forecastSheet"));
  forecast.columns = [
    { header: t("planExport.year"), key: "year", width: 10 },
    { header: t("planExport.age"), key: "age", width: 10 },
    { header: t("planExport.income"), key: "income", width: 16 },
    { header: t("planExport.expenses"), key: "expenses", width: 16 },
    { header: t("planExport.goals"), key: "goals", width: 16 },
    { header: t("planExport.savings"), key: "savings", width: 16 },
    { header: t("planExport.capital"), key: "capital", width: 18 },
  ];
  forecast.addRows(plan.forecast);

  const goals = workbook.addWorksheet(t("planExport.goalsSheet"));
  goals.columns = [
    { header: t("planExport.name"), key: "name", width: 28 },
    { header: t("planExport.targetYear"), key: "targetYear", width: 14 },
    { header: t("planExport.cost"), key: "cost", width: 16 },
    { header: t("planExport.saved"), key: "saved", width: 16 },
    { header: t("planExport.reachable"), key: "reachable", width: 12 },
  ];
  goals.addRows(plan.goals.map((goal) => ({ ...goal, reachable: t(goal.reachable ? "planExport.yes" : "planExport.no") })));

  return workbook.xlsx.writeBuffer();
}

export async function downloadPlanWorkbook(plan: FinancialPlan, fileName = planExportFilename(), locale: Locale = readLocale()) {
  const buffer = await createPlanWorkbook(plan, locale);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
