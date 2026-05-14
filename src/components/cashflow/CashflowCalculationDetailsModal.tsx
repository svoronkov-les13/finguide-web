import * as Dialog from "@radix-ui/react-dialog";
import { X, Calculator, Info } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatRub } from "@/lib/utils";

interface CashflowCalculationDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  totalYear: number;
  totalMonth: number;
  itemsCount: number;
  startYear: number;
}

const CALC_STEP_KEYS = ["calcStep1", "calcStep2", "calcStep3"] as const;

export function CashflowCalculationDetailsModal({
  open,
  onOpenChange,
  type,
  totalYear,
  totalMonth,
  itemsCount,
  startYear,
}: CashflowCalculationDetailsModalProps) {
  const { t } = useI18n();
  const accentColor = type === "income" ? "#2D8B5E" : "#C75D3A";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex flex-col overflow-hidden rounded-[24px] bg-[var(--fp-color-background)] shadow-elevated">
            <div className="flex items-center justify-between border-b border-[var(--fp-color-border)] px-6 py-5">
              <div className="flex items-center gap-2 text-base font-bold text-[var(--fp-color-foreground)]">
                <Calculator className="size-4 text-[var(--fp-color-muted-foreground)]" />
                {t("cashflow.calcTitle", { year: String(startYear) })}
              </div>
              <Dialog.Close asChild>
                <button className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4">
                  <div className="text-xs font-medium text-[var(--fp-color-muted-foreground)]">{t("cashflow.calcTotalYear")}</div>
                  <div className="mt-1 text-xl font-bold" style={{ color: accentColor }}>
                    {formatRub(totalYear)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4">
                  <div className="text-xs font-medium text-[var(--fp-color-muted-foreground)]">{t("cashflow.calcAvgMonth")}</div>
                  <div className="mt-1 text-xl font-bold text-[var(--fp-color-foreground)]">
                    {formatRub(totalMonth)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {CALC_STEP_KEYS.map((key, i) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-surface-hover)] text-xs font-bold text-[var(--fp-color-muted-foreground)]">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t(`cashflow.${key}Title`)}</div>
                      <div className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">
                        {t(`cashflow.${key}Desc`, { count: String(itemsCount) })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--fp-color-surface-hover)] p-4 text-sm text-[var(--fp-color-muted-foreground)]">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>{t(`cashflow.calcNote_${type}`)}</p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
