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

  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t("dashboard.scenariosLabel")}>
      {plan.scenarios.map((scenario) => (
        <Button
          key={scenario.id}
          type="button"
          variant={plan.activeScenario === scenario.id ? "active" : "secondary"}
          size="sm"
          className={cn("shrink-0", scenario.id === "whatif" && "border-dashed")}
          onClick={() => {
            if (scenario.id === "whatif") onWhatIf();
            setScenario.mutate(scenario.id as ScenarioId);
          }}
        >
          {scenario.id === "whatif" && <WandSparkles className="size-3.5" />}
          {scenario.name}
        </Button>
      ))}
    </div>
  );
}
