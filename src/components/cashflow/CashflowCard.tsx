import { ChevronDown, GripVertical, TrendingUp } from "lucide-react";
import type { Cashflow } from "@/types/finance";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { useFormat } from "@/lib/useFormat";

export function CashflowCard({
  item,
  onClick,
  onToggle,
  compact,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  isDragOver,
}: {
  item: Cashflow;
  onClick: () => void;
  onToggle?: (enabled: boolean) => void;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}) {
  const { t } = useI18n();
  const { formatRub, formatUsd } = useFormat();
  const formatMoney = (amount: number, currency: string) => {
    return currency === "USD" ? formatUsd(amount) : formatRub(amount);
  };

  const isMonthly = item.frequency === "monthly" || item.category.toLowerCase().includes("monthly");
  const yearlyAmount = isMonthly ? item.amount * 12 : item.amount;
  const monthlyAmount = isMonthly ? item.amount : Math.round(item.amount / 12);
  const growthPct = Math.round(item.growth * 100);
  const endLabel = !item.endYear || item.endYear > item.startYear + 50 ? t("cashflow.indefinite") : `${item.endYear}`;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-[var(--fp-color-card)] px-4 transition-all",
        item.enabled ? "border-[var(--fp-color-border)] hover:border-[var(--fp-color-border-hover)] hover:shadow-[var(--fp-shadow-card)]" : "border-dashed border-[var(--fp-color-border)] opacity-50",
        compact ? "py-2" : "py-3.5",
        isDragging ? "opacity-35 scale-[0.98] border-[var(--fp-color-primary)]" : "",
        isDragOver ? "border-t-2 border-t-[var(--fp-color-primary)] bg-[var(--fp-color-surface)] shadow-sm" : ""
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <GripVertical className="size-4 shrink-0 text-[var(--fp-color-border)]" />

      {/* Dot */}
      <div className="size-1.5 shrink-0 rounded-full bg-[var(--fp-color-muted-foreground)]" />

      {/* Left: Name + dates */}
      <div className="min-w-0 flex-1">
        <div className={cn("truncate font-semibold text-[var(--fp-color-foreground)]", compact ? "text-xs" : "text-sm")}>{item.name}</div>
        {!compact && (
          <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)]">
            {item.startYear ? `01.01.${item.startYear}` : ""} — {endLabel}
          </div>
        )}
      </div>

      {/* Right: Amount + growth */}
      <div className="shrink-0 text-right">
        <div className={cn("font-semibold text-[var(--fp-color-foreground)] num", compact ? "text-xs" : "text-sm")}>
          {formatMoney(yearlyAmount, item.currency)}
          <span className="text-[var(--fp-color-muted-foreground)] font-normal">{t("cashflow.perYear")}</span>
        </div>
        {!compact && (
          <div className="mt-0.5 flex items-center justify-end gap-2 text-xs text-[var(--fp-color-muted-foreground)] num">
            {t("cashflow.avgPerMonth", { amount: formatMoney(monthlyAmount, item.currency) })}
            {growthPct !== 0 && (
              <span className={cn(
                "flex items-center gap-0.5 font-medium",
                growthPct > 0 ? "text-[var(--fp-color-teal)]" : "text-[var(--fp-color-coral)]"
              )}>
                <TrendingUp className="size-3" />
                {growthPct > 0 ? "+" : ""}{growthPct}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chevron */}
      {onToggle && (
        <button
          type="button"
          className="shrink-0 rounded-full border border-[var(--fp-color-border)] px-2 py-1 text-[10px] font-medium text-[var(--fp-color-muted-foreground)] transition hover:text-[var(--fp-color-foreground)]"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(!item.enabled);
          }}
        >
          {item.enabled ? "On" : "Off"}
        </button>
      )}
      <ChevronDown className="size-4 shrink-0 text-[var(--fp-color-muted-foreground)] transition-transform group-hover:translate-y-0.5" />
    </div>
  );
}
