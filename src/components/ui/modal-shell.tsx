import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Lightbulb, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Shared scaffolding for the large two-column form modals (cashflow, goals):
 * overlay, 1100px card, scrollable form column with title row and close
 * button, optional scrollable instruction aside. Both columns use ScrollArea,
 * so no native scrollbars appear on either side.
 */
export function ModalShell({
  open,
  onOpenChange,
  title,
  locked = false,
  aside,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Blocks closing (overlay click, Esc, close button) while a mutation is in flight. */
  locked?: boolean;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!locked) onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-stretch justify-center py-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={(e) => {
            if (!locked && e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <div
            className="mx-auto flex w-full max-w-[1100px] overflow-hidden rounded-[32px] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between p-8 pb-4 md:p-10 md:pb-4">
                <Dialog.Title className="text-xl font-bold text-[var(--fp-color-foreground)]">{title}</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    disabled={locked}
                    className="grid size-8 place-items-center rounded-full border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>
              <ScrollArea className="flex-1" autoHide>
                {children}
              </ScrollArea>
            </div>

            {aside && (
              <ScrollArea
                className="hidden w-[360px] shrink-0 border-l border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] md:block"
                contentClassName="p-8 md:p-10"
                fadeColor="var(--fp-color-surface)"
                autoHide
              >
                {aside}
              </ScrollArea>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface InstructionStep {
  title: React.ReactNode;
  description: React.ReactNode;
}

/** The numbered-steps + tips content both form modals show in the aside. */
export function InstructionAside({
  label,
  intro,
  steps,
  tipsLabel,
  tips,
  accentColor = "var(--fp-color-foreground)",
}: {
  label: React.ReactNode;
  intro?: React.ReactNode;
  steps: InstructionStep[];
  tipsLabel?: React.ReactNode;
  tips?: React.ReactNode[];
  accentColor?: string;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: accentColor }}>
        <BookOpen className="size-4" />
        {label}
      </div>

      {intro && <p className="mb-6 text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">{intro}</p>}

      <div className="flex flex-col gap-5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <span
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {index + 1}
            </span>
            <div>
              <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{step.title}</div>
              <div className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tips && tips.length > 0 && (
        <div className="mt-auto pt-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--fp-color-muted-foreground)]">
            <Lightbulb className="size-4" />
            <span>{tipsLabel}</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--fp-color-primary)] opacity-50" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
