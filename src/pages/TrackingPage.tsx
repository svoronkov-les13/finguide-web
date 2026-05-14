import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/layout/Page";
import { CheckCircle2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlanQuery, useMonthlyTrackerQuery, useSaveMonthlyTrackerMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { formatRub, cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { MonthlyStatus } from "@/types/finance";

// ─── Types ────────────────────────────────────────────────────────────────────

type MonthStatus = "completed" | "partial" | "missed" | "current" | "pending";

interface MonthData {
  id: string;        // "01"–"12"
  name: string;
  status: MonthStatus;
  amount?: number;
  percent?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTH_NAMES_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

function makeEmptyYear(year: number, currentYear: number, currentMonthIdx: number): MonthData[] {
  return MONTH_NAMES_RU.map((name, i) => ({
    id: String(i + 1).padStart(2, "0"),
    name,
    status: (year === currentYear && i === currentMonthIdx
      ? "current"
      : year < currentYear || (year === currentYear && i < currentMonthIdx)
        ? "pending"
        : "pending") as MonthStatus,
  }));
}

// ─── Month Form (inline panel) ────────────────────────────────────────────────

interface MonthFormProps {
  month: MonthData;
  monthKey: string; // "YYYY-MM"
  monthlyTarget: number;
  onClose: () => void;
  t: ReturnType<typeof useI18n>["t"];
}

function MonthForm({ month, monthKey, monthlyTarget, onClose, t }: MonthFormProps) {
  const saveMutation = useSaveMonthlyTrackerMutation();
  const [amount, setAmount] = useState<string>(String(month.amount ?? monthlyTarget));
  const [note, setNote] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (status: MonthlyStatus) => {
    saveMutation.mutate(
      { month: monthKey, status, amount: Number(amount) || null, note: note || null },
      { onSuccess: onClose },
    );
  };

  const yearLabel = monthKey.split("-")[0];
  const monthIdx = parseInt(monthKey.split("-")[1]) - 1;
  const monthLabel = MONTH_NAMES_RU[monthIdx] ?? month.name;

  // Determine label: past / current
  const isPast = month.status !== "current" && month.status !== "pending";

  return (
    <Card className="overflow-hidden border-[var(--fp-color-border-strong)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--fp-color-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] text-[var(--fp-color-label)]">
            <Calendar className="size-4" />
          </span>
          <div>
            <div className="font-semibold text-[var(--fp-color-foreground)]">{monthLabel} {yearLabel}</div>
            <div className="text-[12px] text-[var(--fp-color-label)]">
              {isPast ? "Прошедший месяц" : t("tracking.currentMonth")}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="grid size-7 place-items-center rounded-full text-[var(--fp-color-label)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 px-5 py-5">
        {/* Amount */}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-[var(--fp-color-label)]">
            {t("tracking.monthFormAmount")}
          </span>
          <div className="relative">
            <input
              ref={inputRef}
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-4 py-2.5 pr-8 text-[15px] font-semibold text-[var(--fp-color-foreground)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[var(--fp-color-label)]">₽</span>
          </div>
          <div className="text-[12px] text-[var(--fp-color-label)]">
            {t("tracking.monthFormNorm", { amount: formatRub(monthlyTarget) })}
          </div>
        </label>

        {/* Note */}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-[var(--fp-color-label)]">
            {t("tracking.monthFormNote")}
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("tracking.monthFormNotePlaceholder")}
            className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-4 py-2.5 text-[14px] text-[var(--fp-color-foreground)] placeholder:text-[var(--fp-color-label)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
          />
        </label>

        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-[12px] text-[var(--fp-color-label)]">Быстро:</span>
          <button
            type="button"
            onClick={() => setAmount(String(monthlyTarget))}
            className="rounded-full bg-[var(--fp-color-teal-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--fp-color-teal)] hover:bg-[var(--fp-color-teal)]/20 transition-colors"
          >
            {t("tracking.monthFormQuick100")}
          </button>
          <button
            type="button"
            onClick={() => setAmount(String(Math.round(monthlyTarget * 0.5)))}
            className="rounded-full bg-[var(--fp-color-surface-hover)] px-3 py-1 text-[12px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-border)] transition-colors"
          >
            {t("tracking.monthFormQuick50")}
          </button>
          <button
            type="button"
            onClick={() => setAmount("0")}
            className="rounded-full bg-[var(--fp-color-coral-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--fp-color-coral)] hover:bg-[var(--fp-color-coral)]/20 transition-colors"
          >
            {t("tracking.monthFormQuickFailed")}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              const amt = Number(amount) || 0;
              const norm = monthlyTarget;
              const status: MonthlyStatus = amt >= norm ? "completed" : amt > 0 ? "partial" : "missed";
              submit(status);
            }}
            disabled={saveMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[var(--fp-color-foreground)] px-4 py-2.5 text-[14px] font-semibold text-[var(--fp-color-background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <CheckCircle2 className="size-4" />
            {saveMutation.isPending ? t("tracking.monthFormSaving") : t("tracking.monthFormSave")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[var(--fp-color-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
          >
            {t("tracking.monthFormCancel")}
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── TrackingPage ─────────────────────────────────────────────────────────────

export function TrackingPage() {
  const { data: plan } = usePlanQuery();
  const { data: trackerData = [] } = useMonthlyTrackerQuery();
  const { t } = useI18n();

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-indexed

  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const activeGoal = plan?.goals.find((g) => !g.reachable) ?? plan?.goals[0];
  const monthlyTarget = plan?.dashboardSnapshot?.monthlyTargetRub ?? 0;

  // Build month grid from backend data + defaults
  const months: MonthData[] = (() => {
    const base = makeEmptyYear(viewYear, currentYear, currentMonthIdx);
    trackerData.forEach((entry) => {
      const [entryYear, entryMonth] = entry.month.split("-");
      if (Number(entryYear) !== viewYear) return;
      const idx = Number(entryMonth) - 1;
      if (idx < 0 || idx > 11) return;
      base[idx] = {
        ...base[idx],
        status: entry.status === "pending" ? (idx === currentMonthIdx && viewYear === currentYear ? "current" : "pending") : entry.status as MonthStatus,
        amount: entry.amount ?? undefined,
      };
    });
    // Mark current month
    if (viewYear === currentYear) {
      const cur = base[currentMonthIdx];
      if (cur && cur.status === "pending") base[currentMonthIdx] = { ...cur, status: "current" };
    }
    return base;
  })();

  const completedMonths = months.filter((m) => m.status === "completed");
  const partialMonths = months.filter((m) => m.status === "partial");
  const missedMonths = months.filter((m) => m.status === "missed");
  const totalSaved = months.reduce((acc, m) => acc + (m.amount ?? 0), 0);
  const totalPlanned = monthlyTarget * 12;
  const totalPercent = totalPlanned > 0 ? Math.round((totalSaved / totalPlanned) * 100) : 0;
  const completionPct = completedMonths.length + partialMonths.length > 0
    ? Math.round((completedMonths.length / (completedMonths.length + partialMonths.length + missedMonths.length)) * 100)
    : 0;

  const currentMonthData = months[currentMonthIdx];

  // Month key for API
  const monthKey = (monthId: string) => `${viewYear}-${monthId}`;

  function getCardStyle(status: MonthStatus): string {
    switch (status) {
      case "completed": return "border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5";
      case "partial": return "border-[var(--fp-color-accent-gold)]/40 bg-[var(--fp-color-accent-gold-soft)]";
      case "missed": return "border-[var(--fp-color-coral)]/30 bg-[var(--fp-color-coral-soft)]";
      case "current": return "border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface-hover)]";
      default: return "border-[var(--fp-color-border)] bg-[var(--fp-color-card)]";
    }
  }

  function getStatusLabel(m: MonthData) {
    switch (m.status) {
      case "completed": return <span className="text-[11px] font-semibold text-[var(--fp-color-teal)] flex items-center gap-1"><CheckCircle2 className="size-[12px]" />{t("tracking.statusCompleted")}</span>;
      case "partial": return <span className="text-[11px] font-semibold text-[var(--fp-color-accent-gold-text)]">{t("tracking.statusPartial")}</span>;
      case "missed": return <span className="text-[11px] font-semibold text-[var(--fp-color-coral)]">{t("tracking.statusMissed")}</span>;
      case "current": return <span className="text-[11px] font-semibold text-[var(--fp-color-muted-foreground)]">{t("tracking.mark")}</span>;
      default: return <span className="text-[11px] text-[var(--fp-color-muted-foreground)]">{t("tracking.ahead")}</span>;
    }
  }

  const selectedMonth = selectedMonthId ? months.find((m) => m.id === selectedMonthId) : null;

  return (
    <Page>
      {/* Page title */}
      <header>
        <h1 className="page-title">{t("tracking.title")}</h1>
        <p className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">{t("tracking.subtitle")}</p>
      </header>

      {/* Top cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Active goal */}
        <Card className="p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fp-color-label)]">
            {t("tracking.activeGoal")}
          </div>
          {activeGoal ? (
            <>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <div className="text-[16px] font-bold text-[var(--fp-color-foreground)] truncate">{activeGoal.name}</div>
                <div className="shrink-0 text-[15px] font-bold text-[var(--fp-color-teal)]">
                  {activeGoal.cost > 0 ? Math.round((activeGoal.saved / activeGoal.cost) * 100) : 0}%
                </div>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[var(--fp-color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--fp-color-teal)] transition-all"
                  style={{ width: `${activeGoal.cost > 0 ? Math.min(100, Math.round((activeGoal.saved / activeGoal.cost) * 100)) : 0}%` }}
                />
              </div>
              <div className="mt-2 text-[12px] text-[var(--fp-color-label)]">
                {formatRub(activeGoal.saved)} {t("tracking.outOf")} {formatRub(activeGoal.cost)}
              </div>
              <div className="mt-1 text-[11px] text-[var(--fp-color-label)]">
                {t("tracking.goalYear", { year: String(activeGoal.targetYear) })}
              </div>
            </>
          ) : (
            <div className="mt-3 text-[13px] text-[var(--fp-color-label)]">{t("tracking.noActiveGoals")}</div>
          )}
        </Card>

        {/* Current month card */}
        <Card className={cn("p-5", getCardStyle(currentMonthData?.status ?? "current"))}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[var(--fp-color-label)]" />
                <span className="text-[14px] font-semibold text-[var(--fp-color-foreground)]">
                  {MONTH_NAMES_RU[currentMonthIdx]} {currentYear}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--fp-color-label)]">{t("tracking.currentMonth")}</div>
            </div>
            {(currentMonthData?.status === "pending" || currentMonthData?.status === "current") && (
              <button
                onClick={() => setSelectedMonthId(currentMonthData.id)}
                className="rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-3 py-1 text-[12px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
              >
                {t("tracking.mark")} →
              </button>
            )}
          </div>
          <div className="mt-3 text-[24px] font-bold text-[var(--fp-color-teal)]">
            {currentMonthData?.amount ? formatRub(currentMonthData.amount) : "0 ₽"}
          </div>
          <div className="mt-2 flex gap-2">
            {getStatusLabel(currentMonthData ?? { id: "", name: "", status: "current" })}
          </div>
        </Card>
      </div>

      {/* Monthly norm card */}
      <Card className="p-5">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fp-color-label)]">
          {t("tracking.monthlyNorm")} — {t("tracking.incomeMinusExpenses")}
        </div>
        <div className="mt-2 text-[28px] font-bold text-[var(--fp-color-foreground)]">{formatRub(monthlyTarget)}</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-[20px] font-bold text-[var(--fp-color-teal)]">{formatRub(totalSaved)}</div>
            <div className="text-[11px] text-[var(--fp-color-label)]">{t("tracking.forYear", { year: String(viewYear) })}</div>
            <div className="text-[11px] text-[var(--fp-color-label)]">{totalPercent}% {t("tracking.outOfPlanned")}</div>
          </div>
          <div className="text-center">
            <div className="text-[20px] font-bold text-[var(--fp-color-foreground)]">{completionPct}%</div>
            <div className="text-[11px] text-[var(--fp-color-label)]">{t("tracking.completion")}</div>
          </div>
          <div className="text-center">
            <div className="text-[20px] font-bold text-[var(--fp-color-foreground)]">{completedMonths.length + partialMonths.length}</div>
            <div className="text-[11px] text-[var(--fp-color-label)]">{t("tracking.marked")} {t("tracking.outOf")} 12 {t("tracking.months")}</div>
          </div>
        </div>
      </Card>

      {/* Calendar section */}
      <div>
        {/* Year navigation */}
        <div className="flex items-center justify-between py-4 px-5 bg-[var(--fp-color-card)] border border-[var(--fp-color-border)] rounded-[20px] mb-4 shadow-sm">
          <button
            onClick={() => { setViewYear((y) => y - 1); setSelectedMonthId(null); }}
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--fp-color-surface-hover)] transition-colors text-[var(--fp-color-label)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-[var(--fp-color-foreground)]">{viewYear}</span>
            {viewYear === currentYear && (
              <span className="rounded-full bg-[var(--fp-color-teal-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fp-color-teal)]">
                {t("tracking.current")}
              </span>
            )}
          </div>
          <button
            onClick={() => { setViewYear((y) => y + 1); setSelectedMonthId(null); }}
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--fp-color-surface-hover)] transition-colors text-[var(--fp-color-label)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Status legend */}
        <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-[12px] text-[var(--fp-color-label)]">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--fp-color-teal)]" />{t("tracking.statusCompleted")} {completedMonths.length}</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--fp-color-accent-gold)]" />{t("tracking.statusPartial")} {partialMonths.length}</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--fp-color-coral)]" />{t("tracking.statusMissed")} {missedMonths.length}</span>
          <span className="ml-auto text-[var(--fp-color-label)]">{t("tracking.completion")}: {completionPct}%</span>
        </div>

        {/* 4×3 grid */}
        <div className="grid grid-cols-4 gap-3">
          {months.map((m) => {
            const isSelected = selectedMonthId === m.id;
            const canMark = m.status === "current" || m.status === "pending" || m.status === "missed" || m.status === "partial" || m.status === "completed";
            return (
              <button
                key={m.id}
                onClick={() => canMark ? setSelectedMonthId(isSelected ? null : m.id) : undefined}
                className={cn(
                  "group relative rounded-[14px] border p-3 text-left transition-all hover:shadow-sm",
                  getCardStyle(m.status),
                  isSelected && "ring-2 ring-[var(--fp-color-teal)]",
                )}
              >
                <div className="text-[13px] font-semibold text-[var(--fp-color-foreground)]">
                  {MONTH_NAMES_SHORT[parseInt(m.id) - 1]}
                </div>
                {m.amount ? (
                  <div className="mt-1 text-[12px] font-bold text-[var(--fp-color-foreground)]">
                    {formatRub(m.amount, { compact: true })}
                    {m.percent != null && (
                      <span className="ml-1 text-[10px] font-normal text-[var(--fp-color-label)]">({m.percent}%)</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-[12px] text-[var(--fp-color-label)]">
                    {m.status === "pending" ? t("tracking.ahead") : ""}
                  </div>
                )}
                <div className="mt-1">{getStatusLabel(m)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month form (inline, below grid) */}
      {selectedMonth && (
        <MonthForm
          month={selectedMonth}
          monthKey={monthKey(selectedMonth.id)}
          monthlyTarget={monthlyTarget}
          onClose={() => setSelectedMonthId(null)}
          t={t}
        />
      )}

      {/* Year summary */}
      {(completedMonths.length + partialMonths.length + missedMonths.length) > 0 && (
        <Card className="p-5">
          <div className="mb-3 font-semibold text-[var(--fp-color-foreground)]">
            {t("tracking.yearSummary", { year: String(viewYear) })}
          </div>
          <p className="text-[13px] text-[var(--fp-color-label)]">
            {t("tracking.yearSummaryText", {
              year: String(viewYear),
              total: String(completedMonths.length + partialMonths.length + missedMonths.length),
              completed: String(completedMonths.length),
              partial: String(partialMonths.length),
            })}
          </p>
          <div className="mt-4 text-[13px] text-[var(--fp-color-label)]">
            {t("tracking.totalSavings")}: {" "}
            <span className="font-semibold text-[var(--fp-color-foreground)]">{formatRub(totalSaved)}</span>
            {" "}{t("tracking.outOfPlanned")}{" "}
            <span className="font-semibold text-[var(--fp-color-foreground)]">{formatRub(totalPlanned)}</span>
            {" "}({totalPercent}%)
          </div>
        </Card>
      )}

      {/* Tip */}
      <div className="rounded-[14px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4 text-[13px] text-[var(--fp-color-label)]">
        <p className="leading-relaxed">{t("tracking.tip")}</p>
      </div>
    </Page>
  );
}
