import { Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

import { computeGoalFeasibility } from "@/engine/goalFeasibility";
import { useI18n } from "@/i18n/I18nProvider";
import { useFormat } from "@/lib/useFormat";

export function KpiCards() {
  const { t } = useI18n();
  const { formatRub } = useFormat();
  const { data: plan } = usePlanQuery();
  if (!plan) return <KpiSkeleton />;

  const forecast = plan.forecast;
  const snapshot = plan.dashboardSnapshot;
  const currentYear = new Date().getFullYear();
  
  const monthlyRequired = snapshot?.monthlyTargetRub ?? 787319;
  const annualTarget = snapshot?.annualTargetRub ?? 9400000;
  
  const feasibility = computeGoalFeasibility(
    plan.goals,
    snapshot?.netMonthlyBalanceRub ?? 0,
    currentYear,
  );
  
  const retirementPoint = forecast.find((point) => point.age >= plan.settings.retirementAge) ?? forecast.at(-1)!;
  const annualSpend = plan.settings.targetMonthlySpend * 12;
  const spendDownYears = Math.max(0, Math.floor(retirementPoint.capital / Math.max(annualSpend, 1)));

  const feasibilityPct = feasibility.weightedPct;
  const feasibilityLabel = feasibilityPct >= 80
    ? t("dashboard.feasibilityExcellent")
    : feasibilityPct >= 50
      ? t("dashboard.feasibilityNormal")
      : t("dashboard.feasibilityBad");

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[1.2fr_1fr_1fr] gap-4 mb-6 items-stretch">
      {/* Рекомендация */}
      <Card className="p-5 border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5 flex flex-col justify-start">
        <div className="label-caps flex items-center gap-2 mb-4 text-[var(--fp-color-teal)]">
          <div className="size-7 rounded-full bg-[var(--fp-color-teal)]/20 flex items-center justify-center">
            <Sparkles className="size-3.5 text-[var(--fp-color-teal)]" />
          </div>
          {t("dashboard.recommendation")}
        </div>
        <p className="text-[14.5px] font-medium leading-relaxed text-[var(--fp-color-foreground)]">
          {t("dashboard.recommendationText", { year: String(snapshot?.independenceYear || 2076) })}
        </p>
      </Card>

      {/* Нужно откладывать & Хватает на */}
      <div className="flex flex-col gap-4">
        {/* Нужно откладывать */}
        <Card className="p-5 border-[var(--fp-color-border-strong)] flex-1 flex flex-col justify-center">
          <div className="label-caps flex items-center gap-1 mb-2 text-[var(--fp-color-muted-foreground)]">
            {t("dashboard.needToSave")} <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold">?</span>
          </div>
          <div className="text-[26px] font-bold tracking-tight flex items-baseline gap-1 text-[var(--fp-color-foreground)] leading-none">
            {formatRub(monthlyRequired, { compact: false }).replace('₽', '').trim()}
            <span className="text-[14px] font-medium text-[var(--fp-color-muted-foreground)]">₽{t("dashboard.perMonth")}</span>
          </div>
          <div className="text-[13px] font-medium text-[var(--fp-color-muted-foreground)] mt-2">
            {formatRub(annualTarget, { compact: true })}{t("dashboard.perYear")}
          </div>
        </Card>

        {/* Хватает на */}
        <Card className="p-5 border-[var(--fp-color-border-strong)] flex-1 flex flex-col justify-center">
          <div className="label-caps flex items-center gap-1 mb-2 text-[var(--fp-color-muted-foreground)]">
            {t("dashboard.capitalSufficiency")} <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold">?</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[22px] font-bold text-[var(--fp-color-coral)] leading-none">
              {spendDownYears > 50
                ? t("dashboard.yearsLabelMax")
                : t("dashboard.yearsLabel", { count: String(spendDownYears) })}
            </span>
            <span className="text-[11px] font-medium text-[var(--fp-color-muted-foreground)] leading-tight mt-1">
              {t("dashboard.yearsAfterRetirement", { age: String(plan.settings.retirementAge) })}
            </span>
          </div>
        </Card>
      </div>

      {/* Выполнимость целей & Заполненность модели */}
      <div className="flex flex-col gap-4">
        {/* Выполнимость целей */}
        <Card className="p-5 border-[var(--fp-color-border-strong)] flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="label-caps flex items-center gap-1 text-[var(--fp-color-muted-foreground)]">
              {t("dashboard.goalFeasibility")} <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold">?</span>
            </div>
            <TrendingUp className="size-4 text-[var(--fp-color-muted-foreground)]/70" />
          </div>
          
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[26px] font-bold tracking-tight text-[var(--fp-color-foreground)] leading-none">
              {t("dashboard.goalsXofY", {
                reachable: String(feasibility.reachableCount),
                total: String(feasibility.totalCount),
              })}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${feasibilityPct >= 80 ? 'bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]' : feasibilityPct >= 50 ? 'bg-[var(--fp-color-accent-gold)]/10 text-[var(--fp-color-accent-gold)]' : 'bg-[var(--fp-color-coral)]/10 text-[var(--fp-color-coral)]'}`}>
              {feasibilityLabel}
            </span>
          </div>
          
          <ProgressBar
            value={feasibilityPct}
            size="sm"
            variant={feasibilityPct >= 80 ? "success" : feasibilityPct >= 50 ? "default" : "warning"}
            className="h-1.5 rounded-full mt-1"
          />
        </Card>

        {/* Заполненность модели */}
        <Card className="p-5 border-[var(--fp-color-border-strong)] flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <div className="label-caps flex items-center gap-1.5 text-[var(--fp-color-muted-foreground)]">
              <CheckCircle2 className="size-3.5 text-[var(--fp-color-teal)]" />
              {t("dashboard.modelCompleteness")}
            </div>
            <span className="px-2 py-0.5 rounded bg-[var(--fp-color-teal)]/10 text-[11px] font-bold text-[var(--fp-color-teal)]">100%</span>
          </div>
          <ProgressBar value={100} size="sm" variant="success" className="h-1.5 rounded-full mt-1" />
        </Card>
      </div>
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[1.2fr_1fr_1fr] gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="animate-pulse bg-[var(--fp-color-muted)]/60 min-h-[180px] border-[var(--fp-color-border)]" />
      ))}
    </section>
  );
}
