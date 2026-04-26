import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import type { FinancialPlan } from "@/types/finance";

export function createPlanWorkbookWithSheetJs(plan: FinancialPlan) {
  const workbook = XLSX.utils.book_new();
  const forecastSheet = XLSX.utils.json_to_sheet(plan.forecast);
  const goalsSheet = XLSX.utils.json_to_sheet(plan.goals);
  XLSX.utils.book_append_sheet(workbook, forecastSheet, "Forecast");
  XLSX.utils.book_append_sheet(workbook, goalsSheet, "Goals");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export async function createPlanWorkbookWithExcelJs(plan: FinancialPlan) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Finguide";

  const forecast = workbook.addWorksheet("Forecast");
  forecast.columns = [
    { header: "Year", key: "year", width: 10 },
    { header: "Age", key: "age", width: 10 },
    { header: "Income", key: "income", width: 16 },
    { header: "Expenses", key: "expenses", width: 16 },
    { header: "Goals", key: "goals", width: 16 },
    { header: "Savings", key: "savings", width: 16 },
    { header: "Capital", key: "capital", width: 18 },
  ];
  forecast.addRows(plan.forecast);

  const goals = workbook.addWorksheet("Goals");
  goals.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Target year", key: "targetYear", width: 14 },
    { header: "Cost", key: "cost", width: 16 },
    { header: "Saved", key: "saved", width: 16 },
    { header: "Reachable", key: "reachable", width: 12 },
  ];
  goals.addRows(plan.goals);

  return workbook.xlsx.writeBuffer();
}
