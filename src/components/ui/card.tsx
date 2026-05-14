import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] shadow-[var(--fp-shadow-card)]", className)} {...props} />;
}

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/96 shadow-[var(--fp-shadow-glass)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function RecommendationCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-5 shadow-[var(--fp-shadow-card)]",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-[var(--fp-color-accent-gold)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-[var(--fp-color-foreground)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--fp-color-muted-foreground)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
