import { CheckCircle2, Plus, Target } from "lucide-react";
import { useAddGoalMutation, useDeleteGoalMutation, usePlanQuery, useUpdateGoalMutation } from "@/api/planQueries";
import { GoalsTable } from "@/components/dashboard/GoalsTable";
import { Page, PageHeader } from "@/components/layout/Page";
import { DataPanel } from "@/components/plan/DataPanel";
import { GoalEditor } from "@/components/plan/GoalEditor";
import { MetricCard, MetricsGrid } from "@/components/plan/MetricCard";
import { Button } from "@/components/ui/button";
import { formatRub } from "@/lib/utils";

export function GoalsPage() {
  const { data: plan } = usePlanQuery();
  const updateGoal = useUpdateGoalMutation();
  const addGoal = useAddGoalMutation();
  const deleteGoal = useDeleteGoalMutation();
  const goals = plan?.goals ?? [];

  return (
    <Page>
      <PageHeader
        title="Цели"
        description="Стоимость, накоплено, год достижения и статус каждой цели."
        actions={
        <Button
          onClick={() =>
            addGoal.mutate({
              name: "Новая цель",
              icon: "Target",
              targetYear: 2030,
              cost: 1_000_000,
              saved: 0,
              growth: 0.05,
              reachable: true,
            })
          }
        >
          <Plus className="size-4" /> Добавить
        </Button>
        }
      />
      <MetricsGrid>
        <MetricCard label="Целей" value={String(goals.length)} icon={<Target className="size-4" />} />
        <MetricCard label="Общая стоимость" value={formatRub(goals.reduce((sum, goal) => sum + goal.cost, 0), { compact: true })} />
        <MetricCard
          label="Уже накоплено"
          value={formatRub(goals.reduce((sum, goal) => sum + goal.saved, 0), { compact: true })}
          detail={`${goals.filter((goal) => goal.reachable).length} из ${goals.length} достижимы`}
          icon={<CheckCircle2 className="size-4" />}
        />
      </MetricsGrid>
      <DataPanel title="Редактирование целей" description="Эти поля соответствуют контракту модели: год, стоимость и текущие накопления.">
        <GoalEditor
          goals={goals}
          onUpdate={(id, patch) => updateGoal.mutate({ id, patch })}
          onDelete={(id) => deleteGoal.mutate(id)}
        />
      </DataPanel>
      <GoalsTable />
    </Page>
  );
}
