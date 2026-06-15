import { cn } from "@/lib/utils";

/** Animated skeleton line — basic building block */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[var(--fp-color-muted)]/40", className)}
      {...props}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Page-specific skeleton layouts
   ═══════════════════════════════════════════════════════════════════════════ */

/** General Data page: icon + title, info card, two-column form with sidebar */
export function GeneralDataSkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="space-y-5">
          {/* Info banner */}
          <Skeleton className="h-14 w-full rounded-2xl" />
          {/* Form card */}
          <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
            <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          </div>
        </div>
        {/* Sidebar summary */}
        <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Goals page: title bar, stats pills, filter tabs, goal year groups */
export function GoalsSkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
      </div>
      {/* Stats pills */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-44 rounded-full" />
      </div>
      {/* Year group */}
      <Skeleton className="h-20 w-full rounded-2xl" />
      {/* Filter tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-44 rounded-2xl" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      {/* Sort row */}
      <Skeleton className="h-6 w-96" />
      {/* Goal card */}
      <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        {/* Goal row */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="ml-auto h-5 w-40" />
          <Skeleton className="h-2 w-40 rounded-full" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Cashflow (Income/Expenses) page: title, stats, 3-column layout with items */
export function CashflowSkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
      {/* Stats pills */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-8 w-44 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      {/* Filter tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      {/* 3-column layout */}
      <div className="grid grid-cols-3 gap-5">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-3">
            {/* Column header */}
            <div className="rounded-2xl border border-[var(--fp-color-border)] p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            {/* Add button */}
            <Skeleton className="h-12 w-full rounded-2xl" />
            {/* Items */}
            {Array.from({ length: 2 + col }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--fp-color-border)] p-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pension page: title + subtitle, params card with sliders, portfolio table */
export function PensionSkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Back link + title */}
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-96" />
      {/* Params card */}
      <div className="rounded-2xl border border-[var(--fp-color-border)] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="size-5" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        {/* Slider */}
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      {/* Portfolio table */}
      <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
        <Skeleton className="h-5 w-56" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between py-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Summary page: icon + title, KPI row, chart placeholder, tables */
export function SummarySkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      {/* KPI cards row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--fp-color-border)] p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between py-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tracking page: active goal card, current month card, year grid */
export function TrackingSkeleton() {
  return (
    <div className="mx-auto max-w-[1256px] space-y-5 p-6">
      {/* Title */}
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      {/* Top row: active goal + current month */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-4 rounded-2xl border border-[var(--fp-color-border)] p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-4 rounded-2xl border border-[var(--fp-color-border)] p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-7 w-16" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--fp-color-border)] p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
      {/* Year selector */}
      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[var(--fp-color-border)] p-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      {/* Month grid */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
