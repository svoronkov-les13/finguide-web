import { useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { goalProgress } from "@/components/goals/goalProgress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";
import { useI18n } from "@/i18n/I18nProvider";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

export function GoalsTable() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: plan } = usePlanQuery();
  const goals = plan?.goals ?? [];
  const total = goals.reduce((sum, goal) => sum + goal.cost, 0);
  const reachable = goals.filter((goal) => goal.reachable).length;
  const currentYear = new Date().getFullYear();

  return (
    <Card className="w-full p-5">
      {/* Card Header (aligned with Figma design) */}
      <div className="mb-5 flex items-center justify-between gap-4 max-[760px]:block border-b border-[var(--fp-color-border)] pb-4">
        <div className="flex items-center gap-2">
          <h2 className="section-title text-[var(--fp-text-md)] font-bold">{t("goals.goalReachability")}</h2>
        </div>
        
        {/* Summary badges on the right */}
        <div className="flex items-center gap-4 text-xs text-[var(--fp-color-muted-foreground)] max-[760px]:mt-2">
          <span className="num">● {t("goals.totalLabel")}: <span className="font-semibold text-[var(--fp-color-foreground)]">{formatRub(total, { compact: true })}</span></span>
          <span className="flex items-center gap-2">
            <span className="text-[var(--fp-color-teal)]">● {t("goals.reachableCount", { count: String(reachable) })}</span>
            <span className="text-[var(--fp-color-coral)]">● {t("goals.atRiskCount", { count: "0" })}</span>
          </span>
          <span className="num font-medium text-[var(--fp-color-foreground)] bg-[var(--fp-color-surface)] px-2.5 py-0.5 rounded-full">
            {t("goals.reachableOf", { reachable: String(reachable), total: String(goals.length) })}
          </span>
          <button
            onClick={() => navigate({ to: "/goals" })}
            className="font-bold text-[var(--fp-color-accent-gold)] flex items-center gap-1 hover:underline transition-all"
            type="button"
          >
            {t("goals.manageBtn")}
            <Icons.ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Table container with responsive horizontal scroll */}
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Table Header Row */}
          <div className="table-header grid grid-cols-[1.5fr_1.8fr_120px_140px_160px_120px] gap-4 border-b border-[var(--fp-color-border)] px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fp-color-muted-foreground)]">
            <span>{t("goals.colGoal")}</span>
            <span className="text-[var(--fp-color-foreground)] flex items-center gap-1.5 font-bold">
              <Icons.Target className="size-3.5 text-[var(--fp-color-muted-foreground)]" />
              {t("goals.totalLabel").toUpperCase()}: {formatRub(total, { compact: true })}
              <span className="text-[var(--fp-color-teal)] ml-1">● {reachable}</span>
              <span className="text-[var(--fp-color-coral)]">● 0</span>
            </span>
            <span className="text-center">{t("goals.colYearHeader")}</span>
            <span className="text-right">{t("goals.colCostHeader")}</span>
            <span>{t("goals.colSavedHeader")}</span>
            <span className="text-right">{t("goals.colStatus")}</span>
          </div>

          {/* Goal Rows */}
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} currentYear={currentYear} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function GoalRow({ goal, currentYear }: { goal: Goal; currentYear: number }) {
  const { t } = useI18n();
  const Icon = iconMap[goal.icon] ?? Icons.Target;
  const progress = goalProgress(goal);
  const month = goal.targetMonth ?? 12;
  const statusLabel = progress.achieved
    ? t("goals.statusAchieved")
    : goal.reachable
      ? t("goals.statusReachable")
      : t("goals.statusRisk");
  const yearsLeft = goal.targetYear - currentYear;

  const isReachable = goal.reachable;
  const statusColorClass = isReachable ? "text-[var(--fp-color-teal)]" : "text-[var(--fp-color-coral)]";
  const StatusIcon = isReachable ? Icons.CheckCircle2 : Icons.AlertTriangle;

  return (
    <div className="grid grid-cols-[1.5fr_1.8fr_120px_140px_160px_120px] items-center gap-4 border-b border-[var(--fp-color-border)] px-2 py-4 text-sm last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5 font-semibold">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--fp-color-teal)]/35 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate text-[var(--fp-color-foreground)]">{goal.name}</span>
      </div>
      <div className="min-w-0 pr-4 flex flex-col justify-center">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-semibold text-[13px]">
            {formatRub(progress.saved, { compact: false })}
            <span className="text-[10px] text-[var(--fp-color-muted-foreground)] font-normal"> / {formatRub(progress.cost, { compact: true })}</span>
          </span>
          <span className="text-[10px] text-[var(--fp-color-muted-foreground)] font-medium">{progress.percent}%</span>
        </div>
        <ProgressBar value={progress.percent} size="sm" variant={progress.percent > 0 ? "success" : "default"} className="h-1.5" />
      </div>
      <div className="text-center text-[var(--fp-color-muted-foreground)]">
        <div className="font-semibold text-[13px] text-[var(--fp-color-foreground)]">
          {t(`goals.monthShort.${month}` as Parameters<typeof t>[0])} {goal.targetYear}
        </div>
        <div className="text-[10px]">{t("goals.inYears", { count: String(yearsLeft) })}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[13px] text-[var(--fp-color-foreground)]">{formatRub(goal.cost, { compact: true })}</div>
        <div className="text-[10px] text-[var(--fp-color-muted-foreground)]">{t("goals.perYear", { pct: String(Math.round(goal.growth * 100)) })}</div>
      </div>
      <div className="font-semibold text-[13px] text-[var(--fp-color-foreground)]">
        {formatRub(progress.saved, { compact: false })}
      </div>
      <div className="flex justify-end">
        <Badge variant={isReachable ? "success" : "danger"} className={`bg-transparent border-none ${statusColorClass} shadow-none px-0 gap-1.5 font-semibold text-xs`}>
          <StatusIcon className="size-4" />
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
