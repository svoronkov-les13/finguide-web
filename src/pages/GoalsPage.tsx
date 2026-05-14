import { useState } from "react";
import { Plus, Target, Download, Search } from "lucide-react";
import { useAddGoalMutation, useDeleteGoalMutation, usePlanQuery, useUpdateGoalMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";
import { GoalListItem } from "@/components/goals/GoalListItem";
import { GoalEmptyState } from "@/components/goals/GoalEmptyState";
import { GoalModal } from "@/components/goals/GoalModal";
import { useI18n } from "@/i18n/I18nProvider";

export function GoalsPage() {
  const { t } = useI18n();
  const { data: plan } = usePlanQuery();
  const addGoal = useAddGoalMutation();
  const updateGoal = useUpdateGoalMutation();
  const deleteGoal = useDeleteGoalMutation();

  const [editingItem, setEditingItem] = useState<Partial<Goal> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "onetime" | "periodic">("all");
  const [sortField, setSortField] = useState<"name" | "cost" | "type" | "year">("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const goals = plan.goals ?? [];
  const totalCost = goals.reduce((sum, goal) => sum + goal.cost, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const accumulatedPercent = totalCost > 0 ? Math.min(100, Math.round((totalSaved / totalCost) * 100)) : 0;
  
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || goal.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const activeGoal = [...goals]
    .sort((a, b) => a.targetYear - b.targetYear)
    .find(g => Math.round((g.saved / g.cost) * 100) < 100) || goals[0];

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
      if (sortField === "year") result = a.cost - b.cost; // Fallback inner sort when sorting by year
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
    <div className="grid max-w-[1256px] gap-6 pb-12">
      {/* Header */}
      <header className="flex items-start justify-between gap-5 max-[760px]:flex-col">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
          >
            <span className="text-[var(--fp-color-muted-foreground)]">←</span>
            {t("cashflow.back")}
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--fp-color-foreground)]">{t("goals.title")}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="max-[760px]:hidden"
          >
            {t("goals.viewExample")}
          </Button>
          
          <Button
            variant="default"
            onClick={handleCreate}
          >
            <Plus className="size-4 shrink-0" />
            {t("goals.addGoal")}
          </Button>
        </div>
      </header>

      {/* Stats bar */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 py-3 text-sm">
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">Всего</span>
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
                    {groupedGoals[year].length} цели
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
        <div className="flex flex-col gap-4 border-b border-[var(--fp-color-border)] pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-auto min-w-[300px]">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
              <input
                type="text"
                placeholder={t("goals.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[48px] w-full rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] pl-10 pr-4 text-sm font-medium text-[var(--fp-color-foreground)] outline-none placeholder:text-[var(--fp-color-muted-foreground)] focus:border-[var(--fp-color-primary)]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "rounded-full border px-6 h-[48px] text-sm font-bold transition-colors",
                  activeFilter === "all"
                    ? "border-transparent bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--fp-color-muted-foreground)] hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t("goals.filterAll")}
              </button>
              <button
                onClick={() => setActiveFilter("onetime")}
                className={cn(
                  "rounded-full border px-6 h-[48px] text-sm font-bold transition-colors",
                  activeFilter === "onetime"
                    ? "border-transparent bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--fp-color-muted-foreground)] hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t("goals.filterOnetime")}
              </button>
              <button
                onClick={() => setActiveFilter("periodic")}
                className={cn(
                  "rounded-full border px-6 h-[48px] text-sm font-bold transition-colors",
                  activeFilter === "periodic"
                    ? "border-transparent bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--fp-color-muted-foreground)] hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t("goals.filterPeriodic")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-wider text-[var(--fp-color-muted-foreground)]">
            <span>{t("goals.sortPrefix")}</span>
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
                  "flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors",
                  sortField === field
                    ? "bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)]"
                    : "hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
                )}
              >
                {t(`goals.sort_${field}`)}
                <span className="text-[10px] opacity-70">
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
              const isCompleted = yearGoals.every(g => g.saved >= g.cost);
              const yearTotalCost = yearGoals.reduce((sum, g) => sum + g.cost, 0);
              const yearTotalSaved = yearGoals.reduce((sum, g) => sum + g.saved, 0);
              const yearPercent = yearTotalCost > 0 ? Math.min(100, Math.round((yearTotalSaved / yearTotalCost) * 100)) : 0;

              return (
                <div key={year} className="flex flex-col gap-4">
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
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-emerald-600 uppercase">{t("goals.completedBadge")}</span>
                        ) : (
                          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-sky-600 uppercase">{t("goals.queueBadge")}</span>
                        )}
                        <span className="text-sm font-bold opacity-70 ml-2">{t("goals.totalGoalsCount", { count: yearGoals.length })}</span>
                      </div>
                      <p className="text-sm font-medium opacity-70">
                        {isAccumulation ? t("goals.yearAccumulationInfo", { year: String(year) }) : isCompleted ? t("goals.yearCompletedInfo", { year: String(year) }) : t("goals.yearQueueInfo", { year: String(year) })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/40 px-4 py-2 rounded-full border border-white/20">
                      <span className={cn("font-bold text-lg", isAccumulation ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-foreground)]")}>{formatRub(yearTotalCost)}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/10">
                        <div 
                          className={cn("h-full rounded-full", isAccumulation ? "bg-[var(--fp-color-accent-gold-text)]" : "bg-[var(--fp-color-foreground)]")} 
                          style={{ width: `${yearPercent}%` }} 
                        />
                      </div>
                      <span className={cn("text-xs font-bold", isAccumulation ? "text-[var(--fp-color-accent-gold-text)]" : "text-[var(--fp-color-muted-foreground)]")}>{yearPercent}%</span>
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
        onSubmit={handleModalSubmit}
        onDelete={(id) => deleteGoal.mutate(id)}
      />
    </div>
  );
}
