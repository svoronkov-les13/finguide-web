import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GoalEmptyStateProps {
  onAdd: () => void;
  className?: string;
}

export function GoalEmptyState({ onAdd, className }: GoalEmptyStateProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col rounded-[32px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-8",
        className
      )}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-bold text-[var(--fp-color-foreground)]">
          {t("goals.emptyStateTitle")}
        </h2>
        <p className="mb-8 max-w-[400px] text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
          {t("goals.emptyStateDesc")}
        </p>

        <div className="mb-8 rounded-2xl bg-[var(--fp-color-background)] p-6 text-left w-full max-w-[480px]">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fp-color-accent-gold-text)]">
            <span className="grid size-5 place-items-center rounded-full bg-[var(--fp-color-accent-gold-soft)]">
              💡
            </span>
            {t("goals.emptyStateTipsTitle")}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-[var(--fp-color-accent-gold-text)]" />
              <span>{t("goals.emptyStateTip1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-[var(--fp-color-accent-gold-text)]" />
              <span>{t("goals.emptyStateTip2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-[var(--fp-color-accent-gold-text)]" />
              <span>{t("goals.emptyStateTip3")}</span>
            </li>
          </ul>
        </div>

        <Button
          variant="default"
          onClick={onAdd}
          className="px-8"
        >
          <Plus className="size-4 shrink-0" />
          {t("goals.addGoal")}
        </Button>
      </div>
    </div>
  );
}
