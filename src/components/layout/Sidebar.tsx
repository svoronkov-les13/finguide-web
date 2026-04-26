import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, LogOut, PanelLeftOpen, ShieldCheck, Zap } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes, tools, type RouteNavItem } from "@/routes";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useRouterState({ select: (state) => state.location.pathname });
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const collapsed = !sidebarOpen;

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-screen min-w-0 flex-col overflow-hidden border-r border-primary/12 bg-sidebar text-sidebar-text transition-[width] max-[1120px]:w-[72px]",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_0%,rgba(189,150,44,0.18),transparent_68%)]" />
      <div className={cn("relative flex items-center gap-3 px-6 pb-7 pt-6", collapsed && "justify-center px-0")}>
        <div className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/35 bg-primary/12 shadow-[0_0_26px_rgba(189,150,44,0.14)]">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0 uppercase max-[1120px]:hidden">
            <div className="text-xs font-bold tracking-[0.2em] text-sidebar-text/35">{t("common.appName")}</div>
            <div className="text-[10px] font-bold tracking-[0.16em] text-primary/80">{t("common.privateBanking")}</div>
          </div>
        )}
      </div>

      <SidebarGroup label={t("groups.navigation")} collapsed={collapsed}>
        {navigation.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href} collapsed={collapsed} />
        ))}
      </SidebarGroup>
      <SidebarGroup label={t("groups.tools")} collapsed={collapsed}>
        {tools.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href} collapsed={collapsed} />
        ))}
      </SidebarGroup>
      <SidebarGroup label={t("groups.system")} collapsed={collapsed}>
        {systemRoutes.map((item) => (
          <SidebarLink key={item.href} item={item} active={location === item.href} collapsed={collapsed} />
        ))}
      </SidebarGroup>

      <div className="flex-1" />
      {!collapsed && (
          <div className="mx-4 mb-4 rounded-[22px] border border-primary/18 bg-primary/8 p-3 max-[1120px]:hidden">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-text/60">
            <Zap className="size-3 text-primary" /> {t("sidebar.balanceYear")}
          </div>
          <div className="mt-2 text-xl font-bold text-[#ffe180]">+1.9M ₽</div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[39%] rounded-full bg-primary" />
          </div>
          <div className="mt-1 text-right text-[10px] text-sidebar-text/50">39%</div>
        </div>
      )}
      <button
        className={cn("mx-3 mb-3 flex h-10 items-center justify-center gap-2 rounded-[24px] text-sm text-sidebar-text/75 hover:bg-white/5", collapsed && "mx-3")}
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={collapsed ? t("common.expandMenu") : t("common.collapseMenu")}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <ChevronsLeft className="size-4" />}
        {!collapsed && <span className="max-[1120px]:hidden">{t("common.collapse")}</span>}
      </button>
      <div className={cn("mx-3 mb-4 flex items-center gap-3 rounded-[24px] p-3", collapsed && "justify-center")}>
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">АП</div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 max-[1120px]:hidden">
              <div className="truncate text-xs font-semibold text-sidebar-text/45">{plan?.owner.name ?? "Александр Петров"}</div>
              <div className="truncate text-xs text-sidebar-text/80">{plan?.owner.email ?? "alex.petrov@email.com"}</div>
            </div>
            <LogOut className="size-4 text-sidebar-text/40 max-[1120px]:hidden" />
          </>
        )}
      </div>
    </aside>
  );
}

interface SidebarGroupProps {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}

function SidebarGroup({ label, collapsed, children }: SidebarGroupProps) {
  return (
    <div className="relative mb-3">
      {!collapsed && <div className="mx-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-text/55 max-[1120px]:hidden">{label}</div>}
      <nav className="grid gap-1 px-3">{children}</nav>
    </div>
  );
}

function SidebarLink({ item, active, collapsed }: { item: RouteNavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  const { t } = useI18n();
  const label = t(item.labelKey);
  return (
    <Link
      to={item.href}
      title={label}
      className={cn(
        "relative grid min-h-[38px] grid-cols-[22px_1fr_auto] items-center gap-3 rounded-[22px] border border-transparent px-3 text-sm font-medium text-[#c4baa8] transition hover:bg-white/5",
        active && "border-primary/24 bg-primary/12 text-[#ffe082] shadow-[0_0_16px_rgba(189,150,44,0.08)]",
        collapsed && "flex justify-center px-0",
        "max-[1120px]:flex max-[1120px]:justify-center max-[1120px]:px-0",
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />}
      <Icon className="size-[18px]" />
      {!collapsed && <span className="truncate max-[1120px]:hidden">{label}</span>}
      {!collapsed && item.badge && <span className="grid size-6 place-items-center rounded-full bg-white/10 text-[11px] font-bold max-[1120px]:hidden">{item.badge}</span>}
    </Link>
  );
}
