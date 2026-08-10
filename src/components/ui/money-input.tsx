import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function groupDigits(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

/**
 * Money field with live thousand separators: the user sees 1'498'432 while
 * typing, the form receives a plain number. Text input + inputmode keeps the
 * numeric keyboard on mobile without the scroll-wheel surprises of
 * input[type=number].
 */
export function MoneyInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  suffix,
  "aria-label": ariaLabel,
}: {
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  suffix?: string;
  "aria-label"?: string;
}) {
  const [text, setText] = useState(value ? groupDigits(String(Math.round(value))) : "");

  // Sync from outside (form reset, plan reload) without an effect: adjust
  // during render only when the numeric value actually diverges, so the
  // caret is not disturbed mid-typing.
  const numericText = Number(text.replace(/\D/g, "")) || 0;
  const numericValue = Math.round(value ?? 0);
  if (numericText !== numericValue) {
    setText(numericValue ? groupDigits(String(numericValue)) : "");
  }

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        disabled={disabled}
        value={text}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 15);
          setText(digits ? groupDigits(digits) : "");
          onChange(digits ? Number(digits) : 0);
        }}
        className={cn("num", suffix && "pr-12", className)}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--fp-color-muted-foreground)]">
          {suffix}
        </span>
      )}
    </div>
  );
}
