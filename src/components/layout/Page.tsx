import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Page — единая обёртка для всех страниц приложения.
 *
 * Единая ширина 1200px для всех страниц без исключений.
 * Ширина контролируется ТОЛЬКО здесь (AppShell не ограничивает).
 */
const PAGE_MAX_W = "max-w-[1200px]";

interface PageProps {
  children: ReactNode;
  className?: string;
  /** Нижний отступ pb-12. По умолчанию включён. */
  bottom?: boolean;
  /** Если true, страница сама скроллится (overflow-auto). По умолчанию true. */
  scrollable?: boolean;
}

export function Page({ children, className, bottom = true, scrollable = true }: PageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full page-enter",
        scrollable
          ? cn("grid gap-6", bottom && "pb-12")
          : cn("flex flex-col gap-6 h-[calc(100vh-52px-64px)] min-h-0", bottom && "pb-12"),
        PAGE_MAX_W,
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── BackButton ───────────────────────────────────────────────────────────────

/**
 * Универсальная кнопка «Назад» для sub-page.
 * Использует window.history.back() — подходит для SPA навигации.
 */
export function BackButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      onClick={() => window.history.back()}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)]",
        "bg-[var(--fp-color-background)] px-4 py-2 text-sm font-medium",
        "text-[var(--fp-color-foreground)] transition-colors",
        "hover:bg-[var(--fp-color-surface-hover)]",
        className,
      )}
    >
      <ChevronLeft className="size-4" />
      {t("common.back")}
    </button>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Показать кнопку «Назад» перед заголовком */
  back?: boolean;
}

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 max-[760px]:block">
      <div className="flex min-w-0 items-center gap-4">
        {back && <BackButton />}
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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 max-[760px]:mt-4 max-[760px]:justify-start">
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
