import { Sparkles, CheckCircle2 } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatRub } from "@/lib/utils";

export function KpiCards() {
  const { data: plan } = usePlanQuery();
  if (!plan) return <KpiSkeleton />;

  const forecast = plan.forecast;
  const snapshot = plan.dashboardSnapshot;
  
  const monthlyRequired = snapshot?.monthlyTargetRub ?? 787319;
  const annualTarget = snapshot?.annualTargetRub ?? 9400000;
  
  const reachableGoals = plan.goals.filter(g => g.reachable).length;
  const totalGoals = plan.goals.length;
  const goalsFeasibility = totalGoals > 0 ? Math.round((reachableGoals / totalGoals) * 100) : 0;
  
  const retirementPoint = forecast.find((point) => point.age >= plan.settings.retirementAge) ?? forecast.at(-1)!;
  const annualSpend = plan.settings.targetMonthlySpend * 12;
  const spendDownYears = Math.max(0, Math.floor(retirementPoint.capital / Math.max(annualSpend, 1)));

  return (
    <section className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 mb-2 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
      {/* Рекомендация */}
      <Card className="p-5 border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5 row-span-2 flex flex-col justify-center min-h-[160px]">
        <div className="label-caps flex items-center gap-2 mb-3 text-[var(--fp-color-muted-foreground)]">
          <div className="size-6 rounded-full bg-[var(--fp-color-muted)] flex items-center justify-center">
            <Sparkles className="size-3 text-[var(--fp-color-foreground)]" />
          </div>
          РЕКОМЕНДАЦИЯ
        </div>
        <p className="text-[15px] font-medium leading-relaxed max-w-[280px]">
          При текущих показателях финансовая независимость достижима к {snapshot?.independenceYear || 2076} году. Отличный темп накоплений!
        </p>
      </Card>

      {/* Нужно откладывать */}
      <Card className="p-4 flex flex-col justify-center min-h-[84px]">
        <div className="label-caps flex items-center gap-1 mb-2 text-[var(--fp-color-muted-foreground)]">
          НУЖНО ОТКЛАДЫВАТЬ <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-muted-foreground)] text-[9px] font-bold">?</span>
        </div>
        <div className="text-[22px] font-bold tracking-tight mb-0.5 flex items-baseline gap-1">
          {formatRub(monthlyRequired, { compact: false }).replace('₽', '')}
          <span className="text-[13px] font-medium text-[var(--fp-color-foreground)]">₽/мес</span>
        </div>
        <div className="text-xs font-medium text-[var(--fp-color-muted-foreground)]">
          {formatRub(annualTarget, { compact: true })}/год
        </div>
      </Card>

      {/* Выполнимость целей */}
      <Card className="p-4 flex flex-col justify-center min-h-[84px]">
        <div className="label-caps flex items-center gap-1 mb-2 text-[var(--fp-color-muted-foreground)]">
          ВЫПОЛНИМОСТЬ ЦЕЛЕЙ <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-muted-foreground)] text-[9px] font-bold">?</span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <div className="text-[22px] font-bold flex items-baseline gap-1">
            {goalsFeasibility} <span className="text-[13px] text-[var(--fp-color-muted-foreground)] font-medium">/ 100</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--fp-color-muted)] ${goalsFeasibility >= 80 ? 'text-[var(--fp-color-foreground)]' : goalsFeasibility >= 50 ? 'text-[var(--fp-color-orange)]' : 'text-[var(--fp-color-foreground)]'}`}>
              {goalsFeasibility >= 80 ? "Отлично" : goalsFeasibility >= 50 ? "Нормально" : "Плохо"}
            </span>
          </div>
        </div>
        <ProgressBar value={goalsFeasibility} size="sm" variant={goalsFeasibility >= 80 ? "success" : goalsFeasibility >= 50 ? "warning" : "danger"} className="h-1" />
      </Card>

      {/* Капитала хватает на */}
      <Card className="p-4 flex flex-col justify-center min-h-[84px]">
        <div className="label-caps flex items-center gap-1 mb-2 text-[var(--fp-color-muted-foreground)]">
          КАПИТАЛА ХВАТАЕТ НА: <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-muted-foreground)] text-[9px] font-bold">?</span>
        </div>
        <div className="text-[22px] font-bold text-[var(--fp-color-coral)] mb-0.5">
          {spendDownYears > 50 ? "100+ лет" : `${spendDownYears} лет`}
        </div>
        <div className="text-xs font-medium text-[var(--fp-color-foreground)] leading-tight">
          после выхода на пенсию в {plan.settings.retirementAge} лет
        </div>
      </Card>

      {/* Заполненность модели */}
      <Card className="p-4 flex flex-col justify-center min-h-[84px]">
        <div className="label-caps flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--fp-color-teal)]">
            <CheckCircle2 className="size-4" /> ЗАПОЛНЕННОСТЬ МОДЕЛИ
          </div>
          <span className="font-bold text-[var(--fp-color-teal)] bg-[var(--fp-color-teal)]/10 px-2 py-0.5 rounded-full text-xs">100%</span>
        </div>
        <ProgressBar value={100} size="sm" variant="success" className="h-1" />
      </Card>
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 mb-2 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className={`animate-pulse bg-[var(--fp-color-muted)]/60 ${index === 0 ? "row-span-2 min-h-[160px]" : "min-h-[84px]"}`} />
      ))}
    </section>
  );
}
