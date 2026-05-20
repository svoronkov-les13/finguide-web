export type MonthStatus = "completed" | "partial" | "missed" | "current" | "pending";

export interface MonthData {
  id: string;
  name: string;
  status: MonthStatus;
  amount?: number;
  percent?: number;
}

export const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const MONTH_NAMES_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

export function makeEmptyYear(year: number, currentYear: number, currentMonthIdx: number): MonthData[] {
  return MONTH_NAMES_RU.map((name, i) => ({
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

export function trackingMonthPercent({ amount, contributionGoalTarget, fallbackTarget }: { amount?: number; contributionGoalTarget: number; fallbackTarget: number }) {
  const target = contributionGoalTarget > 0 ? contributionGoalTarget : fallbackTarget;
  return amount && target > 0 ? Math.min(Math.round((amount / target) * 100), 100) : undefined;
}
