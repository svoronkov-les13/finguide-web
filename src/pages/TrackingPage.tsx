import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { CheckCircle2, Calendar, HelpCircle, Minus, X, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { formatRub } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type MonthStatus = "completed" | "partial" | "missed" | "current" | "pending";

interface MonthData {
  id: string;
  name: string;
  status: MonthStatus;
  amount?: number;
  percent?: number;
}

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const INITIAL_MONTHS: MonthData[] = [
  { id: "01", name: "Январь", status: "partial", amount: 95000, percent: 23 },
  { id: "02", name: "Февраль", status: "completed", amount: 192000 },
  { id: "03", name: "Март", status: "completed", amount: 185000 },
  { id: "04", name: "Апрель", status: "current" },
  { id: "05", name: "Май", status: "pending" },
  { id: "06", name: "Июнь", status: "pending" },
  { id: "07", name: "Июль", status: "pending" },
  { id: "08", name: "Август", status: "pending" },
  { id: "09", name: "Сентябрь", status: "pending" },
  { id: "10", name: "Октябрь", status: "pending" },
  { id: "11", name: "Ноябрь", status: "pending" },
  { id: "12", name: "Декабрь", status: "pending" },
];

function makeEmptyYear(): MonthData[] {
  return MONTH_NAMES.map((name, i) => ({
    id: String(i + 1).padStart(2, "0"),
    name,
    status: "pending" as MonthStatus,
  }));
}

export function TrackingPage() {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  const [viewYear, setViewYear] = useState(currentYear);
  const [yearData, setYearData] = useState<Record<number, MonthData[]>>({
    [currentYear]: INITIAL_MONTHS,
  });

  const months = yearData[viewYear] ?? makeEmptyYear();

  const activeGoal = plan?.goals.find(g => !g.reachable) || plan?.goals[0];
  const monthlyTarget = plan?.dashboardSnapshot?.monthlyTargetRub || 405000;

  const completedMonths = months.filter(m => m.status === "completed");
  const partialMonths = months.filter(m => m.status === "partial");
  const missedMonths = months.filter(m => m.status === "missed");
  const trackedMonths = months.filter(m => m.status === "completed" || m.status === "partial");

  const totalSaved = months.reduce((acc, m) => acc + (m.amount || 0), 0);
  const totalPlanned = monthlyTarget * 12;
  const totalPercent = totalPlanned > 0 ? Math.round((totalSaved / totalPlanned) * 100) : 0;

  const completionPercent = trackedMonths.length > 0
    ? Math.round((completedMonths.length / trackedMonths.length) * 100)
    : 0;

  // Current month card shows current calendar month, always from the current year data
  const currentMonthData = (yearData[currentYear] ?? makeEmptyYear())[currentMonth];

  function markMonth(id: string, status: "completed" | "partial" | "missed") {
    setYearData(prev => {
      const prevMonths = prev[viewYear] ?? makeEmptyYear();
      return {
        ...prev,
        [viewYear]: prevMonths.map(m =>
          m.id === id
            ? { ...m, status, amount: status === "completed" ? monthlyTarget : status === "partial" ? Math.round(monthlyTarget * 0.23) : 0 }
            : m
        ),
      };
    });
  }

  function getCardStyle(status: MonthStatus): string {
    switch (status) {
      case "completed": return "border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5";
      case "partial": return "border-[var(--fp-color-accent-gold)]/40 bg-[var(--fp-color-accent-gold-soft)]";
      case "missed": return "border-[var(--fp-color-coral)]/30 bg-[var(--fp-color-coral-soft)]";
      case "current": return "border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface-hover)]";
      default: return "border-[var(--fp-color-border)] bg-[var(--fp-color-card)]";
    }
  }

  function getStatusBadge(m: MonthData) {
    switch (m.status) {
      case "completed":
        return (
          <span className="text-[12px] font-semibold text-[var(--fp-color-teal)] flex items-center gap-1">
            <CheckCircle2 className="size-[14px]" /> {t("tracking.completed")}
          </span>
        );
      case "partial":
        return (
          <span className="text-[12px] font-semibold text-[var(--fp-color-accent-gold-text)]">
            {t("tracking.partial")}
          </span>
        );
      case "missed":
        return (
          <span className="text-[12px] font-semibold text-[var(--fp-color-coral)]">
            {t("tracking.missed")}
          </span>
        );
      case "current":
        return (
          <span className="text-[12px] font-semibold text-[var(--fp-color-muted-foreground)]">
            {t("tracking.markNow")}
          </span>
        );
      default:
        return (
          <span className="text-[12px] text-[var(--fp-color-muted-foreground)]">
            {t("tracking.ahead")}
          </span>
        );
    }
  }

  return (
    <Page>
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--fp-color-foreground)]">
          {t("tracking.title")}
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--fp-color-label)]">
          {t("tracking.subtitle")}
        </p>
      </header>

      {/* Top stats row — 2 cards side by side */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Active Goal + Monthly Norm */}
        <Card className="p-6 rounded-[20px] border-[var(--fp-color-border)] bg-[var(--fp-color-card)] shadow-sm">
          {/* Active goal */}
          <div className="mb-6 pb-6 border-b border-[var(--fp-color-border)]">
            <div className="text-[11px] font-semibold tracking-widest text-[var(--fp-color-label)] uppercase mb-3">
              {t("tracking.activeGoal")}
            </div>
            {activeGoal ? (
              <>
                <div className="flex justify-between items-baseline gap-2 mb-2">
                  <h3 className="font-bold text-[17px] truncate pr-2 text-[var(--fp-color-foreground)]">
                    {activeGoal.name}
                  </h3>
                  <span className="text-[22px] font-bold text-[var(--fp-color-teal)] shrink-0">
                    {activeGoal.cost > 0 ? Math.min(100, Math.round((activeGoal.saved / activeGoal.cost) * 100)) : 0}%
                  </span>
                </div>
                <p className="text-[13px] text-[var(--fp-color-label)] mb-3">
                  {formatRub(activeGoal.saved)} {t("tracking.outOf")} {formatRub(activeGoal.cost)}
                </p>
                <div className="h-[6px] w-full bg-[var(--fp-color-muted)] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[var(--fp-color-teal)] rounded-full transition-all"
                    style={{ width: `${activeGoal.cost > 0 ? Math.min(100, Math.round((activeGoal.saved / activeGoal.cost) * 100)) : 0}%` }}
                  />
                </div>
                <div className="text-[12px] text-[var(--fp-color-label)]">
                  {t("tracking.goalYear", { year: String(activeGoal.targetYear) })}
                </div>
              </>
            ) : (
              <div className="text-[14px] text-[var(--fp-color-label)]">{t("tracking.noActiveGoals")}</div>
            )}
          </div>

          {/* Monthly norm */}
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[var(--fp-color-label)] uppercase mb-2">
              {t("tracking.monthlyNorm")}
            </div>
            <div className="text-[32px] font-bold leading-tight mb-1">
              {formatRub(monthlyTarget)}
            </div>
            <div className="text-[13px] text-[var(--fp-color-label)] mb-5">
              {t("tracking.incomeMinusExpenses")}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-[13px] text-[var(--fp-color-label)] mb-1">
                  {t("tracking.forYear", { year: String(viewYear) })}
                </div>
                <div className="text-[22px] font-bold text-[var(--fp-color-teal)]">
                  {formatRub(totalSaved)}
                </div>
              </div>
              <div className="text-right text-[13px] text-[var(--fp-color-label)]">
                <div className="font-semibold text-[var(--fp-color-foreground)]">{t("tracking.marked")}</div>
                <div>{trackedMonths.length} {t("tracking.outOf3")} 4 {t("tracking.months")}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Current Month + Summary */}
        <div className="grid gap-5">
          {/* Current month card */}
          <Card className="p-6 rounded-[20px] border-[var(--fp-color-border)] bg-[var(--fp-color-card)] shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-[10px] bg-[var(--fp-color-background)] border border-[var(--fp-color-border)]">
                  <Calendar className="size-[18px] text-[var(--fp-color-label)]" />
                </div>
                <div>
                  <div className="font-semibold text-[16px] text-[var(--fp-color-foreground)]">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </div>
                  <div className="text-[12px] text-[var(--fp-color-label)]">{t("tracking.currentMonth")}</div>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] transition-colors"
                onClick={() => markMonth(currentMonthData.id, "completed")}
              >
                <Pencil className="size-[14px]" />
                {t("tracking.mark")}
              </button>
            </div>

            {currentMonthData?.status === "current" ? (
              <div className="text-center py-3">
                <div className="grid size-10 place-items-center rounded-full bg-[var(--fp-color-background)] border border-[var(--fp-color-border)] mx-auto mb-3">
                  <Calendar className="size-5 text-[var(--fp-color-muted-foreground)]" />
                </div>
                <div className="font-semibold text-[15px] text-[var(--fp-color-foreground)] mb-1">
                  {t("tracking.monthNotMarked")}
                </div>
                <p className="text-[12px] text-[var(--fp-color-label)]">
                  {t("tracking.markHint")}
                </p>
              </div>
            ) : (
              <div className="font-semibold text-[22px] text-[var(--fp-color-teal)]">
                {formatRub(currentMonthData?.amount || 0)}
              </div>
            )}

            {/* Status buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => markMonth(currentMonthData.id, "completed")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5 text-[var(--fp-color-teal)] hover:bg-[var(--fp-color-teal)]/10 transition-colors"
              >
                <CheckCircle2 className="size-3.5" /> {t("tracking.completed")}
              </button>
              <button
                onClick={() => markMonth(currentMonthData.id, "partial")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-[var(--fp-color-accent-gold)]/40 bg-[var(--fp-color-accent-gold-soft)] text-[var(--fp-color-accent-gold-text)] hover:opacity-80 transition-opacity"
              >
                <Minus className="size-3.5" /> {t("tracking.partial")}
              </button>
              <button
                onClick={() => markMonth(currentMonthData.id, "missed")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-[var(--fp-color-coral)]/30 bg-[var(--fp-color-coral-soft)] text-[var(--fp-color-coral)] hover:opacity-80 transition-opacity"
              >
                <X className="size-3.5" /> {t("tracking.missed")}
              </button>
            </div>
          </Card>

          {/* Annual summary */}
          <Card className="p-6 rounded-[20px] border-[var(--fp-color-border)] bg-[var(--fp-color-card)] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--fp-color-label)]">☀</span>
              <h3 className="font-semibold text-[15px]">{t("tracking.yearSummary", { year: String(viewYear) })}</h3>
            </div>
            <p className="text-[13px] text-[var(--fp-color-label)] mb-3 leading-relaxed">
              {t("tracking.yearSummaryText", {
                year: String(viewYear),
                total: String(trackedMonths.length),
                completed: String(completedMonths.length),
                partial: String(partialMonths.length),
              })}
            </p>
            <p className="text-[13px] text-[var(--fp-color-foreground)] mb-4">
              {t("tracking.totalSavings")}:{" "}
              <span className="font-bold text-[var(--fp-color-teal)]">{formatRub(totalSaved)}</span>{" "}
              {t("tracking.outOfPlanned")}{" "}
              <span className="font-bold">{formatRub(totalPlanned)}</span>{" "}
              ({totalPercent}%).
            </p>

            <div className="flex items-center justify-between bg-[var(--fp-color-background)] p-3 rounded-[14px]">
              <div>
                <div className="text-[11px] text-[var(--fp-color-label)] mb-0.5">{viewYear}</div>
                <div className="text-[13px] font-semibold text-[var(--fp-color-foreground)]">{t("tracking.current")}</div>
              </div>
              <div className="flex gap-5 text-center">
                <div>
                  <div className="text-[18px] font-bold text-[var(--fp-color-teal)]">{completedMonths.length}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">{t("tracking.completedShort")}</div>
                </div>
                <div>
                  <div className="text-[18px] font-bold text-[var(--fp-color-accent-gold-text)]">{partialMonths.length}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">{t("tracking.partialShort")}</div>
                </div>
                <div>
                  <div className="text-[18px] font-bold text-[var(--fp-color-coral)]">{missedMonths.length}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">{t("tracking.missedShort")}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Calendar section */}
      <div>
        {/* Year navigation */}
        <div className="flex items-center justify-between py-4 px-5 bg-[var(--fp-color-card)] border border-[var(--fp-color-border)] rounded-[20px] mb-4 shadow-sm">
          <button
            onClick={() => setViewYear(y => y - 1)}
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--fp-color-surface-hover)] transition-colors text-[var(--fp-color-label)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-bold text-[var(--fp-color-foreground)]">{viewYear}</span>
            {viewYear === currentYear && (
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--fp-color-foreground)] text-white text-[11px] font-semibold">
                {t("tracking.current")}
              </span>
            )}
          </div>
          <button
            onClick={() => setViewYear(y => y + 1)}
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--fp-color-surface-hover)] transition-colors text-[var(--fp-color-label)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Filters/legend row */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-4 text-[13px] font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]">
              <CheckCircle2 className="size-3.5" /> {t("tracking.completed")} {completedMonths.length}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--fp-color-accent-gold-soft)] text-[var(--fp-color-accent-gold-text)]">
              <Minus className="size-3.5" /> {t("tracking.partial")} {partialMonths.length}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--fp-color-coral-soft)] text-[var(--fp-color-coral)]">
              <X className="size-3.5" /> {t("tracking.missed")} {missedMonths.length}
            </span>
          </div>
          <div className="text-[13px] text-[var(--fp-color-label)] font-medium">
            {t("tracking.completion")}: {completionPercent}%
          </div>
        </div>

        {/* Months grid 4×3 */}
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
          {months.map((m) => (
            <div
              key={m.id}
              className={`relative p-4 rounded-[16px] border transition-all cursor-default ${getCardStyle(m.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-[15px] text-[var(--fp-color-foreground)]">{m.name}</div>
                {getStatusBadge(m)}
              </div>

              {(m.status === "completed" || m.status === "partial") && m.amount && (
                <div className="text-[14px] font-semibold text-[var(--fp-color-foreground)]">
                  {formatRub(m.amount)}
                  {m.status === "partial" && m.percent && (
                    <span className="text-[12px] font-medium text-[var(--fp-color-accent-gold-text)] ml-2">
                      ({m.percent}%)
                    </span>
                  )}
                </div>
              )}

              {m.status === "current" && (
                <button
                  onClick={() => markMonth(m.id, "completed")}
                  className="mt-1 text-[13px] font-semibold text-[var(--fp-color-foreground)] underline underline-offset-2 hover:no-underline transition-all"
                >
                  {t("tracking.markNow")}
                </button>
              )}

              {m.status === "pending" && (
                <div className="text-[13px] text-[var(--fp-color-label)]">
                  {t("tracking.ahead")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom legend */}
        <div className="flex items-center gap-6 mt-4 px-1 text-[12px] text-[var(--fp-color-label)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-[var(--fp-color-teal)]" /> {t("tracking.completed")}
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="size-3.5 text-[var(--fp-color-accent-gold-text)]" /> {t("tracking.partial")}
          </span>
          <span className="flex items-center gap-1.5">
            <X className="size-3.5 text-[var(--fp-color-coral)]" /> {t("tracking.missed")}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[var(--fp-color-border)]" /> {t("tracking.awaitingLabel")}
          </span>
        </div>
      </div>

      {/* Tip */}
      <div className="flex gap-3 text-[13px] text-[var(--fp-color-label)] bg-[var(--fp-color-card)] p-4 rounded-[16px] border border-[var(--fp-color-border)]">
        <HelpCircle className="size-5 shrink-0 text-[var(--fp-color-teal)] mt-0.5" />
        <p className="leading-relaxed">{t("tracking.tip")}</p>
      </div>
    </Page>
  );
}
