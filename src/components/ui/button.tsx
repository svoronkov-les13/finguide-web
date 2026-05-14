import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors duration-[var(--fp-duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fp-color-accent-gold)]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--fp-color-primary)] text-[var(--fp-color-primary-foreground)] shadow-[var(--fp-shadow-soft)] hover:bg-[var(--fp-color-sidebar-soft)]",
        secondary: "border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)] hover:bg-[var(--fp-color-surface-hover)]",
        ghost: "text-[var(--fp-color-muted-foreground)] hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]",
        danger: "bg-[var(--fp-color-danger-soft)] text-[var(--fp-color-danger)] hover:bg-[var(--fp-color-danger)]/15",
        active: "border border-[var(--fp-color-sidebar-active-border)] bg-[var(--fp-color-accent-gold-soft)] text-[var(--fp-color-accent-gold-text)]",
        success: "bg-[var(--fp-color-teal)] text-white shadow-[var(--fp-shadow-soft)] hover:bg-[var(--fp-color-teal)]/90",
        "success-outline": "border border-[var(--fp-color-teal)]/40 text-[var(--fp-color-teal)] hover:bg-[var(--fp-color-teal-soft)]",
        "danger-outline": "border border-[var(--fp-color-coral)]/40 text-[var(--fp-color-coral)] hover:bg-[var(--fp-color-coral-soft)]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4",
        lg: "h-11 px-5",
        icon: "size-9 p-0",
        iconSm: "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
