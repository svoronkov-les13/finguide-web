import * as React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructionPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface InstructionStepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

interface InstructionTipProps {
  children: React.ReactNode;
  tipsTitle?: string;
}

export function InstructionPanel({ title, children, className }: InstructionPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-5",
        className,
      )}
    >
      {title && (
        <div className="mb-4 flex items-center gap-2 text-[var(--fp-color-teal)]">
          <BookOpen className="size-4" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
      )}
      <p className="mb-4 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
        {React.Children.toArray(children).find((child) => typeof child === "string")}
      </p>
      <div className="space-y-4">
        {React.Children.toArray(children).filter((child) => typeof child !== "string")}
      </div>
    </aside>
  );
}

export function InstructionStep({ number, title, children }: InstructionStepProps) {
  return (
    <div className="flex gap-3">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-teal)] text-[10px] font-bold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--fp-color-foreground)]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--fp-color-muted-foreground)]">{children}</p>
      </div>
    </div>
  );
}

export function InstructionTips({ children, tipsTitle = "💡 Tips" }: InstructionTipProps) {
  return (
    <div className="mt-4 border-t border-[var(--fp-color-divider)] pt-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--fp-color-accent-gold)]">
        {tipsTitle}
      </p>
      <ul className="space-y-1.5 text-xs leading-5 text-[var(--fp-color-muted-foreground)]">
        {children}
      </ul>
    </div>
  );
}

export function InstructionTip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className="mt-[3px] text-[var(--fp-color-muted-foreground)]">→</span>
      <span>{children}</span>
    </li>
  );
}
