import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/**
 * Pill-style segmented switcher (income type, goal type, age/year mode).
 * Concentric radii: a rounded-full track with rounded-full segments, the
 * active one lifted onto the card background with a soft shadow.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  grow = true,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  disabled?: boolean;
  /** Stretch segments to fill the track. Off for compact inline switchers. */
  grow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-1 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-input)] p-1",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-full rounded-full px-4 text-sm font-semibold transition-all",
            grow && "flex-1",
            option.value === value
              ? "border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] font-bold text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)]"
              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
