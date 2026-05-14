import { Link } from "@tanstack/react-router";
import { BarChart3, LogIn } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export function AuthErrorPage() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fp-color-background)] px-4 py-10">
      <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-8 text-center shadow-[var(--fp-shadow-card)]">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--fp-color-danger-soft)] text-[var(--fp-color-danger)]">
          <BarChart3 className="size-5" />
        </span>

        <h1 className="text-lg font-bold text-[var(--fp-color-foreground)]">
          {t("auth.error.title")}
        </h1>

        <p className="text-sm text-[var(--fp-color-muted-foreground)]">
          {t("auth.error.description")}
        </p>

        <Link
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--fp-color-primary)] px-6 text-sm font-semibold text-[var(--fp-color-primary-foreground)] transition hover:opacity-90"
          to="/login"
        >
          <LogIn className="size-4" />
          {t("auth.error.backToLogin")}
        </Link>
      </div>
    </main>
  );
}
