import { Edit2, Lock, Target, GripVertical, TrendingUp } from "lucide-react";
import type { Goal } from "@/types/finance";
import { formatRub } from "@/lib/utils";

interface GoalListItemProps {
  goal: Goal;
  isAccumulation?: boolean;
  isQueue?: boolean;
  onClick: () => void;
}

export function GoalListItem({ goal, isAccumulation, isQueue, onClick }: GoalListItemProps) {
  const progress = Math.min(100, Math.round((goal.saved / goal.cost) * 100));
  const isPeriodic = goal.type === "periodic";

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 border-b border-[var(--fp-color-border)] bg-transparent py-3 transition-colors hover:bg-[var(--fp-color-surface-hover)]"
    >
      <GripVertical className="size-4 text-[var(--fp-color-muted-foreground)] opacity-50" />
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--fp-color-surface)] border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)]">
         {isQueue ? <Lock className="size-3.5" /> : <Target className="size-3.5" />}
      </div>
      
      <div className="flex flex-col min-w-[200px] flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-[var(--fp-color-foreground)]">{goal.name}</h3>
          {isAccumulation && (
            <span className="rounded bg-[var(--fp-color-accent-gold-soft)] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[var(--fp-color-accent-gold-text)]">НАКОПЛЕНИЕ</span>
          )}
          {isQueue && (
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-sky-600">ОЧЕРЕДЬ</span>
          )}
        </div>
        <div className="text-xs text-[var(--fp-color-muted-foreground)]">
          {isPeriodic ? "Периодическая" : "Разовая"} • {goal.targetYear} г.
        </div>
      </div>

      <div className="flex w-[40%] min-w-[250px] max-w-[400px] items-center gap-4">
         <span className="font-semibold text-sm text-[var(--fp-color-foreground)] whitespace-nowrap">{formatRub(goal.cost)}</span>
         <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--fp-color-background)] border border-[var(--fp-color-border)]">
           <div className="h-full bg-[var(--fp-color-foreground)] transition-all" style={{ width: `${progress}%` }} />
         </div>
         <span className="text-xs font-medium text-[var(--fp-color-muted-foreground)] w-8 text-right">
           {progress > 0 ? `${progress}%` : "—"}
         </span>
      </div>

      <div className="flex w-[120px] items-center justify-end gap-3 text-xs font-medium text-[var(--fp-color-foreground)]">
         <span className="w-10">{goal.targetYear}</span>
         <span className="flex w-14 items-center gap-1 text-[var(--fp-color-muted-foreground)]">
           {goal.growth > 0 ? (
             <>
               <TrendingUp className="size-3" />
               +{Math.round(goal.growth * 100)}%
             </>
           ) : (
             <span className="w-full text-center">—</span>
           )}
         </span>
      </div>

      <button className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--fp-color-background)] hover:text-[var(--fp-color-foreground)]">
        <Edit2 className="size-4" />
      </button>
    </div>
  );
}
