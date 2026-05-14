import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-[var(--fp-color-muted)] text-[var(--fp-color-foreground)]",
      success: "bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]",
      warning: "bg-[var(--fp-color-accent-gold-soft)] text-[var(--fp-color-accent-gold)]",
      danger: "bg-[var(--fp-color-danger-soft)] text-[var(--fp-color-danger)]",
      subtle: "border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/70 text-[var(--fp-color-muted-foreground)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
