import { useState } from "react";
import { Plus, Target, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Search, Filter } from "lucide-react";
import { useAddGoalMutation, useDeleteGoalMutation, usePlanQuery, useUpdateGoalMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { cn, formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";
import { GoalCard } from "@/components/goals/GoalCard";
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
  const [isCompact, setIsCompact] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "cost" | "year">("default");

  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const goals = plan.goals ?? [];
  const totalCost = goals.reduce((sum, goal) => sum + goal.cost, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const reachableCount = goals.filter((goal) => goal.reachable).length;
  const unreachableCount = goals.length - reachableCount;
  
  let filteredGoals = goals.filter((goal) => goal.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (sortOrder === "cost") {
    filteredGoals = [...filteredGoals].sort((a, b) => b.cost - a.cost);
  } else if (sortOrder === "year") {
    filteredGoals = [...filteredGoals].sort((a, b) => a.targetYear - b.targetYear);
  }
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
        name: data.name || "Новая цель",
        icon: data.icon || "Target",
        targetYear: data.targetYear || 2030,
        cost: data.cost || 0,
        saved: data.saved || 0,
        growth: data.growth || 0,
        reachable: data.reachable ?? true,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="grid max-w-[1256px] gap-6 pb-12">
      {/* Header */}
      <header className="flex items-start justify-between gap-5 max-[760px]:block">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
            <Target className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fp-color-foreground)]">{t("goals.title")}</h1>
            <p className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">{t("goals.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 max-[760px]:mt-4">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 text-sm font-medium text-[var(--fp-color-muted-foreground)] transition hover:bg-[var(--fp-color-surface-hover)] max-[760px]:w-10 max-[760px]:justify-center max-[760px]:px-0"
            aria-label={t("goals.compact")}
          >
            <Sparkles className="size-4 shrink-0" />
            <span className="hidden sm:inline">{t("goals.compact")}</span>
          </button>
          
          <button
            onClick={handleCreate}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--fp-color-primary)] px-5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus className="size-4" />
            {t("goals.addGoal")}
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm">
            <Target className="size-4 text-[var(--fp-color-muted-foreground)]" />
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.totalCost")}</span>
            <span className="font-bold text-[var(--fp-color-foreground)]">{formatRub(totalCost)}</span>
          </div>
          
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm">
            <TrendingUp className="size-4 text-[var(--fp-color-muted-foreground)]" />
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.totalSaved")}</span>
            <span className="font-bold text-[var(--fp-color-foreground)]">{formatRub(totalSaved)}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="font-bold text-[var(--fp-color-foreground)]">{reachableCount}</span>
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("goals.reachable")}</span>
          </div>

          {unreachableCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="size-4" />
              <span className="font-bold">{unreachableCount}</span>
              <span className="font-medium">{t("goals.unreachable")}</span>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
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
              <button className="flex h-10 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 text-sm font-medium text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] data-[state=open]:bg-[var(--fp-color-surface-hover)]">
                <Filter className="size-4" />
                Сортировка
              </button>
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
                  <span className="flex-1">По умолчанию</span>
                  {sortOrder === "default" && <CheckCircle2 className="size-4 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none transition-colors focus:bg-[var(--fp-color-surface-hover)]"
                  onClick={() => setSortOrder("cost")}
                >
                  <span className="flex-1">По стоимости (убывание)</span>
                  {sortOrder === "cost" && <CheckCircle2 className="size-4 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none transition-colors focus:bg-[var(--fp-color-surface-hover)]"
                  onClick={() => setSortOrder("year")}
                >
                  <span className="flex-1">По году (ближайшие)</span>
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
          <div className="grid gap-3">
            {filteredGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                item={goal} 
                onClick={() => handleEdit(goal)} 
                compact={isCompact} 
              />
            ))}
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
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-[var(--fp-color-border)]">
          <div className="grid size-12 place-items-center rounded-full bg-[var(--fp-color-surface)] text-[var(--fp-color-muted-foreground)]">
            <Target className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-[var(--fp-color-foreground)]">{t("goals.emptyStateTitle")}</h2>
          <p className="mt-1 text-sm text-[var(--fp-color-muted-foreground)] max-w-[250px]">
            {t("goals.emptyStateDesc")}
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-4 text-sm font-medium text-[var(--fp-color-background)] transition hover:opacity-90"
          >
            <Plus className="size-4" />
            {t("goals.addGoal")}
          </button>
        </Card>
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
