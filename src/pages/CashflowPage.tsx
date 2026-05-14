import { useState } from "react";
import { Plus, ChevronLeft, Info, Sparkles, ArrowRight, TrendingUp, Calendar, Zap, RotateCw } from "lucide-react";
import { useAddCashflowMutation, useDeleteCashflowMutation, usePlanQuery, useUpdateCashflowMutation } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { cn, formatRub } from "@/lib/utils";
import type { Cashflow } from "@/types/finance";
import { CashflowCard } from "@/components/cashflow/CashflowCard";
import { CashflowModal } from "@/components/cashflow/CashflowModal";
import { CashflowEmptyState } from "@/components/cashflow/CashflowEmptyState";
import { CashflowInstructionModal } from "@/components/cashflow/CashflowInstructionModal";
import { CashflowCalculationDetailsModal } from "@/components/cashflow/CashflowCalculationDetailsModal";
import { Link, useRouter } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

type CashflowColumn = {
  id: "monthly" | "yearly" | "onetime";
  titleKey: "cashflow.monthly" | "cashflow.yearly" | "cashflow.onetime";
  defaultFrequency: Cashflow["frequency"];
  accentColor: string;
  icon: React.ReactNode;
};

export function CashflowPage({ type }: { type: "income" | "expense" }) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: plan } = usePlanQuery();
  const addCashflow = useAddCashflowMutation();
  const updateCashflow = useUpdateCashflowMutation();
  const deleteCashflow = useDeleteCashflowMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Cashflow> | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [calcDetailsOpen, setCalcDetailsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "monthly" | "yearly" | "onetime">("all");

  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const items = plan.cashflows.filter((item) => item.type === type);
  const nextRoute = type === "income" ? "/expenses" : "/goals";

  const totalYear = items.reduce((sum, i) => {
    if (!i.enabled) return sum;
    return sum + (i.frequency === "monthly" ? i.amount * 12 : i.amount);
  }, 0);
  const totalMonth = items.reduce((sum, i) => {
    if (!i.enabled) return sum;
    return sum + (i.frequency === "monthly" ? i.amount : Math.round(i.amount / 12));
  }, 0);

  const columns: CashflowColumn[] = [
    {
      id: "monthly",
      titleKey: "cashflow.monthly",
      defaultFrequency: "monthly",
      accentColor: type === "income" ? "#2D8B5E" : "#C75D3A",
      icon: <RotateCw className="size-4" />,
    },
    {
      id: "yearly",
      titleKey: "cashflow.yearly",
      defaultFrequency: "yearly",
      accentColor: type === "income" ? "#D4A843" : "#D4A843",
      icon: <Calendar className="size-4" />,
    },
    {
      id: "onetime",
      titleKey: "cashflow.onetime",
      defaultFrequency: "onetime",
      accentColor: type === "income" ? "#5B8DB8" : "#5B8DB8",
      icon: <Zap className="size-4" />,
    },
  ];

  const handleAddItem = (defaultFrequency: Cashflow["frequency"]) => {
    setEditingItem({ frequency: defaultFrequency });
    setDrawerOpen(true);
  };

  const handleEditItem = (item: Cashflow) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleToggleItem = (id: string, enabled: boolean) => {
    updateCashflow.mutate({ id, patch: { enabled } });
  };

  const handleSubmit = (data: Partial<Cashflow>) => {
    const frequency = data.frequency || "monthly";
    const category = data.category || t(`cashflow.defaultCategoryMonthly_${type}` as any);

    if (data.id) {
      updateCashflow.mutate({ id: data.id, patch: { ...data, category, frequency } });
    } else {
      addCashflow.mutate({
        ...data,
        type,
        name: data.name || t("cashflow.newEntry"),
        amount: data.amount || 0,
        currency: data.currency || "RUB",
        category,
        frequency,
        startYear: data.startYear || plan.settings.startYear,
        endYear: data.endYear ?? null,
        growth: data.growth || 0,
        enabled: data.enabled ?? true,
      } as Cashflow);
    }
  };

  const handleDelete = () => {
    if (editingItem?.id) {
      deleteCashflow.mutate(editingItem.id);
      setDrawerOpen(false);
    }
  };

  return (
    <div className="grid max-w-[1400px] gap-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
          >
            <ChevronLeft className="size-4" />
            {t("cashflow.back")}
          </button>
          <h1 className="text-3xl font-bold text-[var(--fp-color-foreground)]">{t(`cashflow.${type}`)}</h1>
          <button 
            onClick={() => setInstructionOpen(true)}
            className="grid size-5 place-items-center rounded-full border border-[var(--fp-color-border)] text-xs text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
          >
            <Info className="size-3" />
          </button>
          <button className="hidden sm:block rounded-full border border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] px-5 py-2 text-sm font-medium text-[var(--fp-color-background)] transition-colors hover:opacity-90">
            {t("cashflow.viewExample")}
          </button>
        </div>
        {items.length > 0 && (
          <button 
            onClick={() => setIsCompact(!isCompact)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
              isCompact 
                ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-surface-hover)] text-[var(--fp-color-foreground)]" 
                : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
            )}
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">{t("cashflow.compact")}</span>
          </button>
        )}
      </header>

      {/* Stats bar */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setCalcDetailsOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm transition-colors hover:bg-[var(--fp-color-surface-hover)]"
          >
            <Calendar className="size-4 text-[var(--fp-color-muted-foreground)]" />
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("cashflow.year")}</span>
            <span className="font-bold text-[var(--fp-color-foreground)]">{formatRub(totalYear)}</span>
          </button>
          <button 
            onClick={() => setCalcDetailsOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm transition-colors hover:bg-[var(--fp-color-surface-hover)]"
          >
            <Calendar className="size-4 text-[var(--fp-color-muted-foreground)]" />
            <span className="font-medium text-[var(--fp-color-muted-foreground)]">{t("cashflow.month")}</span>
            <span className="font-bold text-[var(--fp-color-foreground)]">{formatRub(totalMonth)}</span>
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 py-2.5 text-sm text-[var(--fp-color-muted-foreground)]">
            <TrendingUp className="size-4" />
            {items.length === 1
              ? t("cashflow.sourceCount", { count: String(items.length) })
              : items.length > 1 && items.length < 5
                ? t("cashflow.sourceCountFew", { count: String(items.length) })
                : t("cashflow.sourceCountMany", { count: String(items.length) })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeFilter === "all"
                ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] text-white"
                : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
            )}
          >
            {t("cashflow.all")}
          </button>
          {columns.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveFilter(col.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === col.id
                  ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-foreground)] text-white"
                  : "border-[var(--fp-color-border)] bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
              )}
            >
              {t(col.titleKey)}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {items.length === 0 ? (
        <CashflowEmptyState type={type} onAdd={() => handleAddItem("monthly")} className="mt-4" />
      ) : (
        <div className={cn(
          "grid items-start gap-x-5 gap-y-8",
          activeFilter === "all" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-[500px]"
        )}>
          {columns.filter(col => activeFilter === "all" || col.id === activeFilter).map((column) => {
            const colItems = items.filter(i => {
              // Map the actual data to the columns more robustly.
              // Relying on `i.category` string match was a bit hacky before. Let's use `frequency`.
              return i.frequency === column.id;
            });

            const colTotalYear = colItems.reduce((sum, item) => {
              if (!item.enabled) return sum;
              return sum + (item.frequency === "monthly" ? item.amount * 12 : item.amount);
            }, 0);
            const colTotalMonth = colItems.reduce((sum, item) => {
              if (!item.enabled) return sum;
              return sum + (item.frequency === "monthly" ? item.amount : Math.round(item.amount / 12));
            }, 0);

            return (
              <div key={column.id} className="flex flex-col">
                {/* Column header */}
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className="mt-1 w-1 self-stretch rounded-full"
                    style={{ backgroundColor: column.accentColor, minHeight: 48 }}
                  />
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="grid size-7 place-items-center rounded-full"
                          style={{ backgroundColor: `${column.accentColor}15`, color: column.accentColor }}
                        >
                          {column.icon}
                        </span>
                        <span className="font-semibold text-[var(--fp-color-foreground)]">{t(column.titleKey)}</span>
                        <span
                          className="grid size-5 place-items-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: column.accentColor }}
                        >
                          {colItems.length}
                        </span>
                      </div>
                      {colItems.length > 0 ? (
                        <div className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">
                          <span>{t("cashflow.total")} </span>
                          <span className="font-semibold" style={{ color: column.accentColor }}>
                            {formatRub(colTotalYear)}
                          </span>
                          <span> {t("cashflow.perYear")}</span>
                          <div className="text-xs">{t("cashflow.avgPerMonth", { amount: formatRub(colTotalMonth) })}</div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">{t("cashflow.noRecords")}</div>
                      )}
                    </div>
                    {/* Mini sparkline placeholder */}
                    <div className="mt-2 hidden h-8 w-16 opacity-30 sm:block xl:w-24">
                      <svg viewBox="0 0 96 32" className="size-full" preserveAspectRatio="none">
                        <path
                          d={column.id === "monthly" ? "M0,28 Q24,20 48,18 T96,8" : column.id === "yearly" ? "M0,16 L96,16" : "M0,20 Q16,12 32,20 T64,20 T96,20"}
                          fill="none"
                          stroke={column.accentColor}
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAddItem(column.defaultFrequency)}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] py-3.5 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
                >
                  <Plus className="size-4" />
                  {t("cashflow.add")}
                </button>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {colItems.map((item) => (
                    <CashflowCard
                      key={item.id}
                      item={item}
                      compact={isCompact}
                      onClick={() => handleEditItem(item)}
                      onToggle={(enabled) => handleToggleItem(item.id, enabled)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom nav */}
      <div className="flex justify-end pt-4">
        <Link
          to={nextRoute}
          className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 py-2.5 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
        >
          {type === "income" ? t("cashflow.goToExpenses") : t("cashflow.goToGoals")}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <CashflowModal
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={editingItem}
        type={type}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <CashflowInstructionModal
        open={instructionOpen}
        onOpenChange={setInstructionOpen}
        type={type}
      />

      <CashflowCalculationDetailsModal
        open={calcDetailsOpen}
        onOpenChange={setCalcDetailsOpen}
        type={type}
        totalYear={totalYear}
        totalMonth={totalMonth}
        itemsCount={items.filter((i) => i.enabled).length}
        startYear={plan.settings.startYear}
      />
    </div>
  );
}
