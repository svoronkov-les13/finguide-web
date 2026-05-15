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
      : year < currentYear || (year === currentYear && i < currentMonthIdx)
        ? "missed"
        : "pending") as MonthStatus,
  }));
}

export function shouldShowEmptyAmountPlaceholder(status: MonthStatus) {
  return status !== "pending";
}

export function monthFormTarget({ allGoalsTarget, nearestGoalTarget }: { allGoalsTarget: number; nearestGoalTarget: number }) {
  return nearestGoalTarget > 0 ? nearestGoalTarget : allGoalsTarget;
}
