import * as Dialog from "@radix-ui/react-dialog";
import { X, BookOpen, Lightbulb } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface CashflowInstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
}

// How the page works as a whole. The step-by-step form walkthrough lives in the
// add/edit modal aside, so nothing here repeats it.
const SECTIONS = [
  { title: "cashflow.howColumnsTitle", body: "howColumnsDesc" },
  { title: "cashflow.howPeriodTitle", body: "howPeriodDesc" },
  { title: "cashflow.howGrowthTitle", body: "howGrowthDesc" },
] as const;

export function CashflowInstructionModal({ open, onOpenChange, type }: CashflowInstructionModalProps) {
  const { t } = useI18n();
  const accentColor = type === "income" ? "#2D8B5E" : "#C75D3A";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[min(600px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] bg-[var(--fp-color-background)] shadow-elevated data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--fp-color-border)] px-6 py-5 sm:px-8 sm:py-6">
            <Dialog.Title className="flex items-center gap-2 text-lg font-bold" style={{ color: accentColor }}>
              <BookOpen className="size-5" />
              {t(`cashflow.instructionTitle_${type}`)}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label={t("common.close")}
                className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            <p className="mb-6 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
              {t(`cashflow.howIntro_${type}`)}
            </p>

            <div className="flex flex-col gap-5">
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t(section.title)}</div>
                  <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
                    {t(`cashflow.${section.body}_${type}`)}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fp-color-foreground)]">
                  <Lightbulb className="size-4" style={{ color: accentColor }} />
                  {t("cashflow.howExampleTitle")}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
                  {t(`cashflow.howExample_${type}`)}
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.howManageTitle")}</div>
                <div className="mt-1 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">{t("cashflow.howManageDesc")}</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-[var(--fp-color-surface)] px-6 py-5 sm:px-8 sm:py-6">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-full bg-[var(--fp-color-foreground)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("cashflow.understood")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
