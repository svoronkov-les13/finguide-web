import { FormEvent, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, Copy, Layers, LayoutDashboard, Loader2, LogOut, Plus } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useCopyPlanMutation, useCreatePlanMutation, usePlanQuery, usePlansQuery, useSwitchPlanMutation } from "@/api/planQueries";
import { useAuth } from "@/auth/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes, tools } from "@/routes";

type CreateMode = "blank" | "copy";

export function Topbar() {
  const auth = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: plan, isPending: planPending } = usePlanQuery();
  const { data: plans = [], isPending: plansPending } = usePlansQuery();
  const createPlan = useCreatePlanMutation();
  const copyPlan = useCopyPlanMutation();
  const switchPlan = useSwitchPlanMutation();
  const { t, locale, setLocale } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("blank");
  const [planNameInput, setPlanNameInput] = useState("");
  const route = useMemo(() => [...navigation, ...tools, ...systemRoutes].find((item) => item.href === pathname), [pathname]);
  const group = useMemo(() => {
    if (navigation.some((item) => item.href === pathname)) return { key: "groups.navigation", href: "/dashboard" };
    if (tools.some((item) => item.href === pathname)) return { key: "groups.tools", href: "/tracking" };
    if (systemRoutes.some((item) => item.href === pathname)) return { key: "groups.system", href: "/settings" };
    return { key: "groups.navigation", href: "/dashboard" };
  }, [pathname]);
  const routeLabel = route ? t(route.labelKey) : t("routes.dashboard");
  const currentPlan = plans.find((item) => item.current);
  const currentPlanId = currentPlan?.id ?? plan?.planId;
  const planName = currentPlan?.name ?? plan?.owner.planName ?? (planPending ? t("topbar.loadingPlan") : t("common.mainPlan"));
  const ownerName = auth.session?.profile?.name || auth.session?.profile?.preferredUsername || plan?.owner.name || (planPending ? t("topbar.loading") : t("topbar.guest"));
  const ownerInitials = initials(ownerName);
  const creating = createPlan.isPending || copyPlan.isPending;
  const planError = createPlan.error ?? copyPlan.error ?? switchPlan.error;

  function openCreateDialog(mode: CreateMode) {
    setCreateMode(mode);
    setPlanNameInput(mode === "copy" ? `${planName} copy` : "");
    setCreateOpen(true);
  }

  async function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = planNameInput.trim();
    if (!name) return;

    if (createMode === "copy" && currentPlanId) {
      await copyPlan.mutateAsync({ planId: currentPlanId, name });
    } else {
      await createPlan.mutateAsync(name);
    }

    setCreateOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-[var(--fp-z-topbar)] grid h-[52px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-6 border-b border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-6 max-[760px]:grid-cols-[1fr_auto] max-[760px]:gap-3 max-[760px]:px-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--fp-color-muted-foreground)]">
          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
            {route?.icon ? <route.icon className="size-3.5" /> : <LayoutDashboard className="size-3.5" />}
          </span>
          <Link to={group.href} className="max-[520px]:hidden transition-colors hover:text-[var(--fp-color-foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)] rounded-sm">
            {t(group.key as Parameters<typeof t>[0])}
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
              className="inline-flex h-9 max-w-[260px] items-center gap-3 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 text-sm text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)] outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--fp-color-primary)] max-[760px]:hidden"
            >
              <Layers className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)]" />
              <span className="min-w-0 truncate">{switchPlan.isPending ? t("topbar.switchingPlan") : planName}</span>
              <ChevronDown className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="center"
              className="z-[var(--fp-z-topbar)] mt-2 w-72 overflow-hidden rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-1.5 shadow-[var(--fp-shadow-card)]"
            >
              {plansPending && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--fp-color-muted-foreground)]">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("topbar.loadingPlan")}</span>
                </div>
              )}
              {plans.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  disabled={item.current || switchPlan.isPending}
                  onSelect={() => {
                    if (!item.current) void switchPlan.mutateAsync(item.id);
                  }}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)] data-[disabled]:cursor-default data-[disabled]:opacity-70"
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  {item.current && <Check className="size-4 shrink-0 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--fp-color-border)]" />
              <DropdownMenu.Item
                onSelect={() => openCreateDialog("blank")}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]"
              >
                <Plus className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)]" />
                <span>{t("topbar.createPlan")}</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled={!currentPlanId}
                onSelect={() => openCreateDialog("copy")}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)] data-[disabled]:cursor-default data-[disabled]:opacity-50"
              >
                <Copy className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)]" />
                <span>{t("topbar.copyCurrentPlan")}</span>
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
                  onClick={() => setLocale("ru")}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]"
                >
                  <span>{t("common.russian")}</span>
                  {locale === "ru" && <Check className="size-4 shrink-0 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setLocale("en")}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-[var(--fp-radius-md)] px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]"
                >
                  <span>{t("common.english")}</span>
                  {locale === "en" && <Check className="size-4 shrink-0 text-[var(--fp-color-primary)]" />}
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-[var(--fp-color-border)]" />

                <DropdownMenu.Item
                  onClick={() => auth.logout()}
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--fp-radius-md)] px-3 py-2.5 text-sm text-[var(--fp-color-danger)] outline-none transition-colors hover:bg-[var(--fp-color-surface-hover)] focus:bg-[var(--fp-color-surface-hover)]"
                >
                  <LogOut className="size-4 opacity-70" />
                  <span className="font-medium">{t("sidebar.logout")}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[min(440px,calc(100vw-32px))]">
          <DialogHeader>
            <DialogTitle className="text-base">{t("topbar.createPlan")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreatePlan}>
            <div className="grid grid-cols-2 rounded-[var(--fp-radius-md)] bg-[var(--fp-color-muted)] p-1 text-sm">
              <button
                type="button"
                onClick={() => setCreateMode("blank")}
                className={`rounded-[var(--fp-radius-sm)] px-3 py-2 font-medium transition ${createMode === "blank" ? "bg-[var(--fp-color-card)] text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)]" : "text-[var(--fp-color-muted-foreground)]"}`}
              >
                {t("topbar.createFromScratch")}
              </button>
              <button
                type="button"
                disabled={!currentPlanId}
                onClick={() => setCreateMode("copy")}
                className={`rounded-[var(--fp-radius-sm)] px-3 py-2 font-medium transition disabled:opacity-50 ${createMode === "copy" ? "bg-[var(--fp-color-card)] text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)]" : "text-[var(--fp-color-muted-foreground)]"}`}
              >
                {t("topbar.copyCurrent")}
              </button>
            </div>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[var(--fp-color-foreground)]">{t("topbar.planName")}</span>
              <input
                autoFocus
                value={planNameInput}
                onChange={(event) => setPlanNameInput(event.target.value)}
                placeholder={t("topbar.planNamePlaceholder")}
                className="h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-input)] px-5 text-sm text-[var(--fp-color-foreground)] outline-none transition-all hover:border-[var(--fp-color-border-hover)] focus:border-[var(--fp-color-border-strong)] focus:ring-2 focus:ring-[var(--fp-color-accent-gold)]/30"
              />
            </label>
            {planError && <div className="rounded-[var(--fp-radius-md)] bg-[var(--fp-color-danger)]/10 px-3 py-2 text-sm text-[var(--fp-color-danger)]">{t("topbar.planMutationError")}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="h-10 rounded-[var(--fp-radius-md)] border border-[var(--fp-color-border)] px-4 text-sm font-medium text-[var(--fp-color-foreground)] transition hover:bg-[var(--fp-color-surface-hover)]"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={creating || !planNameInput.trim() || (createMode === "copy" && !currentPlanId)}
                className="inline-flex h-10 items-center gap-2 rounded-[var(--fp-radius-md)] bg-[var(--fp-color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                <span>{creating ? t("topbar.creating") : t("topbar.create")}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
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
