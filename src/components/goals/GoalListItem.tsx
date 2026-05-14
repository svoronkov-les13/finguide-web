import { Edit2, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import type { Goal } from "@/types/finance";
import { formatRub } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

interface GoalListItemProps {
  goal: Goal;
  onClick: () => void;
}

export function GoalListItem({ goal, onClick }: GoalListItemProps) {
  const { t } = useI18n();
  const progress = Math.min(100, Math.round((goal.saved / goal.cost) * 100));
  const isPeriodic = goal.type === "periodic";

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4 transition-colors hover:border-[var(--fp-color-border-strong)] hover:bg-[var(--fp-color-surface-hover)]"
    >
      <div className="flex w-[30%] min-w-[200px] items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--fp-color-accent-gold-soft)] text-[var(--fp-color-accent-gold-text)]">
          <Target className="size-5" />
        </div>
        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="truncate font-bold text-[var(--fp-color-foreground)]">{goal.name}</h3>
          <div className="flex items-center gap-2 text-xs">
            {goal.reachable ? (
              <span className="flex items-center gap-1 text-[var(--fp-color-teal)]">
                <CheckCircle2 className="size-3" />
                {t("goals.reachable")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--fp-color-danger)]">
                <AlertTriangle className="size-3" />
                {t("goals.unreachable")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-[30%] min-w-[200px] flex-col gap-1.5 pr-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-bold text-[var(--fp-color-foreground)]">{formatRub(goal.cost)}</span>
          <span className="text-xs font-medium text-[var(--fp-color-muted-foreground)]">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--fp-color-background)] shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-[var(--fp-duration-normal)]"
            style={{ 
              width: `${progress}%`,
              backgroundColor: goal.reachable ? "var(--fp-color-teal)" : "var(--fp-color-danger)"
            }}
          />
        </div>
      </div>

      <div className="flex w-[20%] min-w-[120px] items-center">
        <span className="rounded-full bg-[var(--fp-color-background)] px-3 py-1 text-xs font-medium text-[var(--fp-color-foreground)] border border-[var(--fp-color-border)]">
          {isPeriodic ? t("goals.typePeriodic") : t("goals.typeOnetime")}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-between">
        <span className="font-medium text-[var(--fp-color-foreground)]">{goal.targetYear}</span>
        <button className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--fp-color-background)] hover:text-[var(--fp-color-foreground)]">
          <Edit2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
