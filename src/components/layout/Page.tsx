import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page — единая обёртка для всех страниц приложения.
 *
 * Все страницы имеют одинаковую ширину (1256px), что обеспечивает
 * визуальную консистентность при навигации.
 *
 * Исключение: CashflowPage использует size="wide" (1400px),
 * так как там реально 3 колонки данных.
 */
type PageSize = "default" | "wide";

const MAX_WIDTHS: Record<PageSize, string> = {
  default: "max-w-[1256px]",
  wide: "max-w-[1400px]",
};

interface PageProps {
  children: ReactNode;
  className?: string;
  /** Ширина: "default" = 1256px (все страницы), "wide" = 1400px (Cashflow) */
  size?: PageSize;
  /** Нижний отступ pb-12. По умолчанию включён. */
  bottom?: boolean;
  /** Если true, страница сама скроллится (overflow-auto). По умолчанию true. */
  scrollable?: boolean;
}

export function Page({ children, className, size = "default", bottom = true, scrollable = true }: PageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        scrollable
          ? cn("grid gap-6", bottom && "pb-12")
          : cn("flex flex-col gap-6 h-[calc(100vh-52px-64px)] min-h-0", bottom && "pb-12"),
        MAX_WIDTHS[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Иконка / аватар слева от заголовка */
  icon?: ReactNode;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 max-[760px]:block">
      <div className="flex min-w-0 items-center gap-4">
        {icon && (
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-sm">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="page-title max-[760px]:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--fp-color-muted-foreground)]">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[760px]:mt-4 max-[760px]:justify-start">
          {actions}
        </div>
      )}
    </header>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

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
        {description && (
          <p className="mt-1 text-xs leading-5 text-[var(--fp-color-muted-foreground)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[760px]:mt-3 max-[760px]:justify-start">
          {actions}
        </div>
      )}
    </div>
  );
}
