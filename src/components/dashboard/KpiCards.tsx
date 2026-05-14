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
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 mb-6 items-stretch">
      {/* Рекомендация */}
      <Card className="p-5 border-[var(--fp-color-teal)]/30 bg-[var(--fp-color-teal)]/5 flex flex-col justify-start">
        <div className="label-caps flex items-center gap-2 mb-4 text-[var(--fp-color-teal)]">
          <div className="size-7 rounded-full bg-[var(--fp-color-teal)]/20 flex items-center justify-center">
            <Sparkles className="size-3.5 text-[var(--fp-color-teal)]" />
          </div>
          РЕКОМЕНДАЦИЯ
        </div>
        <p className="text-[14.5px] font-medium leading-relaxed text-[var(--fp-color-foreground)]">
          При текущих показателях финансовая независимость достижима к <span className="font-bold">{snapshot?.independenceYear || 2076}</span> году. Отличный темп накоплений!
        </p>
      </Card>

      {/* Нужно откладывать & Хватает на */}
      <Card className="flex flex-col overflow-hidden border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
        <div className="p-5 pb-4 flex-1">
          <div className="label-caps flex items-center gap-1 mb-2.5 text-[var(--fp-color-muted-foreground)]">
            НУЖНО ОТКЛАДЫВАТЬ <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold">?</span>
          </div>
          <div className="text-[26px] font-bold tracking-tight flex items-baseline gap-1 text-[var(--fp-color-foreground)] leading-none">
            {formatRub(monthlyRequired, { compact: false }).replace('₽', '').trim()}
            <span className="text-[14px] font-medium text-[var(--fp-color-muted-foreground)]">₽/мес</span>
          </div>
          <div className="text-[13px] font-medium text-[var(--fp-color-muted-foreground)] mt-2">
            {formatRub(annualTarget, { compact: true })}/год
          </div>
        </div>
        <div className="border-t border-[var(--fp-color-border)] p-4 bg-[var(--fp-color-surface-hover)]">
          <div className="label-caps flex items-center gap-1 mb-1.5 text-[var(--fp-color-muted-foreground)]">
            КАПИТАЛА ХВАТАЕТ НА:
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[var(--fp-color-coral)]">{spendDownYears > 50 ? "100+ лет" : `${spendDownYears} лет`}</span>
            <span className="text-[11px] font-medium text-[var(--fp-color-muted-foreground)] leading-tight">
              после пенсии в {plan.settings.retirementAge} лет
            </span>
          </div>
        </div>
      </Card>

      {/* Выполнимость целей */}
      <Card className="p-5 flex flex-col justify-between border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
        <div>
          <div className="label-caps flex items-center gap-1 mb-4 text-[var(--fp-color-muted-foreground)]">
            ВЫПОЛНИМОСТЬ ЦЕЛЕЙ <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold">?</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-[28px] font-bold text-[var(--fp-color-foreground)] leading-none">
              {goalsFeasibility} <span className="text-[15px] text-[var(--fp-color-muted-foreground)]">/ 100</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${goalsFeasibility >= 80 ? 'bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]' : goalsFeasibility >= 50 ? 'bg-[var(--fp-color-accent-gold)]/10 text-[var(--fp-color-accent-gold)]' : 'bg-[var(--fp-color-coral)]/10 text-[var(--fp-color-coral)]'}`}>
              {goalsFeasibility >= 80 ? "Отлично" : goalsFeasibility >= 50 ? "Нормально" : "Плохо"}
            </span>
          </div>
        </div>
        <ProgressBar value={goalsFeasibility} size="md" variant={goalsFeasibility >= 80 ? "success" : goalsFeasibility >= 50 ? "warning" : "danger"} className="h-1.5 rounded-full" />
      </Card>

      {/* Заполненность модели */}
      <Card className="p-5 flex flex-col justify-between border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
        <div>
          <div className="label-caps flex items-center gap-2 mb-4 text-[var(--fp-color-muted-foreground)]">
            <CheckCircle2 className="size-4" /> ЗАПОЛНЕННОСТЬ МОДЕЛИ
          </div>
          <div className="text-[28px] font-bold text-[var(--fp-color-foreground)] leading-none mb-6">
            100%
          </div>
        </div>
        <ProgressBar value={100} size="md" variant="success" className="h-1.5 rounded-full bg-[var(--fp-color-border)]" />
      </Card>
    </section>
  );
}

function KpiSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse bg-[var(--fp-color-muted)]/60 min-h-[180px] border-[var(--fp-color-border)]" />
      ))}
    </section>
  );
}
