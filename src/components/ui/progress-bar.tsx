import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number;
  /** Format label, defaults to showing percentage */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Color variant */
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const trackColors = {
  default: "bg-[var(--fp-color-accent-gold)]",
  success: "bg-[var(--fp-color-teal)]",
  warning: "bg-[var(--fp-color-coral)]",
  danger: "bg-[var(--fp-color-danger)]",
} as const;

export function ProgressBar({ value, label, size = "md", variant = "default", className }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const trackColor = trackColors[variant];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-full bg-[var(--fp-color-muted)]",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", trackColor)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {label !== undefined && (
        <span className="progress-nums shrink-0 text-[var(--fp-color-muted-foreground)]">{label}</span>
      )}
    </div>
  );
}
