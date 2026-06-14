import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

/**
 * Standard input field.
 *
 * Style: white bg, subtle border, rounded-2xl, h-12.
 * Consistent across all pages, modals, and dialogs.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, onFocus, ...props }, ref) => (
    <div className="relative w-full">
      {icon && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-input)] px-5 text-sm text-[var(--fp-color-foreground)] outline-none transition-all duration-[var(--fp-duration-normal)]",
          "placeholder:text-[var(--fp-color-text-muted)]",
          "hover:border-[var(--fp-color-border-hover)]",
          "focus:border-[var(--fp-color-border-strong)] focus:ring-2 focus:ring-[var(--fp-color-accent-gold)]/30",
          "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--fp-color-input-disabled)] disabled:opacity-60",
          icon && "pl-11",
          className,
        )}
        onFocus={(e) => {
          e.currentTarget.select();
          onFocus?.(e);
        }}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";
