import { WandSparkles } from "lucide-react";
import { usePlanQuery, useSetScenarioMutation } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { ScenarioId } from "@/types/finance";

export function ScenarioBar({ onWhatIf }: { onWhatIf: () => void }) {
  const { data: plan } = usePlanQuery();
  const setScenario = useSetScenarioMutation();
  const { t } = useI18n();

  if (!plan) return null;

  const visibleScenarios = plan.scenarios.filter((scenario) => scenario.id !== "whatif");
  const whatIfActive = plan.activeScenario === "whatif";

  return (
    <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label={t("dashboard.scenariosLabel")}>
      {visibleScenarios.map((scenario) => (
        <Button
          key={scenario.id}
          type="button"
          variant={plan.activeScenario === scenario.id ? "active" : "secondary"}
          size="sm"
          className="shrink-0"
          onClick={() => {
            setScenario.mutate(scenario.id as ScenarioId);
          }}
        >
          {scenario.name}
        </Button>
      ))}
      <span className="mx-1 h-7 w-px shrink-0 bg-[var(--fp-color-border)]" />
      <Button
        type="button"
        variant={whatIfActive ? "active" : "secondary"}
        size="sm"
        className={cn("shrink-0", !whatIfActive && "border-[var(--fp-color-foreground)]/80")}
        onClick={onWhatIf}
      >
        <WandSparkles className="size-3.5" />
        Моделирование сценариев
      </Button>
    </div>
  );
}
