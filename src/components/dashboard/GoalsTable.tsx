import * as Icons from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

export function GoalsTable() {
  const { data: plan } = usePlanQuery();
  const goals = plan?.goals ?? [];
  const total = goals.reduce((sum, goal) => sum + goal.cost, 0);
  const reachable = goals.filter((goal) => goal.reachable).length;

  return (
    <section className="max-w-[1122px]">
      <div className="mb-2 flex items-center justify-between gap-4 max-[760px]:block">
        <h2 className="section-title text-[var(--fp-text-md)]">Достижимость целей</h2>
        <div className="flex items-center gap-4 text-xs text-[var(--fp-color-muted-foreground)] max-[760px]:mt-2">
          <span>● Итого: {formatRub(total, { compact: true })}</span>
          <span>
            <span className="text-[var(--fp-color-teal)]">● {reachable} достижимы</span>
            <span className="ml-2 text-[var(--fp-color-coral)]">● 0 под угрозой</span>
          </span>
          <span>{reachable} из {goals.length} достижимы</span>
          <button className="font-bold text-[var(--fp-color-accent-gold)]" type="button">Управление →</button>
        </div>
      </div>
      <Card className="scrollbar-thin overflow-x-auto border-none shadow-none mt-2">
        <div className="min-w-[900px]">
          <div className="table-header grid grid-cols-[1.5fr_1.8fr_120px_140px_160px_120px] gap-4 border-b border-[var(--fp-color-border)] px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fp-color-muted-foreground)]">
            <span>Цель</span><span><span className="text-[var(--fp-color-foreground)]"><Icons.Globe className="inline size-3 mr-1" />Итого: {formatRub(total, { compact: true })}</span> <span className="text-[var(--fp-color-teal)] ml-2">● {reachable}</span> <span className="text-[var(--fp-color-coral)]">● 0</span></span><span className="text-center">Год</span><span className="text-right">Стоимость</span><span>Накоплено</span><span className="text-right">Статус</span>
          </div>
          {goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)}
        </div>
      </Card>
    </section>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const Icon = iconMap[goal.icon] ?? Icons.Target;
  const progress = Math.min(100, Math.round((goal.saved / Math.max(goal.cost, 1)) * 100));
  return (
    <div className="grid grid-cols-[1.5fr_1.8fr_120px_140px_160px_120px] items-center gap-4 border-b border-[var(--fp-color-teal)]/15 px-2 py-4 text-sm last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5 font-semibold">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--fp-color-teal)]/35 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate">{goal.name}</span>
      </div>
      <div className="min-w-0 pr-4 flex flex-col justify-center">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-semibold text-[13px]">{formatRub(goal.saved, { compact: false })} <span className="text-[10px] text-[var(--fp-color-muted-foreground)] font-normal">/ {formatRub(goal.cost, { compact: true })}</span></span>
          <span className="text-[10px] text-[var(--fp-color-muted-foreground)] font-medium">{progress}%</span>
        </div>
        <ProgressBar value={progress} size="sm" variant={progress > 0 ? "success" : "default"} className="h-1.5" />
      </div>
      <div className="text-center text-[var(--fp-color-muted-foreground)]">
        <div className="font-semibold text-[13px] text-[var(--fp-color-foreground)]">{goal.targetYear}</div>
        <div className="text-[10px]">через {goal.targetYear - 2026} год</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[13px]">{formatRub(goal.cost, { compact: true })}</div>
        <div className="text-[10px] text-[var(--fp-color-muted-foreground)]">+{Math.round(goal.growth * 100)}%/год</div>
      </div>
      <div className="font-semibold text-[13px]">
        {formatRub(goal.saved, { compact: false })}
      </div>
      <div className="flex justify-end"><Badge variant={goal.reachable ? "success" : "danger"} className="bg-transparent border-none text-[var(--fp-color-teal)] shadow-none px-0 gap-1 font-medium"><Icons.CheckCircle2 className="size-3.5" />{goal.reachable ? "Достижима" : "Риск"}</Badge></div>
    </div>
  );
}
