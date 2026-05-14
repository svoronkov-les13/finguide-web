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
            <span className="text-[var(--fp-color-teal)]">● {reachable}</span> достижимы
            <span className="ml-2 text-[var(--fp-color-coral)]">● 0</span> под угрозой
          </span>
          <span>{reachable} из {goals.length} достижимы</span>
          <button className="font-bold text-[var(--fp-color-accent-gold)]" type="button">Управление →</button>
        </div>
      </div>
      <Card className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="table-header grid grid-cols-[1.45fr_90px_150px_180px_130px] gap-3 border-b border-[var(--fp-color-border)] px-5 py-3 text-[var(--fp-color-label)]">
            <span>Цель</span><span className="text-right">Год</span><span className="text-right">Стоимость</span><span>Накоплено</span><span className="text-right">Статус</span>
          </div>
          {goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)}
          <div className="flex justify-between border-t border-[var(--fp-color-border)] px-5 py-3 text-xs text-[var(--fp-color-muted-foreground)]">
            <span>Итого: {formatRub(total, { compact: true })}</span>
            <span>
              <b className="text-[var(--fp-color-teal)]">{goals.filter((goal) => goal.reachable).length}</b> достижимы · <b className="text-[var(--fp-color-coral)]">0</b> рисков
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const Icon = iconMap[goal.icon] ?? Icons.Target;
  const progress = Math.min(100, Math.round((goal.saved / Math.max(goal.cost, 1)) * 100));
  return (
    <div className="grid grid-cols-[1.45fr_90px_150px_180px_130px] items-center gap-3 border-b border-[var(--fp-color-teal)]/25 px-5 py-3 text-xs last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5 font-semibold">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--fp-color-teal)]/35 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate">{goal.name}</span>
      </div>
      <div className="text-right text-[var(--fp-color-muted-foreground)]">
        <div className="font-semibold text-[var(--fp-color-foreground)]/75">{goal.targetYear}</div>
        <div className="text-[10px]">через {goal.targetYear - 2026} л.</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatRub(goal.cost, { compact: true })}</div>
        <div className="text-[10px] text-[var(--fp-color-muted-foreground)]">+{Math.round(goal.growth * 100)}%/год</div>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">{formatRub(goal.saved, { compact: true })}</span>
          <span className="progress-nums text-[var(--fp-color-muted-foreground)]">{progress}%</span>
        </div>
        <ProgressBar className="mt-1.5" value={progress} size="sm" variant="success" />
      </div>
      <div className="flex justify-end"><Badge variant={goal.reachable ? "success" : "danger"}>{goal.reachable ? "Достижима" : "Риск"}</Badge></div>
    </div>
  );
}
