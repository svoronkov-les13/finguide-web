import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Page } from "@/components/layout/Page";
import {
  FileChartColumnIncreasing, ChevronDown, ChevronUp, Edit3,
  LayoutDashboard, Target, TrendingUp, ExternalLink,
} from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SummarySkeleton } from "@/components/ui/skeleton";

import { useI18n } from "@/i18n/I18nProvider";
import type { Cashflow, Goal } from "@/types/finance";
import { useFormat } from "@/lib/useFormat";

export function SummaryPage() {
  const { data: plan } = usePlanQuery();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { formatRub, formatPercent } = useFormat();

  if (!plan) return <SummarySkeleton />;

  const currentYear = new Date().getFullYear();
  const currentForecast = plan.forecast.find(p => p.year === currentYear) || plan.forecast[0];

  const annualIncome = currentForecast?.income || 0;
  const annualExpenses = Math.abs(currentForecast?.expenses || 0);
  const annualGoals = Math.abs(currentForecast?.goals || 0);

  const balance = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? (balance / annualIncome) * 100 : 0;
  const pensionAvailable = balance - annualGoals;

  const goalsTotal = plan.goals.reduce((sum, g) => sum + g.cost, 0);
  const goalsSaved = plan.goals.reduce((sum, g) => sum + g.saved, 0);
  const goalsPercent = goalsTotal > 0 ? (goalsSaved / goalsTotal) * 100 : 0;

  const incomes = plan.cashflows.filter(c => c.type === "income");
  const expenses = plan.cashflows.filter(c => c.type === "expense");

  return (
    <Page>
      {/* Header */}
      <header className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] shadow-sm">
            <FileChartColumnIncreasing className="size-5 text-[var(--fp-color-foreground)]" />
          </span>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">{t("summary.title")}</h1>
            <p className="mt-1 text-[14px] text-[var(--fp-color-label)]">{t("summary.subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="h-10 gap-2"
            onClick={() => navigate({ to: '/income' as never })}
          >
            <Edit3 className="size-4" /> {t("summary.toEdit")}
          </Button>
          <Button
            className="h-10 gap-2"
            onClick={() => navigate({ to: '/dashboard' as never })}
          >
            <LayoutDashboard className="size-4" /> {t("summary.toDashboard")}
          </Button>
        </div>
      </header>

      {/* Balance + Key Insights */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6 rounded-[20px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[17px] font-semibold mb-1">{t("summary.balance")}</h2>
            <p className="text-[13px] text-[var(--fp-color-label)] mb-6">{t("summary.balanceSubtitle")}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-[42px] font-bold tracking-tight leading-none ${balance >= 0 ? "text-[var(--fp-color-teal)]" : "text-[var(--fp-color-coral)]"}`}>
                {balance > 0 ? "+" : ""}{formatRub(balance)}
              </span>
              <span className="text-[15px] font-medium text-[var(--fp-color-label)]">{t("summary.perYear")}</span>
            </div>
            <div className="text-[13px] font-medium text-[var(--fp-color-label)]">
              {t("summary.avg")} {balance > 0 ? "+" : ""}{formatRub(balance / 12)}{t("summary.perMonth")}
            </div>
          </div>
          <div className={`mt-6 text-[13px] p-4 rounded-[14px] font-medium leading-relaxed ${balance >= 0 ? "bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]" : "bg-[var(--fp-color-coral-soft)] text-[var(--fp-color-coral)]"}`}>
            {balance >= 0 ? t("summary.positiveBalanceTip") : t("summary.negativeBalanceTip")}
          </div>
        </Card>

        <Card className="p-6 rounded-[20px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm">
          <h2 className="text-[17px] font-semibold mb-5">{t("summary.keyInsights")}</h2>
          <ul className="grid gap-4 text-[14px] leading-relaxed text-[var(--fp-color-foreground)]">
            <li className="flex gap-3 items-start">
              <span className="mt-1.5 size-1.5 rounded-full bg-[var(--fp-color-teal)] shrink-0" />
              <span>
                {t("summary.insightSavingsRate")}{" "}
                <strong className="text-[var(--fp-color-teal)]">{formatPercent(savingsRate / 100)}</strong>{" "}
                — {savingsRate >= 20 ? t("summary.excellent") : t("summary.shouldIncrease")}.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-1.5 size-1.5 rounded-full bg-[var(--fp-color-teal)] shrink-0" />
              <span>
                {t("summary.insightGoals")}{" "}
                <strong>~{formatRub(annualGoals)}/{t("summary.yr")}</strong>{" "}
                ({t("summary.avg")} {formatRub(annualGoals / 12)}/{t("summary.mo")}),{" "}
                {t("summary.insightPension")}{" "}
                <strong>{formatRub(pensionAvailable)}/{t("summary.yr")}</strong>{" "}
                ({t("summary.avg")} {formatRub(pensionAvailable / 12)}/{t("summary.mo")}).
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="mt-1.5 size-1.5 rounded-full bg-[var(--fp-color-teal)] shrink-0" />
              <span>
                {t("summary.insightGoalsSaved")}{" "}
                <strong className="text-[var(--fp-color-teal)]">{formatRub(goalsSaved, { compact: true })}</strong>{" "}
                {t("summary.outOf")}{" "}
                <strong>{formatRub(goalsTotal, { compact: true })}</strong>{" "}
                ({Math.round(goalsPercent)}%).
              </span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Collapsible tables */}
      <div className="grid gap-4">
        <CashflowTable
          title={t("summary.income")}
          count={incomes.length}
          total={annualIncome}
          items={incomes}
          inflation={plan.settings.inflation}
          editHref="/income"
          t={t}
        />
        <CashflowTable
          title={t("summary.expenses")}
          count={expenses.length}
          total={annualExpenses}
          items={expenses}
          inflation={plan.settings.inflation}
          editHref="/expenses"
          t={t}
        />
        <GoalsTable
          title={t("summary.goals")}
          count={plan.goals.length}
          total={annualGoals}
          items={plan.goals}
          inflation={plan.settings.inflation}
          goalsSaved={goalsSaved}
          goalsTotal={goalsTotal}
          goalsPercent={goalsPercent}
          editHref="/goals"
          t={t}
        />
      </div>

      {/* Pension mini card */}
      <Card className="p-6 rounded-[20px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[17px] font-semibold flex items-center gap-2 mb-1">
              <TrendingUp className="size-5 text-[var(--fp-color-teal)]" />
              {t("summary.pensionPlan")}
            </h2>
            <p className="text-[13px] text-[var(--fp-color-label)]">{t("summary.pensionSubtitle")}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[12px] text-[var(--fp-color-label)] mb-1">{t("summary.forecastCapital")}</div>
            <div className="text-[24px] font-bold">{formatRub(plan.dashboardSnapshot?.pensionCapitalRub || 0, { compact: true })}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-5 border-t border-[var(--fp-color-border)]">
          {[
            { label: t("summary.availableForPension"), value: `${formatRub(pensionAvailable, { compact: true })} / ${t("summary.yr")}` },
            { label: t("summary.retirementAt"), value: `${plan.settings.retirementAge} ${t("summary.years")}` },
            { label: t("summary.desiredExpenses"), value: `${formatRub(plan.settings.targetMonthlySpend)} / ${t("summary.mo")}` },
            { label: t("summary.returnInflation"), value: `${formatPercent(plan.settings.investmentReturn)} / ${formatPercent(plan.settings.inflation)}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)] mb-1">{label}</div>
              <div className="font-semibold text-[15px]">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CashflowTable({
  title, count, total, items, inflation, editHref, t,
}: {
  title: string; count: number; total: number; items: Cashflow[]; inflation: number; editHref: string;
  t: ReturnType<typeof import("@/i18n/I18nProvider")["useI18n"]>["t"];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { formatRub } = useFormat();

  const freqLabel = (f: Cashflow["frequency"]) => {
    if (f === "monthly") return t("summary.monthly");
    if (f === "yearly") return t("summary.yearly");
    return t("summary.onetime");
  };

  return (
    <Card className="overflow-hidden rounded-[20px] border-[var(--fp-color-border)] shadow-sm">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[var(--fp-color-surface-hover)] transition-colors"
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <span className="text-[13px] text-[var(--fp-color-label)]">{count} {t("summary.entries")}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <span className="text-[13px] text-[var(--fp-color-label)] mr-2">{t("summary.total")}</span>
            <span className="font-bold text-[15px]">{formatRub(total)}</span>
            <span className="text-[13px] text-[var(--fp-color-label)]"> {t("summary.perYear")}</span>
            <span className="text-[13px] text-[var(--fp-color-label)] ml-3">{t("summary.avg")} {formatRub(total / 12)}{t("summary.perMonth")}</span>
          </div>
          {isOpen ? <ChevronUp className="size-5 text-[var(--fp-color-muted-foreground)]" /> : <ChevronDown className="size-5 text-[var(--fp-color-muted-foreground)]" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[var(--fp-color-border)]">
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_auto_2fr_1fr_auto] gap-4 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)] bg-[var(--fp-color-background)]">
            <div>{t("summary.colName")}</div>
            <div>{t("summary.colType")}</div>
            <div className="text-right">{t("summary.colAmount")}</div>
            <div>{t("summary.colPeriod")}</div>
            <div>{t("summary.colGrowth")}</div>
            <div />
          </div>
          <div className="divide-y divide-[var(--fp-color-border)]">
            {items.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_auto_2fr_1fr_auto] gap-4 px-6 py-3.5 items-center text-[14px] hover:bg-[var(--fp-color-surface-hover)] transition-colors group"
              >
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-[var(--fp-color-label)] text-[13px]">{freqLabel(item.frequency)}</div>
                <div className="text-right font-semibold">{formatRub(item.amount)}</div>
                <div className="text-[var(--fp-color-label)] text-[13px]">
                  {item.startYear} — {item.endYear ?? t("summary.indefinite")}
                </div>
                <div className={`text-[13px] font-medium ${effectiveGrowth(item, inflation) > 0 ? "text-[var(--fp-color-teal)]" : "text-[var(--fp-color-label)]"}`}>
                  {formatGrowthPercent(effectiveGrowth(item, inflation))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate({ to: editHref as never }); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)]"
                  title={t("summary.edit")}
                >
                  <ExternalLink className="size-4" />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-6 py-8 text-center text-[14px] text-[var(--fp-color-label)]">{t("summary.noEntries")}</div>
            )}
          </div>
          <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--fp-color-border)]">
            <button
              onClick={() => navigate({ to: editHref as never })}
              className="text-[13px] font-medium text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="size-3.5" /> {t("summary.editSection")}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[13px] text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] transition-colors"
            >
              {t("summary.collapse")}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function GoalsTable({
  title, count, total, items, inflation, goalsSaved, goalsTotal, goalsPercent, editHref, t,
}: {
  title: string; count: number; total: number; items: Goal[];
  inflation: number; goalsSaved: number; goalsTotal: number; goalsPercent: number; editHref: string;
  t: ReturnType<typeof import("@/i18n/I18nProvider")["useI18n"]>["t"];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { formatRub } = useFormat();

  return (
    <Card className="overflow-hidden rounded-[20px] border-[var(--fp-color-border)] shadow-sm">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[var(--fp-color-surface-hover)] transition-colors"
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <span className="text-[13px] text-[var(--fp-color-label)]">{count} {t("summary.entries")}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <span className="text-[13px] text-[var(--fp-color-label)] mr-2">{t("summary.total")}</span>
            <span className="font-bold text-[15px]">{formatRub(total)}</span>
            <span className="text-[13px] text-[var(--fp-color-label)]"> {t("summary.perYear")}</span>
          </div>
          {isOpen ? <ChevronUp className="size-5 text-[var(--fp-color-muted-foreground)]" /> : <ChevronDown className="size-5 text-[var(--fp-color-muted-foreground)]" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[var(--fp-color-border)]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)] bg-[var(--fp-color-background)]">
            <div>{t("summary.colName")}</div>
            <div className="text-right">{t("summary.colCost")}</div>
            <div className="text-center">{t("summary.colTargetYear")}</div>
            <div className="text-right">{t("summary.colIndexation")}</div>
            <div />
          </div>
          <div className="divide-y divide-[var(--fp-color-border)]">
            {items.map(item => {
              const pct = item.cost > 0 ? Math.min(100, Math.round((item.saved / item.cost) * 100)) : 0;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 items-center text-[14px] hover:bg-[var(--fp-color-surface-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className={`size-2 rounded-full shrink-0 ${item.reachable ? "bg-[var(--fp-color-teal)]" : "bg-[var(--fp-color-coral)]"}`} />
                    {item.name}
                    <span className="text-[12px] text-[var(--fp-color-label)] font-normal">({pct}%)</span>
                  </div>
                  <div className="text-right font-semibold">{formatRub(item.cost)}</div>
                  <div className="text-center text-[var(--fp-color-label)] text-[13px]">{item.targetYear}</div>
                  <div className="text-right text-[13px] font-medium text-[var(--fp-color-teal)]">
                    {formatGrowthPercent(effectiveGrowth(item, inflation))} {t("summary.perYearShort")}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: editHref as never }); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)]"
                  >
                    <ExternalLink className="size-4" />
                  </button>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="px-6 py-8 text-center text-[14px] text-[var(--fp-color-label)]">{t("summary.noEntries")}</div>
            )}
          </div>
          <div className="px-6 py-3.5 bg-[var(--fp-color-background)] border-t border-[var(--fp-color-border)] flex items-center justify-between text-[13px]">
            <div className="font-semibold">{t("summary.currentEstimate")}</div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--fp-color-label)]">
                {t("summary.saved")}: {formatRub(goalsSaved, { compact: true })} ({Math.round(goalsPercent)}%)
              </span>
              <span className="font-bold text-[15px]">{formatRub(goalsTotal, { compact: true })}</span>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--fp-color-border)]">
            <button
              onClick={() => navigate({ to: editHref as never })}
              className="text-[13px] font-medium text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] flex items-center gap-1.5 transition-colors"
            >
              <Target className="size-3.5" /> {t("summary.editSection")}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[13px] text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] transition-colors"
            >
              {t("summary.collapse")}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function effectiveGrowth(item: Pick<Cashflow | Goal, "growth" | "growthType">, inflation: number) {
  return item.growthType === "inflation" && item.growth === 0 ? inflation : item.growth;
}

export function formatGrowthPercent(growth: number) {
  const rounded = Math.round(growth * 100);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}
