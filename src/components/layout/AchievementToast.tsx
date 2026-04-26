import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { useUiStore } from "@/store/uiStore";

export function AchievementToast() {
  const visible = useUiStore((state) => state.toastVisible);
  const setVisible = useUiStore((state) => state.setToastVisible);
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <aside className="fixed bottom-6 right-6 z-50 w-[min(340px,calc(100vw-32px))] rounded-[28px] border border-border/80 bg-card/94 p-4 shadow-elevated backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-3 -top-4 grid size-20 place-items-center rounded-full border-[6px] border-emerald-500/25 text-3xl text-emerald-600/70">✓</div>
      <Button className="absolute right-3 top-3" variant="ghost" size="iconSm" onClick={() => setVisible(false)} aria-label={t("common.close")}>
        <X className="size-4" />
      </Button>
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/12 text-primary">
          <Trophy className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary/80">{t("toast.unlocked")}</div>
          <div className="mt-1 text-sm font-bold">{t("toast.title")}</div>
          <div className="mt-1 text-xs text-muted-foreground">{t("toast.description")}</div>
        </div>
      </div>
    </aside>
  );
}
