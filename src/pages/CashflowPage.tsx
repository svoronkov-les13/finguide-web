import { useState, useRef, useEffect } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Plus, Info, Sparkles, ArrowRight, TrendingUp, Calendar, Zap, RotateCw } from "lucide-react";
import { useAddCashflowMutation, useDeleteCashflowMutation, usePlanQuery, useUpdateCashflowMutation } from "@/api/planQueries";
import { CashflowSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Cashflow } from "@/types/finance";
import { CashflowCard } from "@/components/cashflow/CashflowCard";
import { CashflowModal } from "@/components/cashflow/CashflowModal";
import { CashflowEmptyState } from "@/components/cashflow/CashflowEmptyState";
import { CashflowInstructionModal } from "@/components/cashflow/CashflowInstructionModal";
import { CashflowCalculationDetailsModal } from "@/components/cashflow/CashflowCalculationDetailsModal";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { useFormat } from "@/lib/useFormat";

type CashflowColumn = {
  id: "monthly" | "yearly" | "onetime";
  titleKey: "cashflow.monthly" | "cashflow.yearly" | "cashflow.onetime";
  defaultFrequency: Cashflow["frequency"];
  accentColor: string;
  icon: React.ReactNode;
};

const getStoredOrder = (planId: string, type: string, frequency: string): string[] => {
  try {
    const raw = localStorage.getItem(`finguide.cashflow-order.${planId}.${type}.${frequency}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredOrder = (planId: string, type: string, frequency: string, order: string[]) => {
  try {
    localStorage.setItem(`finguide.cashflow-order.${planId}.${type}.${frequency}`, JSON.stringify(order));
  } catch {
    // ignore
  }
};

export function CashflowPage({ type }: { type: "income" | "expense" }) {
  const { t } = useI18n();
  const { formatRub } = useFormat();
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

  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  useEffect(() => {
    if (plan?.planId) {
      const pId = plan.planId;
      const mOrder = getStoredOrder(pId, type, "monthly");
      const yOrder = getStoredOrder(pId, type, "yearly");
      const oOrder = getStoredOrder(pId, type, "onetime");
      Promise.resolve().then(() => {
        setOrders({
          monthly: mOrder,
          yearly: yOrder,
          onetime: oOrder,
        });
      });
    }
  }, [plan?.planId, type]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, frequency: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const colItems = items.filter((i) => i.frequency === frequency);
    const freqOrder = orders[frequency] ?? [];

    const sortedItems = [...colItems].sort((a, b) => {
      const idxA = freqOrder.indexOf(a.id);
      const idxB = freqOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    const draggedIdx = sortedItems.findIndex((i) => i.id === draggedItemId);
    const targetIdx = sortedItems.findIndex((i) => i.id === targetId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const [draggedItem] = sortedItems.splice(draggedIdx, 1);
      sortedItems.splice(targetIdx, 0, draggedItem);

      const newOrder = sortedItems.map((i) => i.id);

      setOrders((prev) => ({
        ...prev,
        [frequency]: newOrder,
      }));
      if (plan?.planId) {
        setStoredOrder(plan.planId, type, frequency, newOrder);
      }
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  if (!plan) return <CashflowSkeleton />;

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

  const handleSubmit = (data: Partial<Cashflow>) => {
    const frequency = data.frequency || "monthly";
    const category = data.category || t(`cashflow.defaultCategoryMonthly_${type}` as Parameters<typeof t>[0]);
    const closeModal = () => setDrawerOpen(false);

    if (data.id) {
      updateCashflow.mutate(
        { id: data.id, patch: { ...data, category, frequency } },
        { onSuccess: closeModal },
      );
    } else {
      addCashflow.mutate(
        {
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
        } as Cashflow,
        { onSuccess: closeModal },
      );
    }
  };

  const handleDelete = () => {
    if (editingItem?.id) {
      deleteCashflow.mutate(editingItem.id, { onSuccess: () => setDrawerOpen(false) });
    }
  };

  return (
    <Page bottom={false} scrollable={false}>
      <PageHeader
        back
        title={t(`cashflow.${type}`)}
        actions={
          <>
            <button
              onClick={() => setInstructionOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
            >
              <Info className="size-4" />
            </button>
            <Button
              variant="secondary"
              className="max-[760px]:hidden"
              onClick={() => setInstructionOpen(true)}
            >
              {t("cashflow.viewExample")}
            </Button>
            <Button variant="default" onClick={() => handleAddItem("monthly")}>
              <Plus className="size-4 shrink-0" />
              {t("cashflow.add")}
            </Button>
            {items.length > 0 && (
              <Button
                variant={isCompact ? "active" : "secondary"}
                onClick={() => setIsCompact(!isCompact)}
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">{t("cashflow.compact")}</span>
              </Button>
            )}
          </>
        }
      />

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
                ? "border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface-hover)] text-[var(--fp-color-foreground)] font-bold"
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
                  ? "border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface-hover)] text-[var(--fp-color-foreground)] font-bold"
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
          "grid items-stretch gap-x-5 gap-y-8 flex-1 min-h-0",
          activeFilter === "all" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-[500px]"
        )}>
          {columns.filter(col => activeFilter === "all" || col.id === activeFilter).map((column) => {
            const freqOrder = orders[column.id] ?? [];
            const colItems = items
              .filter((i) => i.frequency === column.id)
              .sort((a, b) => {
                const idxA = freqOrder.indexOf(a.id);
                const idxB = freqOrder.indexOf(b.id);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
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
              <CashflowColumn
                key={column.id}
                column={column}
                colItems={colItems}
                colTotalYear={colTotalYear}
                colTotalMonth={colTotalMonth}
                isCompact={isCompact}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                t={t}
                draggedItemId={draggedItemId}
                dragOverItemId={dragOverItemId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                startYear={plan.settings.startYear}
              />
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
        saving={addCashflow.isPending || updateCashflow.isPending}
        deleting={deleteCashflow.isPending}
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
    </Page>
  );
}

interface CashflowColumnProps {
  column: {
    id: "monthly" | "yearly" | "onetime";
    titleKey: "cashflow.monthly" | "cashflow.yearly" | "cashflow.onetime";
    defaultFrequency: Cashflow["frequency"];
    accentColor: string;
    icon: React.ReactNode;
  };
  colItems: Cashflow[];
  colTotalYear: number;
  colTotalMonth: number;
  isCompact: boolean;
  onAddItem: (frequency: Cashflow["frequency"]) => void;
  onEditItem: (item: Cashflow) => void;
  t: ReturnType<typeof useI18n>["t"];
  draggedItemId?: string | null;
  dragOverItemId?: string | null;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, id: string, frequency: string) => void;
  startYear: number;
}

function CashflowColumn({
  column,
  colItems,
  colTotalYear,
  colTotalMonth,
  isCompact,
  onAddItem,
  onEditItem,
  t,
  draggedItemId,
  dragOverItemId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  startYear,
}: CashflowColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatRub } = useFormat();
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  // Generate dynamic sparkline based on the real API / cashflow items
  const horizon = 20;
  const yearlyValues: number[] = [];
  
  for (let year = startYear; year < startYear + horizon; year++) {
    let yearSum = 0;
    colItems.forEach((item) => {
      if (!item.enabled) return;
      
      const isStarted = year >= item.startYear;
      const isNotEnded = item.endYear === null || year <= item.endYear;
      
      if (isStarted && isNotEnded) {
        const t = year - item.startYear;
        const growthFactor = Math.pow(1 + (item.growth ?? 0) / 100, t);
        const yearlyAmount = item.frequency === "monthly" 
          ? (item.amount * 12) * growthFactor 
          : item.amount * growthFactor;
        
        yearSum += yearlyAmount;
      }
    });
    yearlyValues.push(yearSum);
  }

  const minVal = Math.min(...yearlyValues);
  const maxVal = Math.max(...yearlyValues);
  const points: { x: number; y: number }[] = [];
  const width = 96;
  const height = 32;
  const paddingBottom = 4;
  const paddingTop = 4;
  const chartHeight = height - paddingTop - paddingBottom; // 24px

  yearlyValues.forEach((val, i) => {
    const x = (i / (horizon - 1)) * width;
    let y = height - paddingBottom; // default bottom
    
    if (maxVal > minVal) {
      const pct = (val - minVal) / (maxVal - minVal);
      y = height - paddingBottom - pct * chartHeight;
    } else if (maxVal > 0) {
      y = height / 2;
    }
    points.push({ x, y });
  });

  const strokePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${strokePath} L96,32 L0,32 Z`;

  const updateScrollbar = () => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight > clientHeight) {
      setShowScrollbar(true);
      let h = clientHeight * (clientHeight / scrollHeight);
      h = Math.max(h, 24); // min 24px height
      setThumbHeight(h);

      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop = clientHeight - h;
      const topPos = (scrollTop / maxScrollTop) * maxThumbTop;
      setThumbTop(topPos);
    } else {
      setShowScrollbar(false);
    }
  };

  useEffect(() => {
    // Initial update
    updateScrollbar();
    // Use a small delay/timeout to let layout and children settle
    const timer = setTimeout(updateScrollbar, 50);

    const observer = new ResizeObserver(updateScrollbar);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [colItems, isCompact]);

  return (
    <div className="flex flex-col h-full min-h-[220px]">
      {/* Column header */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className="mt-1 w-1 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: column.accentColor, minHeight: 48 }}
        />
        <div className="flex flex-1 items-start justify-between min-w-0">
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
            <div className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">
              {colItems.length > 0 ? (
                <>
                  <span>{t("cashflow.total")} </span>
                  <span className="font-semibold" style={{ color: column.accentColor }}>
                    {formatRub(colTotalYear)}
                  </span>
                  <span> {t("cashflow.perYear")}</span>
                  <div className="text-xs">{t("cashflow.avgPerMonth", { amount: formatRub(colTotalMonth) })}</div>
                </>
              ) : (
                <>
                  <span>{t("cashflow.noRecords")}</span>
                  <div className="text-xs opacity-0">—</div>
                </>
              )}
            </div>
          </div>
          {/* Sparkline */}
          <div className="mt-2 hidden h-8 w-16 opacity-40 sm:block xl:w-24">
            <svg viewBox="0 0 96 32" className="size-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`spark-fill-${column.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={column.accentColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={column.accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={fillPath}
                fill={`url(#spark-fill-${column.id})`}
              />
              <path
                d={strokePath}
                fill="none" stroke={column.accentColor} strokeWidth="2" opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddItem(column.defaultFrequency)}
        className="mb-3 ml-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] py-3.5 text-sm font-medium text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]"
      >
        <Plus className="size-4" />
        {t("cashflow.add")}
      </button>

      {/* Scrollable Container with simulated custom scrollbar on the left */}
      <div className="relative flex-1 min-h-0 flex gap-3">
        {/* simulated custom scrollbar rail (w-1 = 4px) */}
        <div className="w-1 flex-shrink-0 relative h-full">
          {/* Always visible light track line as continuation of the header line */}
          <div
            className="absolute inset-y-0 left-0 w-full rounded-full opacity-10"
            style={{ backgroundColor: column.accentColor }}
          />

          {/* Interactive thumb pill */}
          {showScrollbar && (
            <div
              className="absolute left-0 w-full rounded-full transition-transform duration-75"
              style={{
                backgroundColor: column.accentColor,
                height: `${thumbHeight}px`,
                transform: `translateY(${thumbTop}px)`,
              }}
            />
          )}
        </div>

        {/* Real hidden-scrollbar scrollable cards box */}
        <div
          ref={containerRef}
          onScroll={updateScrollbar}
          className="flex-1 overflow-y-auto hide-scrollbar"
        >
          <div className="flex flex-col gap-3 pb-4">
            {colItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-[var(--fp-color-muted-foreground)]">
                <span
                  className="grid size-10 place-items-center rounded-full"
                  style={{ backgroundColor: `${column.accentColor}12`, color: column.accentColor, opacity: 0.5 }}
                >
                  {column.icon}
                </span>
                <span className="text-sm">{t("cashflow.noRecords")}</span>
              </div>
            ) : (
              colItems.map((item) => (
                <CashflowCard
                  key={item.id}
                  item={item}
                  compact={isCompact}
                  onClick={() => onEditItem(item)}
                  draggable
                  onDragStart={(e) => onDragStart?.(e, item.id)}
                  onDragEnd={() => {
                    // Handled inside drop if needed
                  }}
                  onDragOver={(e) => onDragOver?.(e, item.id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop?.(e, item.id, column.id)}
                  isDragging={draggedItemId === item.id}
                  isDragOver={dragOverItemId === item.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
