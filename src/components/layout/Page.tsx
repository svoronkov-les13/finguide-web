import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "default" | "narrow";
}

export function Page({ children, className, maxWidth = "default" }: PageProps) {
  return (
    <div className={cn("grid gap-4", maxWidth === "default" ? "max-w-[1256px]" : "max-w-[900px]", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 max-[760px]:block">
      <div className="min-w-0">
        <h1 className="page-title max-[760px]:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm leading-6 text-[var(--fp-color-muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[760px]:mt-4 max-[760px]:justify-start">{actions}</div>}
    </header>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 max-[760px]:block">
      <div>
        <h2 className="section-title text-[var(--fp-text-md)]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-[var(--fp-color-muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[760px]:mt-3 max-[760px]:justify-start">{actions}</div>}
    </div>
  );
}
