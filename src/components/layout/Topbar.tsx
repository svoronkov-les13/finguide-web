import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, Languages, Layers, LayoutDashboard, Search, Sparkles } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes } from "@/routes";
import { useUiStore } from "@/store/uiStore";

export function Topbar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: plan } = usePlanQuery();
  const { locale, setLocale, t } = useI18n();
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const route = useMemo(() => [...navigation, ...systemRoutes].find((item) => item.href === pathname), [pathname]);
  const routeLabel = route ? t(route.labelKey) : t("routes.dashboard");

  return (
    <header className="sticky top-0 z-30 grid h-[52px] grid-cols-[auto_minmax(260px,340px)_auto] items-center gap-5 border-b border-border/80 bg-background/94 px-5 backdrop-blur-2xl max-[1120px]:grid-cols-[auto_1fr] max-[760px]:grid-cols-1 max-[760px]:px-4">
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border/80 bg-card/70">
          {route?.icon ? <route.icon className="size-3.5" /> : <LayoutDashboard className="size-3.5" />}
        </span>
        <span>{t("common.overview")}</span>
        <span>/</span>
        <strong className="truncate text-foreground">{routeLabel}</strong>
      </div>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 text-left text-xs text-muted-foreground shadow-soft transition hover:bg-surface max-[760px]:hidden"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{t("common.searchPlaceholder")}</span>
        <kbd className="grid size-5 place-items-center rounded-full border border-border text-[10px]">⌘</kbd>
        <kbd className="grid size-5 place-items-center rounded-full border border-border text-[10px]">K</kbd>
      </button>

      <div className="flex items-center justify-end gap-3 max-[1120px]:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
          aria-label={t("common.language")}
          title={locale === "ru" ? t("common.english") : t("common.russian")}
        >
          <Languages className="size-3.5 text-primary" />
          {locale.toUpperCase()}
        </Button>
        <Button variant="secondary" size="sm">
          <Layers className="size-3.5 text-primary" />
          {plan?.owner.planName ?? t("common.mainPlan")}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
        <button className="relative grid size-8 place-items-center rounded-full bg-[#12101c] text-xs font-bold text-white" type="button" aria-label={t("common.notifications")}>
          <Bell className="size-3.5" />
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#12101c] text-[9px]">2</span>
        </button>
        <div className="grid grid-cols-[28px_auto] items-center gap-x-2">
          <span className="row-span-2 grid size-7 place-items-center rounded-full border border-border bg-muted text-[10px] font-bold">АП</span>
          <strong className="max-w-[120px] truncate text-xs">{plan?.owner.name ?? "Александр Петр..."}</strong>
          <small className="text-[10px] text-muted-foreground">{plan?.owner.tier ?? t("common.pro")}</small>
        </div>
      </div>

      <Sparkles className="absolute right-4 top-1/2 hidden size-4 -translate-y-1/2 text-primary max-[760px]:block" />
    </header>
  );
}
