import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/layout/Page";
import { CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlanQuery, useMonthlyTrackerQuery, useSaveMonthlyTrackerMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRub, cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { nearestGoalMonthlyTarget, trackingActiveGoal } from "@/pages/trackingGoal";
import { makeEmptyYear, monthFormTarget, trackingMonthPercent, MONTH_NAMES_RU, type MonthData, type MonthStatus } from "@/pages/trackingMonths";
import type { MonthlyStatus } from "@/types/finance";

// ─── Month Form Dialog ────────────────────────────────────────────────────────

interface MonthFormProps {
  month: MonthData;
  monthKey: string; // "YYYY-MM"
  monthlyTarget: number;
  plan: import("@/types/finance").FinancialPlan;
  open: boolean;
  onClose: () => void;
  t: ReturnType<typeof useI18n>["t"];
}

function MonthFormDialog({ month, monthKey, monthlyTarget, plan, open, onClose, t }: MonthFormProps) {
  const saveMutation = useSaveMonthlyTrackerMutation();
  const [amount, setAmount] = useState<string>(String(month.amount ?? monthlyTarget));
  const [note, setNote] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const initialAmount = String(month.amount ?? monthlyTarget);
      Promise.resolve().then(() => {
        setAmount(initialAmount);
        setNote("");
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, month.amount, monthlyTarget]);

  const submit = (status: MonthlyStatus) => {
    saveMutation.mutate(
      { planId: plan.planId!, month: monthKey, status, amount: Number(amount) || null, note: note || null },
      { onSuccess: onClose },
    );
  };

  const yearLabel = monthKey.split("-")[0];
  const monthIdx = parseInt(monthKey.split("-")[1]) - 1;
  const monthLabel = MONTH_NAMES_RU[monthIdx] ?? month.name;
  const isPast = month.status !== "current" && month.status !== "pending";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent hideClose>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] text-[var(--fp-color-label)]">
                <Calendar className="size-4" />
              </span>
              <div>
                <DialogTitle className="text-[15px] font-semibold text-[var(--fp-color-foreground)]">
                  {monthLabel} {yearLabel}
                </DialogTitle>
                <div className="text-[12px] text-[var(--fp-color-label)]">
                  {isPast ? t("tracking.pastMonth") : t("tracking.currentMonth")}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid size-7 place-items-center rounded-full text-[var(--fp-color-label)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
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
            <span className="self-center text-[12px] text-[var(--fp-color-label)]">{t("tracking.quickLabel")}</span>
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
          <div className="grid gap-2">
            <button
              onClick={() => {
                const amt = Number(amount) || 0;
                const norm = monthlyTarget;
                const status: MonthlyStatus = amt >= norm ? "completed" : amt > 0 ? "partial" : "missed";
                submit(status);
              }}
              disabled={saveMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--fp-color-foreground)] px-4 py-2.5 text-[14px] font-semibold text-[var(--fp-color-background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <CheckCircle2 className="size-4" />
              {saveMutation.isPending ? t("tracking.monthFormSaving") : t("tracking.monthFormSave")}
            </button>
            {saveMutation.isError && (
              <div className="rounded-[8px] bg-[var(--fp-color-coral-soft)] px-3 py-2 text-[12px] font-medium text-[var(--fp-color-coral)] text-center">
                {t("tracking.saveError")}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-[var(--fp-color-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
            >
              {t("tracking.monthFormCancel")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

  const activeGoal = trackingActiveGoal(plan?.goals);
  const monthlyTarget = plan?.dashboardSnapshot?.monthlyTargetRub ?? 0;
  const nearestGoalTarget = nearestGoalMonthlyTarget(plan?.goals, currentYear, plan?.settings.monthsInYear ?? 12);
  const trackerMonthTarget = monthFormTarget({ allGoalsTarget: monthlyTarget, nearestGoalTarget });

  // Build month grid from backend data + defaults
  const months: MonthData[] = (() => {
    const base = makeEmptyYear(viewYear, currentYear, currentMonthIdx);
    trackerData.forEach((entry) => {
      const [entryYear, entryMonth] = entry.month.split("-");
      if (Number(entryYear) !== viewYear) return;
      const idx = Number(entryMonth) - 1;
      if (idx < 0 || idx > 11) return;
      const percent = trackingMonthPercent({
        amount: entry.amount ?? undefined,
        contributionGoalTarget: nearestGoalTarget,
        fallbackTarget: monthlyTarget,
      });
      base[idx] = {
        ...base[idx],
        status: entry.status === "pending" ? (idx === currentMonthIdx && viewYear === currentYear ? "current" : "pending") : entry.status as MonthStatus,
        amount: entry.amount ?? undefined,
        percent,
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
    const monthIdx = parseInt(m.id) - 1;
    const isPastMonth = viewYear < currentYear || (viewYear === currentYear && monthIdx < currentMonthIdx);

    switch (m.status) {
      case "completed": 
        return (
          <span className="text-[11px] font-semibold text-[var(--fp-color-teal)] flex items-center gap-1">
            <CheckCircle2 className="size-[12px]" />
            {t("tracking.statusCompleted")}
            {m.percent != null && m.percent < 100 && ` (${m.percent}%)`}
          </span>
        );
      case "partial": 
        return (
          <span className="text-[11px] font-semibold text-[var(--fp-color-accent-gold-text)]">
            {t("tracking.statusPartial")}
            {m.percent != null && ` (${m.percent}%)`}
          </span>
        );
      case "missed": return <span className="text-[11px] font-semibold text-[var(--fp-color-coral)]">{t("tracking.statusMissed")}</span>;
      case "current": return <span className="text-[11px] font-semibold text-[var(--fp-color-muted-foreground)]">{t("tracking.mark")}</span>;
      default: return (
        <span className="text-[11px] text-[var(--fp-color-muted-foreground)]">
          {isPastMonth ? t("tracking.awaitingLabel") : t("tracking.ahead")}
        </span>
      );
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 mb-6">
        {/* Left column: Active Goal + Monthly Norm stacked */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active goal */}
          <Card className="p-5 flex flex-col justify-between min-h-[160px]">
            <div>
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
                  <div className="mt-1.5 h-1.5 rounded-full bg-[var(--fp-color-border)]">
                    <div
                      className="h-full rounded-full bg-[var(--fp-color-teal)] transition-all"
                      style={{ width: `${activeGoal.cost > 0 ? Math.min(100, Math.round((activeGoal.saved / activeGoal.cost) * 100)) : 0}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-3 text-[13px] text-[var(--fp-color-label)]">{t("tracking.noActiveGoals")}</div>
              )}
            </div>
            {activeGoal && (
              <div className="mt-2 flex justify-between text-[11px] text-[var(--fp-color-label)] pt-1 border-t border-[var(--fp-color-border)]/40">
                <div>
                  {formatRub(activeGoal.saved)} {t("tracking.outOf")} {formatRub(activeGoal.cost)}
                </div>
                <div>
                  {t("tracking.goalYear", { year: String(activeGoal.targetYear) })}
                </div>
              </div>
            )}
          </Card>

          {/* Monthly norm card */}
          <Card className="p-5 flex flex-col justify-between min-h-[190px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fp-color-label)]">
                {t("tracking.monthlyNorm")} — {t("tracking.incomeMinusExpenses")}
              </div>
              <div className="mt-2 text-[24px] font-bold text-[var(--fp-color-foreground)]">
                {formatRub(monthlyTarget)}
              </div>
            </div>
            
            <div className="border-t border-[var(--fp-color-border)] my-2"></div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-[var(--fp-color-label)] leading-none mb-1">
                  {t("tracking.forYear", { year: String(viewYear) })}
                </div>
                <div className="text-[14px] font-bold text-[var(--fp-color-teal)] truncate">
                  {formatRub(totalSaved)}
                </div>
                <div className="text-[9px] text-[var(--fp-color-label)] scale-90 origin-center truncate">
                  {totalPercent}%
                </div>
              </div>
              
              <div>
                <div className="text-[10px] text-[var(--fp-color-label)] leading-none mb-1 truncate">
                  {t("tracking.completion")}
                </div>
                <div className="text-[14px] font-bold text-[var(--fp-color-foreground)] mt-0.5">
                  {completionPct}%
                </div>
              </div>
              
              <div>
                <div className="text-[10px] text-[var(--fp-color-label)] leading-none mb-1 truncate">
                  {t("tracking.marked")}
                </div>
                <div className="text-[14px] font-bold text-[var(--fp-color-foreground)] mt-0.5">
                  {completedMonths.length + partialMonths.length}/12
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Current month card + Year Summary card stacked */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className={cn("p-5 flex flex-col justify-between flex-grow min-h-[160px]", getCardStyle(currentMonthData?.status ?? "current"))}>
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
                  className="rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 py-1 text-[12px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
                >
                  {t("tracking.mark")} →
                </button>
              )}
            </div>
            
            <div className="my-auto py-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fp-color-label)] mb-1">
                {t("tracking.totalSavings")}
              </div>
              <div className="text-[36px] font-bold text-[var(--fp-color-teal)] leading-none">
                {currentMonthData?.amount ? formatRub(currentMonthData.amount) : "0 ₽"}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-[var(--fp-color-border)] pt-3 mt-2">
              <span className="text-[11px] text-[var(--fp-color-label)]">
                {t("tracking.completion")}
              </span>
              <div className="flex gap-2">
                {getStatusLabel(currentMonthData ?? { id: "", name: "", status: "current" })}
              </div>
            </div>
          </Card>

          {/* Year summary */}
          {(completedMonths.length + partialMonths.length + missedMonths.length) > 0 && (
            <Card className="p-5">
              <div className="mb-2 font-semibold text-[var(--fp-color-foreground)]">
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
              <div className="mt-3 text-[13px] text-[var(--fp-color-label)] pt-2 border-t border-[var(--fp-color-border)]/40">
                {t("tracking.totalSavings")}: {" "}
                <span className="font-semibold text-[var(--fp-color-foreground)]">{formatRub(totalSaved)}</span>
                {" "}{t("tracking.outOfPlanned")}{" "}
                <span className="font-semibold text-[var(--fp-color-foreground)]">{formatRub(totalPlanned)}</span>
                {" "}({totalPercent}%)
              </div>
            </Card>
          )}
        </div>
      </div>

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
                  "group relative rounded-[14px] border p-4 text-left transition-all hover:shadow-sm flex items-center justify-between min-h-[72px]",
                  getCardStyle(m.status),
                  isSelected && "ring-2 ring-[var(--fp-color-teal)]",
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[var(--fp-color-foreground)]">
                    {MONTH_NAMES_RU[parseInt(m.id) - 1]}
                  </span>
                  {m.amount ? (
                    <span className="text-[12px] font-semibold text-[var(--fp-color-foreground)] opacity-90">
                      {formatRub(m.amount)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--fp-color-muted-foreground)] select-none pointer-events-none opacity-0">
                      &nbsp;
                    </span>
                  )}
                </div>
                <div className="flex items-center shrink-0">
                  {getStatusLabel(m)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-[14px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4 text-[13px] text-[var(--fp-color-label)]">
        <p className="leading-relaxed">{t("tracking.tip")}</p>
      </div>

      {/* Month Dialog */}
      {selectedMonth && plan && (
        <MonthFormDialog
          month={selectedMonth}
          monthKey={monthKey(selectedMonth.id)}
          monthlyTarget={trackerMonthTarget}
          plan={plan}
          open={!!selectedMonthId}
          onClose={() => setSelectedMonthId(null)}
          t={t}
        />
      )}
    </Page>
  );
}
