import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * The small "?" badge next to a metric label. Opens on hover and keyboard
 * focus like a regular tooltip, and on click/tap as well, since touch devices
 * never hover.
 */
export function Hint({ text, label, className }: { text: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={(event) => {
              event.preventDefault();
              setOpen((value) => !value);
            }}
            className={cn(
              "inline-flex size-3.5 cursor-help items-center justify-center rounded-full border border-[var(--fp-color-border)] text-[9px] font-bold normal-case outline-none transition-colors hover:border-[var(--fp-color-border-strong)] hover:text-[var(--fp-color-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)]",
              className,
            )}
          >
            ?
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            collisionPadding={12}
            className="z-[var(--fp-z-tooltip)] max-w-[280px] rounded-[var(--fp-radius-md)] bg-[var(--fp-color-foreground)] px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-[var(--fp-shadow-tooltip)]"
          >
            {text}
            <Tooltip.Arrow className="fill-[var(--fp-color-foreground)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
