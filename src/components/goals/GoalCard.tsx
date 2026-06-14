import { CheckCircle2, ChevronDown, GripVertical, Target, TriangleAlert } from "lucide-react";
import type { Goal } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useFormat } from "@/lib/useFormat";
import { useI18n } from "@/i18n/I18nProvider";
import { goalProgress } from "@/components/goals/goalProgress";
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
  const { formatRub } = useFormat();
  const Icon = iconMap[item.icon] ?? Target;
  
  const progress = goalProgress(item);

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-[var(--fp-color-card)] px-4 transition-all hover:border-[var(--fp-color-border-hover)] hover:shadow-[var(--fp-shadow-card)]",
        item.reachable ? "border-[var(--fp-color-border)]" : "border-[var(--fp-color-coral)]/30",
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
        item.reachable ? "border border-[var(--fp-color-teal)]/20 bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]" : "border border-[var(--fp-color-coral)]/20 bg-[var(--fp-color-coral)]/10 text-[var(--fp-color-coral)]"
      )}>
        <Icon className={cn(compact ? "size-3.5" : "size-5")} />
      </div>

      {/* Center: Name, Target Year, Progress */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={cn("truncate font-semibold text-[var(--fp-color-foreground)]", compact ? "text-xs" : "text-[15px]")}>{item.name}</div>
          {!compact && (
            item.reachable ? (
              <CheckCircle2 className="size-3.5 text-[var(--fp-color-teal)] shrink-0" />
            ) : (
              <TriangleAlert className="size-3.5 text-[var(--fp-color-coral)] shrink-0" />
            )
          )}
        </div>
        
        {!compact && (
          <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--fp-color-muted-foreground)]">
            <span>{t("goals.targetYear")}: {item.targetYear}</span>
            <span>{progress.percent}%</span>
          </div>
        )}
        
        {!compact && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--fp-color-muted)]">
            <div 
              className={cn("h-full rounded-full", progress.achieved || item.reachable ? "bg-[var(--fp-color-teal)]" : "bg-[var(--fp-color-coral)]")}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Right: Amounts */}
      <div className="shrink-0 text-right pl-2">
        <div className={cn("font-semibold text-[var(--fp-color-foreground)] num", compact ? "text-xs" : "text-[15px]")}>
          {formatRub(item.cost, { compact: true })}
        </div>
        {!compact && (
          <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)] num">
            {formatRub(progress.saved, { compact: true })} {t("goals.saved").toLowerCase()}
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronDown className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)] transition-transform group-hover:translate-y-0.5" />
    </div>
  );
}
