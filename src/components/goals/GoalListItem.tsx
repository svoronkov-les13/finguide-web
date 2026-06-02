import { CheckCircle2, Edit2, Target, GripVertical, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import type { Goal } from "@/types/finance";
import { formatRub } from "@/lib/utils";
import { goalProgress } from "@/components/goals/goalProgress";
import { useI18n } from "@/i18n/I18nProvider";

import { cn } from "@/lib/utils";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

interface GoalListItemProps {
  goal: Goal;
  isAccumulation?: boolean;
  isQueue?: boolean;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export function GoalListItem({
  goal,
  isAccumulation,
  isQueue,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  isDragOver,
}: GoalListItemProps) {
  const { t } = useI18n();
  const progress = goalProgress(goal);
  const isPeriodic = goal.type === "periodic";
  const month = goal.targetMonth ?? 12;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group flex cursor-pointer items-center gap-4 border-b border-[var(--fp-color-border)] bg-transparent py-3 transition-all",
        isDragging ? "opacity-35 bg-[var(--fp-color-surface-hover)] scale-[0.98]" : "hover:bg-[var(--fp-color-surface-hover)]",
        isDragOver ? "border-t-2 border-t-[var(--fp-color-primary)] bg-[var(--fp-color-surface)]/50 pl-2 shadow-sm" : ""
      )}
    >
      <GripVertical className="size-4 text-[var(--fp-color-muted-foreground)] opacity-50" />
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--fp-color-surface)] border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)]">
         {(() => {
           const GoalIcon = iconMap[goal.icon];
           return GoalIcon ? <GoalIcon className="size-3.5" /> : <Target className="size-3.5" />;
         })()}
      </div>
      
      <div className="flex flex-col min-w-[200px] flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate transition-colors duration-200 text-[var(--text-heading)]" style={{ fontSize: "13px", fontWeight: 500 }}>{goal.name}</h3>
          {progress.achieved && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600"><CheckCircle2 className="size-3" />{t("goals.achieved")}</span>
          )}
          {!progress.achieved && isAccumulation && (
            <span className="rounded bg-[var(--fp-color-accent-gold-soft)] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[var(--fp-color-accent-gold-text)]">{t("goals.accumulationLabel")}</span>
          )}
          {isQueue && (
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-sky-600">{t("goals.queueLabel")}</span>
          )}
        </div>
        <div className="text-xs text-[var(--fp-color-muted-foreground)]">
          {isPeriodic ? t("goals.typePeriodic") : t("goals.typeOnetime")} • {t(`goals.monthShort.${month}` as Parameters<typeof t>[0])} {goal.targetYear} г.
        </div>
      </div>

      <div className="flex w-[40%] min-w-[250px] max-w-[400px] items-center gap-4">
         <span className="font-semibold text-sm text-[var(--fp-color-foreground)] whitespace-nowrap num">{formatRub(progress.cost)}</span>
         <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--fp-color-background)] border border-[var(--fp-color-border)]">
           <div className={`h-full transition-all ${progress.achieved ? "bg-emerald-500" : "bg-[var(--fp-color-foreground)]"}`} style={{ width: `${progress.percent}%` }} />
         </div>
         <span className="text-xs font-medium text-[var(--fp-color-muted-foreground)] w-8 text-right num">
           {progress.percent > 0 ? `${progress.percent}%` : "—"}
         </span>
      </div>

      <div className="flex w-[120px] items-center justify-end gap-3 text-xs font-medium text-[var(--fp-color-foreground)] num">
         <span className="w-14">{t(`goals.monthShort.${month}` as Parameters<typeof t>[0])} {goal.targetYear}</span>
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
