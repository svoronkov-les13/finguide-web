import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-[14px] border border-border/90 bg-card/80 px-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-primary/45 focus:bg-card focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
