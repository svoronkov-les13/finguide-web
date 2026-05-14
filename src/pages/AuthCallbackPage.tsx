import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";

export function AuthCallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    auth
      .completeLogin()
      .then((returnTo) => {
        if (alive) void navigate({ to: returnTo || "/dashboard", replace: true });
      })
      .catch((caught: unknown) => {
        if (alive) setError(caught instanceof Error ? caught.message : t("auth.callback.error"));
      });
    return () => {
      alive = false;
    };
  }, [auth, navigate, t]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fp-color-background)] px-4 py-10">
      <div className="w-full max-w-[420px] space-y-6 rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-8 text-center shadow-[var(--fp-shadow-card)]">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--fp-color-primary)] text-[var(--fp-color-accent-gold)]">
          <BarChart3 className="size-5" />
        </span>

        <h1 className="text-lg font-bold text-[var(--fp-color-foreground)]">
          {error ? t("auth.callback.error") : t("auth.callback.title")}
        </h1>

        <p className="text-sm text-[var(--fp-color-muted-foreground)]">
          {error ?? t("auth.callback.description")}
        </p>

        {!error && <Loader2 className="mx-auto size-6 animate-spin text-[var(--fp-color-primary)]" />}
      </div>
    </main>
  );
}
