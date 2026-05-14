import { Link, useRouterState } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { getSidebarCounters, sidebarBadgeForHref, type SidebarCounters } from "@/components/layout/sidebarCounters";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes, tools, type RouteNavItem } from "@/routes";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";

export function Sidebar() {
  const location = useRouterState({ select: (state) => state.location.pathname });
  const { data: plan } = usePlanQuery();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { t } = useI18n();
  const counters = plan ? getSidebarCounters(plan) : undefined;
  const expanded = sidebarOpen;

  return (
    <aside
      className={cn(
        "sticky top-0 z-[var(--fp-z-sidebar)] flex h-screen w-[var(--sidebar-width)] flex-col overflow-hidden bg-[var(--fp-color-sidebar-bg)] text-[var(--fp-color-sidebar-text)] transition-[width] duration-[var(--fp-duration-normal)]",
        expanded ? "items-stretch" : "items-center",
        "max-[760px]:items-center",
      )}
    >
      <div className={cn("mt-7 flex items-center", expanded ? "px-5" : "justify-center", "max-[760px]:justify-center max-[760px]:px-0")}>
        <FinPlanLogo expanded={expanded} />
      </div>

      <nav className={cn("mt-10 grid gap-1.5", expanded ? "px-3" : "", "max-[760px]:px-0")}>
        {navigation.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href && item.href !== "/tracking"} counters={counters} expanded={expanded} />
        ))}
      </nav>

      <div className={cn("my-6 h-px bg-white/7", expanded ? "mx-5" : "w-8", "max-[760px]:mx-0 max-[760px]:w-8")} />

      <nav className={cn("grid gap-1.5", expanded ? "px-3" : "", "max-[760px]:px-0")}>
        {tools.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href} counters={counters} expanded={expanded} />
        ))}
      </nav>

      <div className={cn("my-6 h-px bg-white/7", expanded ? "mx-5" : "w-8", "max-[760px]:mx-0 max-[760px]:w-8")} />

      <nav className={cn("grid gap-1.5", expanded ? "px-3" : "", "max-[760px]:px-0")}>
        {systemRoutes.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href} counters={counters} expanded={expanded} />
        ))}
      </nav>

      <div className="flex-1" />
      <button
        type="button"
        className={cn(
          "mb-4 flex items-center rounded-[var(--fp-radius-lg)] text-[var(--fp-color-sidebar-text-muted)] transition hover:bg-[var(--fp-color-sidebar-hover)] hover:text-[var(--fp-color-sidebar-text)] max-[760px]:hidden",
          expanded ? "mx-3 h-10 w-[calc(100%-24px)] justify-start gap-3 px-3" : "mx-auto size-10 justify-center",
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={expanded ? t("sidebar.collapse") : t("sidebar.expand")}
        title={expanded ? t("sidebar.collapse") : t("sidebar.expand")}
      >
        {expanded ? <PanelLeftClose className="size-[17px]" /> : <PanelLeftOpen className="size-[17px]" />}
        {expanded && <span className="text-sm">{t("sidebar.collapse")}</span>}
      </button>
    </aside>
  );
}

function FinPlanLogo({ expanded }: { expanded: boolean }) {
  return (
    <Link to="/dashboard" className={cn("flex min-w-0 items-center", !expanded && "justify-center")} aria-label="FinPlan">
      {expanded && (
        <img
          className="h-10 w-[140px] object-contain max-[760px]:hidden"
          src="/brand/finplan-wordmark-on-dark.svg"
          width="162"
          height="64"
          alt="FinPlan"
          decoding="async"
        />
      )}
      {!expanded && (
        <img
          className="size-10 shrink-0 object-contain max-[760px]:size-8"
          src="/brand/finplan-app-icon.svg"
          width="40"
          height="40"
          alt="FinPlan"
          decoding="async"
        />
      )}
    </Link>
  );
}

function SidebarLink({ item, active, counters, expanded }: { item: RouteNavItem; active: boolean; counters?: SidebarCounters; expanded: boolean }) {
  const Icon = item.icon;
  const { t } = useI18n();
  const label = t(item.labelKey);
  const badge = sidebarBadgeForHref(item.href, counters);

  return (
    <Link
      to={item.href}
      title={label}
      aria-label={badge ? `${label}: ${badge}` : label}
      className={cn(
        "relative grid h-10 items-center rounded-[var(--fp-radius-lg)] transition max-[760px]:size-9 max-[760px]:place-items-center",
        expanded ? "grid-cols-[22px_1fr_auto] gap-3 px-3" : "size-10 place-items-center",
        "max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:px-0",
        active 
          ? "bg-[var(--fp-color-sidebar-soft)] text-[var(--fp-color-accent-gold)] font-semibold"
          : "text-[var(--fp-color-sidebar-text-muted)] hover:bg-[var(--fp-color-accent-gold)] hover:text-[var(--fp-color-primary)]",
      )}
    >
      {active && <span className="absolute -left-[12px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--fp-color-accent-gold)]" />}
      <Icon className="size-[18px] max-[760px]:size-4" />
      {expanded && <span className="truncate text-sm max-[760px]:hidden">{label}</span>}
      {expanded && badge !== undefined && <span className="grid size-5 place-items-center rounded-full bg-white/9 text-[10px] font-semibold max-[760px]:hidden">{badge}</span>}
      {!expanded && badge !== undefined && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--fp-color-accent-gold)]" aria-hidden="true" />}
    </Link>
  );
}
