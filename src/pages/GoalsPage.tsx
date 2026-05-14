import { useState } from "react";
import { Plus, Target, Download, CheckCircle2, Search } from "lucide-react";
import { useAddGoalMutation, useDeleteGoalMutation, usePlanQuery, useUpdateGoalMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";
import { GoalListItem } from "@/components/goals/GoalListItem";
import { GoalEmptyState } from "@/components/goals/GoalEmptyState";
import { GoalModal } from "@/components/goals/GoalModal";
import { useI18n } from "@/i18n/I18nProvider";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

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
  const [sortOrder, setSortOrder] = useState<"default" | "cost" | "year">("default");

  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const goals = plan.goals ?? [];
  const totalCost = goals.reduce((sum, goal) => sum + goal.cost, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const accumulatedPercent = totalCost > 0 ? Math.min(100, Math.round((totalSaved / totalCost) * 100)) : 0;
  
  let filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || goal.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (sortOrder === "cost") {
    filteredGoals = [...filteredGoals].sort((a, b) => b.cost - a.cost);
  } else if (sortOrder === "year" || sortOrder === "default") {
    // Default sorting is by year, then by cost descending
    filteredGoals = [...filteredGoals].sort((a, b) => {
      if (a.targetYear !== b.targetYear) return a.targetYear - b.targetYear;
      return b.cost - a.cost;
    });
  }

  // Active Goal Logic
  const activeGoal = [...goals]
    .sort((a, b) => a.targetYear - b.targetYear)
    .find(g => Math.round((g.saved / g.cost) * 100) < 100) || goals[0];
  
  // Group by year
  const groupedGoals = filteredGoals.reduce((acc, goal) => {
    const year = goal.targetYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(goal);
    return acc;
  }, {} as Record<number, Goal[]>);

  const sortedYears = Object.keys(groupedGoals).map(Number).sort((a, b) => a - b);
  
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
        <div className="flex flex-wrap items-center gap-4 border-b border-[var(--fp-color-border)] pb-4">
          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === "all"
                  ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)]"
                  : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
              )}
            >
              {t("goals.filterAll")}
            </button>
            <button
              onClick={() => setActiveFilter("onetime")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === "onetime"
                  ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)]"
                  : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
              )}
            >
              {t("goals.filterOnetime")}
            </button>
            <button
              onClick={() => setActiveFilter("periodic")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === "periodic"
                  ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)]"
                  : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
              )}
            >
              {t("goals.filterPeriodic")}
            </button>
          </div>

          <div className="relative w-full sm:w-auto min-w-[250px]">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
            <input
              type="text"
              placeholder={t("goals.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] pl-10 pr-4 text-sm text-[var(--fp-color-foreground)] outline-none placeholder:text-[var(--fp-color-muted-foreground)] focus:border-[var(--fp-color-primary)]"
            />
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" className="font-semibold text-xs border-0 bg-transparent text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]">
                {t("goals.sortPrefix")}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-1.5 shadow-[var(--fp-shadow-popover)] animate-in fade-in-0 zoom-in-95"
              >
                <DropdownMenu.Item 
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none transition-colors focus:bg-[var(--fp-color-surface-hover)]"
                  onClick={() => setSortOrder("default")}
                >
                  <span className="flex-1">{t("goals.sortDefault")}</span>
                  {sortOrder === "default" && <CheckCircle2 className="size-4 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none transition-colors focus:bg-[var(--fp-color-surface-hover)]"
                  onClick={() => setSortOrder("cost")}
                >
                  <span className="flex-1">{t("goals.sortCostDesc")}</span>
                  {sortOrder === "cost" && <CheckCircle2 className="size-4 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none transition-colors focus:bg-[var(--fp-color-surface-hover)]"
                  onClick={() => setSortOrder("year")}
                >
                  <span className="flex-1">{t("goals.sortYearAsc")}</span>
                  {sortOrder === "year" && <CheckCircle2 className="size-4 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}

      {/* Grid / List */}
      {goals.length > 0 ? (
        filteredGoals.length > 0 ? (
          <div className="flex flex-col gap-0">
            {/* Grid Header */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-semibold text-[var(--fp-color-muted-foreground)] hidden">
              <div className="w-[30%] min-w-[200px]">{t("goals.colName")}</div>
              <div className="w-[30%] min-w-[200px]">{t("goals.colCost")}</div>
              <div className="w-[20%] min-w-[120px]">{t("goals.colType")}</div>
              <div className="flex-1">{t("goals.colYear")}</div>
            </div>
            
            {/* List */}
            <div className="flex flex-col gap-6">
              {sortedYears.map((year) => {
                const yearGoals = groupedGoals[year];
                const yearCost = yearGoals.reduce((sum, g) => sum + g.cost, 0);
                const yearSaved = yearGoals.reduce((sum, g) => sum + g.saved, 0);
                const yearProgress = yearCost > 0 ? Math.min(100, Math.round((yearSaved / yearCost) * 100)) : 0;
                const isAccumulation = activeGoal?.targetYear === year;
                const isCompleted = activeGoal ? activeGoal.targetYear > year : true;

                return (
                  <div key={year} className="flex flex-col gap-3">
                    {/* Year Group Header */}
                    <div className="flex flex-col gap-2 rounded-2xl bg-[var(--fp-color-surface)] p-4 border border-[var(--fp-color-border)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-[var(--fp-color-foreground)]">{year}</h2>
                          {isAccumulation ? (
                            <span className="rounded bg-[var(--fp-color-accent-gold-soft)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--fp-color-accent-gold-text)]" className="uppercase">{t("goals.accumulationBadge")}</span>
                          ) : isCompleted ? (
                            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600" className="uppercase">{t("goals.completedBadge")}</span>
                          ) : (
                            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-sky-600" className="uppercase">{t("goals.queueBadge")}</span>
                          )}
                          <span className="text-sm font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.totalGoalsCount", { count: yearGoals.length })}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 w-[40%] min-w-[250px] max-w-[400px]">
                          <span className="text-sm font-bold text-[var(--fp-color-foreground)] whitespace-nowrap">{formatRub(yearCost)}</span>
                          <div className="h-1.5 w-full flex-1 overflow-hidden rounded-full bg-[var(--fp-color-background)]">
                            <div className="h-full bg-[var(--fp-color-foreground)] transition-all" style={{ width: `${yearProgress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-[var(--fp-color-muted-foreground)] w-8 text-right">{yearProgress}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--fp-color-muted-foreground)]">
                        {isAccumulation 
                          ? t("goals.yearAccumulationInfo", { year: String(year) }) 
                          : isCompleted
                          ? t("goals.yearCompletedInfo", { year: String(year) })
                          : t("goals.yearQueueInfo", { year: String(year) })}
                      </p>
                    </div>

                    {/* Goals List */}
                    <div className="flex flex-col gap-2">
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
