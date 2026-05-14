import { CheckCircle2, ChevronDown, GripVertical, Target, TriangleAlert } from "lucide-react";
import type { Goal } from "@/types/finance";
import { formatRub } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import * as Icons from "lucide-react";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

export function GoalCard({
  item,
  onClick,
  compact,
}: {
  item: Goal;
  onClick: () => void;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const Icon = iconMap[item.icon] ?? Target;
  
  const displayCost = item.projectedCost ?? item.cost;
  const displaySaved = item.projectedSaved ?? item.saved;
  const progress = item.projectedProgressPct ?? Math.min(100, Math.round((displaySaved / displayCost) * 100));

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-[var(--fp-color-card)] px-4 transition-all hover:border-[var(--fp-color-border-hover)] hover:shadow-[var(--fp-shadow-card)]",
        item.reachable ? "border-[var(--fp-color-border)]" : "border-red-500/30",
        compact ? "py-2" : "py-4"
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <GripVertical className="size-4 shrink-0 text-[var(--fp-color-border)]" />

      {/* Icon */}
      <div className={cn(
        "grid shrink-0 place-items-center rounded-[14px]",
        compact ? "size-7" : "size-10",
        item.reachable ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-500"
      )}>
        <Icon className={cn(compact ? "size-3.5" : "size-5")} />
      </div>

      {/* Center: Name, Target Year, Progress */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={cn("truncate font-semibold text-[var(--fp-color-foreground)]", compact ? "text-xs" : "text-[15px]")}>{item.name}</div>
          {!compact && (
            item.reachable ? (
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            ) : (
              <TriangleAlert className="size-3.5 text-red-500 shrink-0" />
            )
          )}
        </div>
        
        {!compact && (
          <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--fp-color-muted-foreground)]">
            <span>{t("goals.targetYear")}: {item.targetYear}</span>
            <span>{progress}%</span>
          </div>
        )}
        
        {!compact && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--fp-color-muted)]">
            <div 
              className={cn("h-full rounded-full", item.reachable ? "bg-emerald-500" : "bg-red-500")}
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      {/* Right: Amounts */}
      <div className="shrink-0 text-right pl-2">
        <div className={cn("font-semibold text-[var(--fp-color-foreground)]", compact ? "text-xs" : "text-[15px]")}>
          {formatRub(item.cost, { compact: true })}
        </div>
        {!compact && (
          <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)]">
            {formatRub(displaySaved, { compact: true })} {t("goals.saved").toLowerCase()}
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronDown className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)] transition-transform group-hover:translate-y-0.5" />
    </div>
  );
}
