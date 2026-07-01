import { useState } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Plus, Target, Download, Search } from "lucide-react";
import { useAddGoalMutation, useDeleteGoalMutation, usePlanQuery, useUpdateGoalMutation, useReorderGoalsMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { GoalsSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/finance";
import { GoalListItem } from "@/components/goals/GoalListItem";
import { GoalEmptyState } from "@/components/goals/GoalEmptyState";
import { GoalModal } from "@/components/goals/GoalModal";
import { useI18n } from "@/i18n/I18nProvider";
import { goalPortfolioSummary, goalProjectedCost, goalYearSummary } from "@/pages/goalsYearSummary";
import { compareGoalTargetOrder, trackingActiveGoal } from "@/pages/trackingGoal";
import { useFormat } from "@/lib/useFormat";

export function GoalsPage() {
  const { t } = useI18n();
  const { formatRub } = useFormat();
  const { data: plan } = usePlanQuery();
  const addGoal = useAddGoalMutation();
  const updateGoal = useUpdateGoalMutation();
  const deleteGoal = useDeleteGoalMutation();
  const reorderGoals = useReorderGoalsMutation();

  const [editingItem, setEditingItem] = useState<Partial<Goal> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "onetime" | "periodic">("all");
  const [sortField, setSortField] = useState<"name" | "cost" | "type" | "year">("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);
  const [dragOverYear, setDragOverYear] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, goalId: string) => {
    setDraggedGoalId(goalId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, goalId: string) => {
    e.preventDefault();
    if (draggedGoalId !== goalId) {
      setDragOverGoalId(goalId);
    }
  };

  const handleDragLeave = () => {
    setDragOverGoalId(null);
  };

  const handleDrop = (e: React.DragEvent, targetGoalId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedGoalId || draggedGoalId === targetGoalId) {
      setDraggedGoalId(null);
      setDragOverGoalId(null);
      setDragOverYear(null);
      return;
    }

    const currentGoals = [...(plan?.goals ?? [])];
    const draggedIdx = currentGoals.findIndex((g) => g.id === draggedGoalId);
    const targetIdx = currentGoals.findIndex((g) => g.id === targetGoalId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const draggedItem = currentGoals[draggedIdx];
      const targetItem = currentGoals[targetIdx];

      if (draggedItem.targetYear !== targetItem.targetYear) {
        updateGoal.mutate({ id: draggedGoalId, patch: { targetYear: targetItem.targetYear } });
        draggedItem.targetYear = targetItem.targetYear;
      }

      const [removed] = currentGoals.splice(draggedIdx, 1);
      currentGoals.splice(targetIdx, 0, removed);

      // Trigger mutation
      reorderGoals.mutate(currentGoals.map((g) => g.id));
    }

    setDraggedGoalId(null);
    setDragOverGoalId(null);
    setDragOverYear(null);
  };

  const handleYearDragOver = (e: React.DragEvent, year: number) => {
    e.preventDefault();
    if (draggedGoalId) {
      const draggedGoal = plan?.goals?.find((g) => g.id === draggedGoalId);
      if (draggedGoal && draggedGoal.targetYear !== year) {
        setDragOverYear(year);
      }
    }
  };

  const handleYearDrop = (e: React.DragEvent, year: number) => {
    e.preventDefault();
    setDragOverYear(null);

    if (!draggedGoalId) return;

    const currentGoals = [...(plan?.goals ?? [])];
    const draggedIdx = currentGoals.findIndex((g) => g.id === draggedGoalId);
    if (draggedIdx === -1) return;

    const draggedItem = currentGoals[draggedIdx];
    if (draggedItem.targetYear === year) return;

    updateGoal.mutate({ id: draggedGoalId, patch: { targetYear: year } });
    draggedItem.targetYear = year;

    const [removed] = currentGoals.splice(draggedIdx, 1);
    const nextYearIndex = currentGoals.findIndex((g) => g.targetYear > year);

    if (nextYearIndex !== -1) {
      currentGoals.splice(nextYearIndex, 0, removed);
    } else {
      currentGoals.push(removed);
    }

    reorderGoals.mutate(currentGoals.map((g) => g.id));

    setDraggedGoalId(null);
    setDragOverGoalId(null);
  };

  if (!plan) return <GoalsSkeleton />;

  const goals = plan.goals ?? [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const monthsInYear = plan.settings.monthsInYear ?? 12;
  const { totalProjectedCost: totalCost, accumulatedPercent } = goalPortfolioSummary(goals);
  
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || goal.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const activeGoal = trackingActiveGoal(goals);

  // Group by year first
  const groupedGoals = filteredGoals.reduce((acc, goal) => {
    const year = goal.targetYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(goal);
    return acc;
  }, {} as Record<number, Goal[]>);

  // Sort years
  const sortedYears = Object.keys(groupedGoals)
    .map(Number)
    .sort((a, b) => sortDirection === "asc" ? a - b : b - a);

  // Sort items within each year
  sortedYears.forEach(year => {
    groupedGoals[year].sort((a, b) => {
      let result = 0;
      if (sortField === "name") result = a.name.localeCompare(b.name);
      if (sortField === "cost") result = a.cost - b.cost;
      if (sortField === "type") result = String(a.type).localeCompare(String(b.type));
      if (sortField === "year") result = compareGoalTargetOrder(a, b);
      return sortDirection === "asc" ? result : -result;
    });
  });
  
  const handleEdit = (goal: Goal) => {
    setEditingItem(goal);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleModalSubmit = (data: Partial<Goal>) => {
    if (data.id) {
      updateGoal.mutate({ id: data.id, patch: data });
    } else {
      addGoal.mutate({
        name: data.name || t("goals.newGoal"),
        icon: data.icon || "Target",
        targetYear: data.targetYear || 2030,
        targetMonth: data.targetMonth ?? 12,
        cost: data.cost || 0,
        saved: data.saved || 0,
        growth: data.growth || 0,
        reachable: data.reachable ?? true,
        type: data.type || "onetime",
      });
    }
    setModalOpen(false);
  };

  return (
    <Page>
      {/* Header */}
      <PageHeader
        back
        title={t("goals.title")}
        actions={
          <>
            <Button variant="secondary" className="max-[760px]:hidden">
              {t("goals.viewExample")}
            </Button>
            <Button variant="default" onClick={handleCreate}>
              <Plus className="size-4 shrink-0" />
              {t("goals.addGoal")}
            </Button>
          </>
        }
      />

      {/* Stats bar */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 py-3 text-sm">
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.totalLabel")}</span>
            <span className="font-bold text-[var(--fp-color-foreground)] text-base">{formatRub(totalCost)}</span>
          </div>
          
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 py-3 text-sm">
            <span className="font-bold text-[var(--fp-color-foreground)] text-base">{accumulatedPercent}%</span>
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.totalAccumulated")}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 py-3 text-sm text-[var(--fp-color-muted-foreground)]">
            <Target className="size-4" />
            {t(goals.length === 1 ? "goals.totalGoalsCountOne" : goals.length < 5 ? "goals.totalGoalsCountFew" : "goals.totalGoalsCount", { count: String(goals.length) })}
          </div>

          {activeGoal && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 py-3 text-sm text-[var(--fp-color-foreground)]">
              <span className="font-semibold text-[var(--fp-color-muted-foreground)] tracking-wide text-xs">{t("goals.activeGoalPrefix")}</span>
              <span className="font-semibold">{activeGoal.name} ({activeGoal.targetYear})</span>
            </div>
          )}

          <Button variant="secondary" className="px-5 py-3 h-auto ml-auto rounded-full font-medium">
            <Download className="size-4 mr-2" />
            {t("goals.export")}
          </Button>
        </div>
      )}

      {/* Active Goal Timeline Block */}
      {goals.length > 0 && activeGoal && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-6">
          <div className="flex items-center gap-4 text-sm">
            {sortedYears.slice(0, 3).map((year, i, arr) => (
              <div key={year} className="flex items-center gap-4">
                <div className="flex flex-col gap-1 text-center">
                  <span className={cn("font-bold", activeGoal.targetYear === year ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-foreground)]")}>
                    {year}
                  </span>
                  <span className="text-xs font-medium text-[var(--fp-color-muted-foreground)]">
                    {t("goals.totalGoalsCount", { count: groupedGoals[year].length })}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-px w-16 bg-[var(--fp-color-border)] relative">
                    <div className="absolute right-0 top-1/2 -mt-[3px] border-[3px] border-transparent border-l-[var(--fp-color-border)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--fp-color-muted-foreground)] flex items-start gap-2 bg-[var(--fp-color-background)] p-3 rounded-lg">
            <span className="mt-0.5 opacity-70">▹</span>
            {t("goals.activeGoalInfo", { name: activeGoal.name, year: activeGoal.targetYear })}
          </p>
        </div>
      )}

      {/* Toolbar */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
            <input
              type="text"
              placeholder={t("goals.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--fp-color-border)] bg-[var(--fp-color-input)] pl-9 pr-4 text-sm text-[var(--fp-color-foreground)] outline-none placeholder:text-[var(--fp-color-text-muted)] transition-all hover:border-[var(--fp-color-border-hover)] focus:border-[var(--fp-color-border-strong)] focus:ring-2 focus:ring-[var(--fp-color-accent-gold)]/20"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-0.5">
            {(["all", "onetime", "periodic"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-md px-3.5 py-1 text-sm font-medium transition-all",
                  activeFilter === filter
                    ? "bg-[var(--fp-color-foreground)] text-[var(--fp-color-card)] shadow-sm"
                    : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t(`goals.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* Sort — pushed right */}
          <div className="ml-auto flex items-center gap-1 text-xs text-[var(--fp-color-muted-foreground)]">
            <span className="mr-1 font-medium">{t("goals.sortPrefix")}</span>
            {(["name", "cost", "type", "year"] as const).map((field) => (
              <button
                key={field}
                onClick={() => {
                  if (sortField === field) {
                    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                  } else {
                    setSortField(field);
                    setSortDirection("asc");
                  }
                }}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-all",
                  sortField === field
                    ? "bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-sm"
                    : "hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t(`goals.sort_${field}`)}
                <span className="text-[10px] opacity-60">
                  {sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "↑↓"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid / List */}
      {goals.length > 0 ? (
        filteredGoals.length > 0 ? (
          <div className="flex flex-col gap-6 mt-4">
            {sortedYears.map((year) => {
              const yearGoals = groupedGoals[year];
              if (!yearGoals || yearGoals.length === 0) return null;

              const isAccumulation = activeGoal?.targetYear === year;
              const isCompleted = yearGoals.every(g => g.saved >= goalProjectedCost(g));
              const yearSummary = goalYearSummary(yearGoals, year, currentYear, currentMonthIdx, monthsInYear);
              const yearTotalSaved = yearGoals.reduce((sum, g) => sum + g.saved, 0);
              const yearPercent = yearSummary.totalProjectedCost > 0 ? Math.min(100, Math.round((yearTotalSaved / yearSummary.totalProjectedCost) * 100)) : 0;

              const isYearDragOver = dragOverYear === year;

              return (
                <div 
                  key={year} 
                  onDragOver={(e) => handleYearDragOver(e, year)}
                  onDragLeave={() => setDragOverYear(null)}
                  onDrop={(e) => handleYearDrop(e, year)}
                  className={cn(
                    "flex flex-col gap-4 rounded-3xl p-2 transition-all duration-200 border border-transparent",
                    isYearDragOver ? "border-dashed border-[var(--fp-color-primary)] bg-[var(--fp-color-surface-hover)]/30 scale-[1.005] shadow-sm" : ""
                  )}
                >
                  {/* Year Header Block */}
                  <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5 border",
                    isAccumulation ? "bg-[var(--fp-color-accent-gold-soft)] border-[var(--fp-color-accent-gold-soft)]" : "bg-[var(--fp-color-surface)] border-transparent"
                  )}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h2 className={cn("text-[28px] font-extrabold tracking-tight", isAccumulation ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-foreground)]")}>{year}</h2>
                        {isAccumulation ? (
                          <span className="rounded bg-white/50 px-2 py-0.5 text-xs font-bold tracking-wider text-[var(--fp-color-accent-gold-text)] uppercase">{t("goals.accumulationBadge")}</span>
                        ) : isCompleted ? (
                          <span className="rounded bg-[var(--fp-color-teal)]/10 px-2 py-0.5 text-xs font-bold tracking-wider text-[var(--fp-color-teal)] uppercase">{t("goals.completedBadge")}</span>
                        ) : (
                          <span className="rounded bg-[var(--fp-color-label)]/10 px-2 py-0.5 text-xs font-bold tracking-wider text-[var(--fp-color-label)] uppercase">{t("goals.queueBadge")}</span>
                        )}
                        <span className="text-sm font-bold opacity-70 ml-2">{t("goals.totalGoalsCount", { count: yearGoals.length })}</span>
                      </div>
                      <p className="text-sm font-medium opacity-70">
                        {isAccumulation ? t("goals.yearAccumulationInfo", { year: String(year) }) : isCompleted ? t("goals.yearCompletedInfo", { year: String(year) }) : t("goals.yearQueueInfo", { year: String(year) })}
                      </p>
                    </div>

                    <div className="grid min-w-[320px] gap-3 rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/40 px-4 py-3 sm:grid-cols-3">
                      <YearSummaryMetric label={t("goals.yearTotalProjected")} value={formatRub(yearSummary.totalProjectedCost)} emphasis={isAccumulation} />
                      <YearSummaryMetric label={t("goals.yearRemaining")} value={formatRub(yearSummary.remaining)} emphasis={isAccumulation} />
                      <YearSummaryMetric label={t("goals.yearMonthlyUntilEnd")} value={formatRub(yearSummary.monthlyUntilYearEnd)} emphasis={isAccumulation} />
                      <div className="sm:col-span-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                          <div
                            className={cn("h-full rounded-full", isAccumulation ? "bg-[var(--fp-color-accent-gold-text)]" : "bg-[var(--fp-color-foreground)]")}
                            style={{ width: `${yearPercent}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold", isAccumulation ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-muted-foreground)]")}>{yearPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Goals List */}
                  <div className="flex flex-col gap-3">
                    {yearGoals.map((goal) => (
                      <GoalListItem 
                        key={goal.id} 
                        goal={goal} 
                        isAccumulation={isAccumulation}
                        isQueue={!isCompleted && !isAccumulation}
                        onClick={() => handleEdit(goal)} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, goal.id)}
                        onDragEnd={() => {
                          setDraggedGoalId(null);
                          setDragOverGoalId(null);
                        }}
                        onDragOver={(e) => handleDragOver(e, goal.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, goal.id)}
                        isDragging={draggedGoalId === goal.id}
                        isDragOver={dragOverGoalId === goal.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-[var(--fp-color-border)]">
            <div className="grid size-12 place-items-center rounded-full bg-[var(--fp-color-surface)] text-[var(--fp-color-muted-foreground)]">
              <Search className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--fp-color-foreground)]">{t("goals.searchEmptyTitle")}</h2>
            <p className="mt-1 text-sm text-[var(--fp-color-muted-foreground)] max-w-[250px]">
              {t("goals.searchEmptyDesc")}
            </p>
          </Card>
        )
      ) : (
        <GoalEmptyState onAdd={handleCreate} />
      )}

      <GoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingItem}
        defaultGrowth={plan?.settings.inflation}
        onSubmit={handleModalSubmit}
        onDelete={(id) => deleteGoal.mutate(id)}
      />
    </Page>
  );
}

function YearSummaryMetric({ label, value, emphasis }: { label: string; value: string; emphasis: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase text-[var(--fp-color-muted-foreground)]">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-bold", emphasis ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-foreground)]")}>{value}</div>
    </div>
  );
}
