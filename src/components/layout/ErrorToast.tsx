import { useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { useUiStore } from "@/store/uiStore";

/** Surfaces failed mutations; fed by the global MutationCache onError in app.tsx. */
export function ErrorToast() {
  const message = useUiStore((state) => state.errorMessage);
  const clearError = useUiStore((state) => state.clearError);
  const { t } = useI18n();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clearError, 10_000);
    return () => clearTimeout(timer);
  }, [message, clearError]);

  if (!message) return null;

  return (
    <aside
      role="alert"
      className="fixed bottom-6 right-6 z-[60] w-[min(380px,calc(100vw-32px))] rounded-[20px] border border-[var(--fp-color-danger)]/30 bg-[var(--fp-color-card)] p-4 shadow-elevated"
    >
      <Button className="absolute right-2 top-2" variant="ghost" size="iconSm" onClick={clearError} aria-label={t("common.close")}>
        <X className="size-4" />
      </Button>
      <div className="flex items-start gap-3 pr-6">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--fp-color-danger)]/10 text-[var(--fp-color-danger)]">
          <TriangleAlert className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--fp-color-foreground)]">{t("errors.saveFailed")}</div>
          <div className="mt-1 break-words text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">{message}</div>
          <div className="mt-1 text-[11px] text-[var(--fp-color-muted-foreground)]">{t("errors.supportHint")}</div>
        </div>
      </div>
    </aside>
  );
}
