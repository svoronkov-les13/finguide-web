import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkActivityIndicatorProps {
  active: boolean;
  label: string;
  delayMs?: number;
}

export function NetworkActivityIndicator({ active, label, delayMs = 200 }: NetworkActivityIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      const timer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  if (!active || !visible) return null;

  return (
    <div
      data-network-activity
      role="status"
      aria-live="polite"
      aria-label={label}
      className="pointer-events-none absolute left-0 right-0 top-[52px] z-40 flex h-0 justify-center"
    >
      <div className="mt-3 flex h-8 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-3 text-xs font-semibold text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
        <Loader2 className="size-3.5 animate-spin" />
        <span className={cn("max-[560px]:sr-only")}>{label}</span>
      </div>
    </div>
  );
}
