import { createTranslator, translateCurrent, type Translate } from "@/i18n/translate";

export type MonthStatus = "completed" | "partial" | "missed" | "current" | "pending";

export interface MonthData {
  id: string;
  name: string;
  status: MonthStatus;
  amount?: number;
  percent?: number;
}

/** Compatibility exports for callers explicitly requesting Russian names. */
export const MONTH_NAMES_RU = getMonthNames(createTranslator("ru"));
export const MONTH_NAMES_SHORT = getMonthNamesShort(createTranslator("ru"));

/**
 * Build month names from i18n t() function.
 * Usage: `getMonthNames(t)` returns localized full month names.
 */
export function getMonthNames(t: Translate): string[] {
  return Array.from({ length: 12 }, (_, i) => t(`goals.monthNames.${i + 1}` as Parameters<Translate>[0]));
}

export function getMonthNamesShort(t: Translate): string[] {
  return Array.from({ length: 12 }, (_, i) => t(`goals.monthShort.${i + 1}` as Parameters<Translate>[0]));
}

export function makeEmptyYear(year: number, currentYear: number, currentMonthIdx: number, monthNames?: string[]): MonthData[] {
  const names = monthNames ?? getMonthNames(translateCurrent);
  return names.map((name, i) => ({
    id: String(i + 1).padStart(2, "0"),
    name,
    status: (year === currentYear && i === currentMonthIdx
      ? "current"
      : "pending") as MonthStatus,
  }));
}

export function shouldShowEmptyAmountPlaceholder(status: MonthStatus) {
  return status !== "pending";
}

export function monthFormTarget({ monthlyTarget }: { monthlyTarget: number; nearestGoalTarget: number }) {
  return monthlyTarget;
}
