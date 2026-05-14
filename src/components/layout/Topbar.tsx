import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, Layers, LayoutDashboard, LogOut, Plus, Settings } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePlanQuery } from "@/api/planQueries";
import { useAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes, tools } from "@/routes";

export function Topbar() {
  const auth = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: plan, isPending: planPending } = usePlanQuery();
  const { t } = useI18n();
  const route = useMemo(() => [...navigation, ...tools, ...systemRoutes].find((item) => item.href === pathname), [pathname]);
  const group = useMemo(() => {
    if (navigation.some((item) => item.href === pathname)) return { key: "groups.navigation", href: "/dashboard" };
    if (tools.some((item) => item.href === pathname)) return { key: "groups.tools", href: "/tracking" };
    if (systemRoutes.some((item) => item.href === pathname)) return { key: "groups.system", href: "/settings" };
    return { key: "groups.navigation", href: "/dashboard" };
  }, [pathname]);
  const routeLabel = route ? t(route.labelKey) : t("routes.dashboard");
  const planName = plan?.owner.planName ?? (planPending ? t("topbar.loadingPlan") : t("common.mainPlan"));
  const ownerName = auth.session?.profile?.name || auth.session?.profile?.preferredUsername || plan?.owner.name || (planPending ? t("topbar.loading") : t("topbar.guest"));
  const ownerInitials = initials(ownerName);

  return (
    <header className="sticky top-0 z-[var(--fp-z-topbar)] grid h-[52px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-6 border-b border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-6 max-[760px]:grid-cols-[1fr_auto] max-[760px]:gap-3 max-[760px]:px-4">
      <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--fp-color-muted-foreground)]">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
          {route?.icon ? <route.icon className="size-3.5" /> : <LayoutDashboard className="size-3.5" />}
        </span>
        <Link to={group.href} className="max-[520px]:hidden transition-colors hover:text-[var(--fp-color-foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)] rounded-sm">
          {t(group.key as any)}
        </Link>
        <span className="max-[520px]:hidden">/</span>
        <Link to={route?.href ?? "/dashboard"} className="truncate text-[var(--fp-color-foreground)] transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)] rounded-sm">
          <strong>{routeLabel}</strong>
        </Link>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-3 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 text-sm text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)] transition hover:bg-[var(--fp-color-surface)] max-[760px]:hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)]"
          >
            <Layers className="size-4 text-[var(--fp-color-muted-foreground)]" />
            <span className="max-w-[190px] truncate">{planName}</span>
            <ChevronDown className="size-4 text-[var(--fp-color-muted-foreground)]" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-[var(--fp-z-topbar)] mt-2 min-w-[240px] overflow-hidden rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-1.5 shadow-[var(--fp-shadow-card)]"
          >
            <DropdownMenu.Item className="flex cursor-pointer items-center justify-between gap-2 rounded-[var(--fp-radius-md)] px-3 py-2.5 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]">
              <span className="truncate">{planName}</span>
              <Check className="size-4 shrink-0 text-[var(--fp-color-primary)]" />
            </DropdownMenu.Item>
            
            <DropdownMenu.Separator className="my-1 h-px bg-[var(--fp-color-border)]" />
            
            <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm text-[var(--fp-color-muted-foreground)] outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)] focus:bg-[var(--fp-color-surface-hover)] focus:text-[var(--fp-color-foreground)]">
              <Settings className="size-4 shrink-0" />
              <span>{t("topbar.managePlans", "Управление планами")}</span>
            </DropdownMenu.Item>
            
            <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm text-[var(--fp-color-primary)] outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]">
              <Plus className="size-4 shrink-0" />
              <span className="font-medium">{t("topbar.createPlan", "Создать новый план")}</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <div className="flex min-w-0 items-center gap-3 border-l border-[var(--fp-color-border)] pl-6 max-[760px]:border-l-0 max-[760px]:pl-0">
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-muted)] text-[11px] font-semibold text-[var(--fp-color-foreground)]">
          {ownerInitials}
        </span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="flex min-w-0 items-center gap-2 text-left text-sm outline-none max-[760px]:hidden">
              <span className="max-w-[180px] truncate">{ownerName}</span>
              <ChevronDown className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-[var(--fp-z-topbar)] mt-2 min-w-48 overflow-hidden rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-1.5 shadow-[var(--fp-shadow-card)]"
            >
              <DropdownMenu.Item
                onClick={() => auth.logout()}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2.5 text-sm text-red-500 outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]"
              >
                <LogOut className="size-4 opacity-70" />
                <span className="font-medium">{t("sidebar.logout")}</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return letters || "FP";
}
