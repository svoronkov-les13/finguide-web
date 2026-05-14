import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, ...props }, ref) => (
    <div className="relative w-full">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-[52px] w-full rounded-[var(--fp-radius-full)] border-none bg-[var(--fp-color-muted)] px-5 text-base text-[var(--fp-color-foreground)] outline-none transition duration-[var(--fp-duration-normal)]",
          "placeholder:text-[var(--fp-color-muted-foreground)]/60",
          "focus:bg-[var(--fp-color-muted)] focus:ring-2 focus:ring-[var(--fp-color-accent-gold)]/40",
          "disabled:cursor-not-allowed disabled:opacity-60",
          icon && "pl-11",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";
