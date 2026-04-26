import * as Icons from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

export function GoalsTable() {
  const { data: plan } = usePlanQuery();
  const goals = plan?.goals ?? [];
  const total = goals.reduce((sum, goal) => sum + goal.cost, 0);

  return (
    <section className="max-w-[1122px]">
      <div className="mb-2 flex items-center justify-between gap-4 max-[760px]:block">
        <h2 className="section-title text-[15px]">Достижимость целей</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground max-[760px]:mt-2">
          <span>старт: 2,5 млн ₽</span>
          <span>{goals.filter((goal) => goal.reachable).length} из {goals.length} достижимы</span>
          <button className="font-bold text-primary/80" type="button">Управление →</button>
        </div>
      </div>
      <Card className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1fr_90px_150px_130px_120px] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-label">
            <span>Цель</span><span className="text-right">Год</span><span className="text-right">Стоимость</span><span className="text-right">Накоплено</span><span className="text-right">Статус</span>
          </div>
          {goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)}
          <div className="flex justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>Итого: {formatRub(total, { compact: true })}</span>
            <span><b className="text-emerald-600">{goals.filter((goal) => goal.reachable).length}</b> достижимы · <b className="text-rose-600">0</b> рисков</span>
          </div>
        </div>
      </Card>
    </section>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const Icon = iconMap[goal.icon] ?? Icons.Target;
  return (
    <div className="grid grid-cols-[1fr_90px_150px_130px_120px] items-center gap-3 border-b border-border/60 px-5 py-3 text-xs last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5 font-semibold">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate">{goal.name}</span>
      </div>
      <div className="text-right text-muted-foreground">
        <div className="font-semibold text-foreground/75">{goal.targetYear}</div>
        <div className="text-[10px]">через {goal.targetYear - 2026} л.</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatRub(goal.cost, { compact: true })}</div>
        <div className="text-[10px] text-muted-foreground">+{Math.round(goal.growth * 100)}%/год</div>
      </div>
      <div className="text-right text-muted-foreground">{formatRub(goal.saved, { compact: true })}</div>
      <div className="flex justify-end"><Badge variant="success">Достижима</Badge></div>
    </div>
  );
}
