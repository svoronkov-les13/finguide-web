import type { FinancialPlan } from "@/types/finance";

export async function createPlanWorkbook(plan: FinancialPlan): Promise<ArrayBuffer> {
  // exceljs is heavy, so it stays out of the main bundle until export is clicked
  const { default: ExcelJS } = await import("exceljs");
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

export async function downloadPlanWorkbook(plan: FinancialPlan, fileName = "finguide-plan.xlsx") {
  const buffer = await createPlanWorkbook(plan);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
