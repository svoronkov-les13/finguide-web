import { Plus, Wallet } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface CashflowEmptyStateProps {
  type: "income" | "expense";
  onAdd: () => void;
  className?: string;
}

export function CashflowEmptyState({ type, onAdd, className }: CashflowEmptyStateProps) {
  const { t } = useI18n();
  const isIncome = type === "income";
  const accentColor = isIncome ? "#2D8B5E" : "#C75D3A";

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-8 text-center",
        className
      )}
    >
      <div
        className="mb-6 grid size-20 place-items-center rounded-full"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        <Wallet className="size-10" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-[var(--fp-color-foreground)]">
        {t(`cashflow.emptyTitle_${type}`)}
      </h2>
      <p className="mb-8 max-w-[400px] text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
        {t(`cashflow.emptyDescription_${type}`)}
      </p>

      <button
        onClick={onAdd}
        className="flex h-[48px] items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        {t(`cashflow.addFirst_${type}`)}
      </button>
    </div>
  );
}
