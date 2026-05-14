import * as Dialog from "@radix-ui/react-dialog";
import { X, BookOpen } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface CashflowInstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
}

const STEP_KEYS = ["stepName", "stepAmount", "stepType", "stepDates", "stepGrowth"] as const;

export function CashflowInstructionModal({ open, onOpenChange, type }: CashflowInstructionModalProps) {
  const { t } = useI18n();
  const accentColor = type === "income" ? "#2D8B5E" : "#C75D3A";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex flex-col overflow-hidden rounded-[24px] bg-[var(--fp-color-background)] shadow-elevated">
            <div className="flex items-center justify-between border-b border-[var(--fp-color-border)] px-8 py-6">
              <div className="flex items-center gap-2 text-lg font-bold" style={{ color: accentColor }}>
                <BookOpen className="size-5" />
                {t(`cashflow.instructionTitle_${type}`)}
              </div>
              <Dialog.Close asChild>
                <button className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="px-8 py-8">
              <p className="mb-8 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
                {t(`cashflow.instructionIntro_${type}`)}
              </p>

              <div className="flex flex-col gap-6">
                {STEP_KEYS.map((key, i) => (
                  <div key={key} className="flex items-start gap-4">
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                        {t(`cashflow.${key}` === "cashflow.stepType" ? `cashflow.${key}_${type}` : `cashflow.${key}`)}
                      </div>
                      <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
                        {t(`cashflow.${key}Desc_${type}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--fp-color-surface)] px-8 py-6">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full rounded-full bg-[var(--fp-color-foreground)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t("cashflow.understood")}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
