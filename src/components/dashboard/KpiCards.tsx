import { Activity, BadgeCheck, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { usePlanQuery } from "@/api/planQueries";
import { Badge } from "@/components/ui/badge";
import { Card, RecommendationCard } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useI18n } from "@/i18n/I18nProvider";
import { formatRub } from "@/lib/utils";

export function KpiCards() {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  if (!plan) return <KpiSkeleton />;

  const forecast = plan.forecast;
  const retirementPoint = forecast.find((point) => point.age >= plan.settings.retirementAge) ?? forecast.at(-1)!;
  const lastPoint = forecast.at(-1)!;
  const snapshot = plan.dashboardSnapshot;
  const monthlyRequired = snapshot?.monthlyTargetRub ?? 827_067;
  const annualTarget = snapshot?.annualTargetRub ?? monthlyRequired * 12;
  const monthlyDelta = snapshot?.monthlyDeltaRub ?? monthlyRequired - (forecast[2]?.savings ?? forecast[0]?.savings ?? 0) * 14;
  const pensionCapital = snapshot?.pensionCapitalRub ?? retirementPoint.capital * 100;
  const healthScore = snapshot?.healthScore ?? 74;
  const recommendationYear = snapshot?.recommendationYear ?? lastPoint.year;
  const independenceYear = snapshot?.independenceYear ?? lastPoint.year;
  const retirementLabel =
    snapshot?.retirementLabel ?? `к ${plan.settings.retirementAge} г. · ${plan.settings.retirementAge - plan.settings.currentAge} л.`;
  const independenceLabel = snapshot?.independenceLabel ?? `через ${lastPoint.year - new Date().getFullYear()} лет`;

  return (
    <section className="grid min-w-0 max-w-[1122px] grid-cols-[1.15fr_1.05fr_1.05fr_1.05fr] gap-2.5 max-[1120px]:grid-cols-2 max-[760px]:grid-cols-1">
      {/* Recommendation card — spans 2 rows */}
      <RecommendationCard className="row-span-2 min-h-[176px] min-w-0 p-7 max-[1120px]:row-span-1 max-[760px]:p-5">
        <div className="label-caps flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-[var(--fp-color-foreground)]/5">
            <Sparkles className="size-3" />
          </span>
          {t("dashboard.recommendation")}
        </div>
        <p className="mt-7 min-w-0 break-words text-lg font-bold leading-snug max-[760px]:mt-4 max-[760px]:text-base">
          {t("dashboard.recommendationText", { year: recommendationYear })}
        </p>
      </RecommendationCard>

      {/* Need to save card */}
      <Card className="min-h-[84px] min-w-0 p-4">
        <div className="label-caps flex items-center gap-1">
          {t("dashboard.needToSave")}
          <span className="grid size-4 place-items-center rounded-full border border-[var(--fp-color-border)] text-[10px]">?</span>
        </div>
        <div className="mt-2 card-value-xl leading-none">
          {formatRub(monthlyRequired)}
          <span className="ml-1 text-xs text-[var(--fp-color-muted-foreground)]">{t("dashboard.perMonth")}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[var(--fp-color-muted-foreground)]">
          <span>{formatRub(annualTarget, { compact: true })}{t("dashboard.perYear")}</span>
          <Badge variant="danger">{formatRub(monthlyDelta)}</Badge>
        </div>
        <div className="mt-2 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.slice(0, 9)}>
              <Area type="monotone" dataKey="savings" stroke="var(--fp-color-coral)" strokeWidth={1.5} fill="var(--fp-color-coral)" fillOpacity={0.14} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pension capital card */}
      <Card className="min-h-[84px] min-w-0 p-4">
        <div className="label-caps">{t("dashboard.pensionCapital")}</div>
        <div className="mt-2 card-value-lg font-bold">{formatRub(pensionCapital, { compact: true })}</div>
        <div className="text-xs font-semibold text-[var(--fp-color-muted-foreground)]">{retirementLabel}</div>
      </Card>

      {/* Health score card */}
      <Card className="min-h-[84px] min-w-0 p-4">
        <div className="flex items-center justify-between">
          <div className="label-caps">{t("dashboard.health")}</div>
          <Activity className="size-4 text-[var(--fp-color-muted-foreground)]" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <strong className="card-value-xl">{healthScore}</strong>
          <span className="text-xs text-[var(--fp-color-muted-foreground)]">/ 100</span>
          <Badge>{t("dashboard.healthGood")}</Badge>
        </div>
        <ProgressBar className="mt-4" value={healthScore} size="sm" variant="success" />
      </Card>

      {/* Financial independence card */}
      <Card className="min-h-[84px] min-w-0 p-4">
        <div className="label-caps">{t("dashboard.independence")}</div>
        <div className="mt-2 card-value-xl text-[var(--fp-color-coral)]">{independenceYear}</div>
        <div className="text-xs font-semibold text-[var(--fp-color-muted-foreground)]">{independenceLabel}</div>
      </Card>

      {/* Model completeness card */}
      <Card className="min-h-[84px] min-w-0 p-4 ring-1 ring-[var(--fp-color-teal)]/12">
        <div className="flex items-center justify-between">
          <div className="label-caps flex items-center gap-2 !text-[var(--fp-color-teal)]">
            <CheckCircle2 className="size-4" />
            {t("dashboard.modelCompleteness")}
          </div>
          <Badge className="text-sm">100%</Badge>
        </div>
        <ProgressBar className="mt-8" value={100} size="sm" variant="success" />
      </Card>

      {/* Reachable goals & scenario status */}
      <Card className="min-h-[84px] min-w-0 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--fp-color-muted-foreground)]">
          <BadgeCheck className="size-4 text-[var(--fp-color-teal)]" />
          {t("dashboard.reachableGoals", { count: plan.goals.filter((goal) => goal.reachable).length })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--fp-color-muted-foreground)]">
          <TrendingUp className="size-4" />
          {plan.activeScenario === "whatif" ? t("dashboard.customScenarioActive") : t("dashboard.baseScenarioActive")}
        </div>
      </Card>
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid max-w-[1122px] grid-cols-4 gap-2.5 max-[1120px]:grid-cols-2 max-[760px]:grid-cols-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="h-44 animate-pulse bg-[var(--fp-color-muted)]/60" />
      ))}
    </section>
  );
}
