export type MonthStatus = "completed" | "partial" | "missed" | "current" | "pending";

export interface MonthData {
  id: string;
  name: string;
  status: MonthStatus;
  amount?: number;
  percent?: number;
}

/** Use goals.monthNames from i18n instead of these constants when possible */
export const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const MONTH_NAMES_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

/**
 * Build month names from i18n t() function.
 * Usage: `getMonthNames(t)` returns localized full month names.
 */
export function getMonthNames(t: (key: string) => string): string[] {
  return Array.from({ length: 12 }, (_, i) => t(`goals.monthNames.${i + 1}`));
}

export function getMonthNamesShort(t: (key: string) => string): string[] {
  return Array.from({ length: 12 }, (_, i) => t(`goals.monthShort.${i + 1}`));
}

export function makeEmptyYear(year: number, currentYear: number, currentMonthIdx: number, monthNames?: string[]): MonthData[] {
  const names = monthNames ?? MONTH_NAMES_RU;
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
