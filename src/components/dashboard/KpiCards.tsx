import { Activity, BadgeCheck, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { usePlanQuery } from "@/api/planQueries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  const monthlyDelta = snapshot?.monthlyDeltaRub ?? monthlyRequired - forecast[2].savings * 14;
  const pensionCapital = snapshot?.pensionCapitalRub ?? retirementPoint.capital * 100;
  const healthScore = snapshot?.healthScore ?? 74;
  const recommendationYear = snapshot?.recommendationYear ?? lastPoint.year;
  const independenceYear = snapshot?.independenceYear ?? lastPoint.year;
  const retirementLabel =
    snapshot?.retirementLabel ?? `к ${plan.settings.retirementAge} г. · ${plan.settings.retirementAge - plan.settings.currentAge} л.`;
  const independenceLabel = snapshot?.independenceLabel ?? `через ${lastPoint.year - new Date().getFullYear()} лет`;

  return (
    <section className="grid max-w-[1122px] grid-cols-4 gap-2.5 max-[1120px]:grid-cols-2 max-[760px]:grid-cols-1">
      <Card className="min-h-44 p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-label">
          <span className="grid size-5 place-items-center rounded-full bg-foreground/5">
            <Sparkles className="size-3" />
          </span>
          {t("dashboard.recommendation")}
        </div>
        <p className="mt-4 px-6 text-sm font-bold leading-relaxed">
          {t("dashboard.recommendationText", { year: recommendationYear })}
        </p>
      </Card>
      <Card className="min-h-44 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-label">{t("dashboard.needToSave")}</div>
        <div className="mt-2 text-[22px] font-bold leading-none">
          {formatRub(monthlyRequired)}
          <span className="ml-1 text-xs text-muted-foreground">{t("dashboard.perMonth")}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>{formatRub(annualTarget, { compact: true })}{t("dashboard.perYear")}</span>
          <Badge variant="danger">{formatRub(monthlyDelta)}</Badge>
        </div>
        <div className="mt-2 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.slice(0, 9)}>
              <Area type="monotone" dataKey="savings" stroke="#ff5c5c" strokeWidth={1.5} fill="#ff5c5c" fillOpacity={0.14} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid gap-2.5">
        <Card className="min-h-[82px] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-label">{t("dashboard.pensionCapital")}</div>
          <div className="mt-2 font-bold">{formatRub(pensionCapital, { compact: true })}</div>
          <div className="text-xs font-semibold text-muted-foreground">{retirementLabel}</div>
        </Card>
        <Card className="min-h-[82px] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-label">{t("dashboard.independence")}</div>
          <div className="mt-2 font-bold">{independenceYear}</div>
          <div className="text-xs font-semibold text-muted-foreground">{independenceLabel}</div>
        </Card>
      </div>
      <Card className="min-h-44 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-label">{t("dashboard.health")}</div>
          <Activity className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <strong className="text-xl">{healthScore}</strong>
          <span className="text-xs text-muted-foreground">/ 100</span>
          <Badge>{t("dashboard.healthGood")}</Badge>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#d7c27d]" style={{ width: `${healthScore}%` }} />
        </div>
        <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <BadgeCheck className="size-4 text-emerald-600" />
          {t("dashboard.reachableGoals", { count: plan.goals.filter((goal) => goal.reachable).length })}
        </div>
      </Card>
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid max-w-[1122px] grid-cols-4 gap-2.5 max-[1120px]:grid-cols-2 max-[760px]:grid-cols-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="h-44 animate-pulse bg-muted/60" />
      ))}
    </section>
  );
}
