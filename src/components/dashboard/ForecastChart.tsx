import { useMemo } from "react";
import { Eye, Lightbulb, Maximize2, Search, X, ZoomIn } from "lucide-react";
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePlanQuery } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { formatRub } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";

const DISPLAY_USD_TO_RUB = 132.7;
const CHART_TOP_RUB_MLN = 953;

/* Style guide chart colors */
const CHART_COLORS = {
  income: "#579982",
  expenses: "#e88a5d",
  goals: "#bebbb6",
  capital: "var(--fp-color-primary)",
  capitalFill1: "#cfcac1",
  capitalFill2: "#d8d3cb",
  optimistic: "#579982",
  pessimistic: "#e88a5d",
  grid: "var(--fp-color-divider)",
  reference: "rgba(26, 20, 27, 0.14)",
} as const;

export function ForecastChart() {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  const hintVisible = useUiStore((state) => state.hintVisible);
  const setHintVisible = useUiStore((state) => state.setHintVisible);
  const data = useMemo(
    () =>
      plan?.forecast
        .filter((point) => point.year >= 2026)
        .map((point, index) => {
          const yearsFromStart = Math.max(0, index);
          const capitalRubMln = (point.capital * DISPLAY_USD_TO_RUB) / 1_000_000;
          return {
            ...point,
            expensesAbs: Math.abs(point.expenses),
            goalsAbs: (Math.abs(point.goals) * DISPLAY_USD_TO_RUB) / 1_000_000,
            capitalRubMln,
            capitalOptimisticRubMln: capitalRubMln * Math.pow(1.08, yearsFromStart),
            capitalPessimisticRubMln: capitalRubMln * Math.pow(0.94, yearsFromStart),
            incomeRubMln: (point.income * DISPLAY_USD_TO_RUB) / 1_000_000,
            expensesRubMln: (Math.abs(point.expenses) * DISPLAY_USD_TO_RUB) / 1_000_000,
          };
        }) ?? [],
    [plan],
  );
  const chartPeak = Math.max(...data.map((point) => point.capitalRubMln), 0);

  if (!plan) return <Card className="h-[800px] w-full animate-pulse bg-[var(--fp-color-muted)]/60" />;

  return (
    <Card className="w-full p-4">
      <div className="flex items-start justify-between gap-4 max-[760px]:block">
        <div>
          <h2 className="section-title text-[var(--fp-text-md)]">{t("chart.title")}</h2>
          <p className="mt-1 text-xs text-[var(--fp-color-muted-foreground)]">{t("chart.projection", { years: 31 })}</p>
        </div>
        <div className="flex gap-1 max-[760px]:mt-3">
          <Button variant="active" size="sm">{t("chart.yearly")}</Button>
          <Button variant="secondary" size="sm">{t("chart.byAge")}</Button>
          <Button variant="secondary" size="iconSm" aria-label={t("chart.zoomOut")}><Search className="size-3.5" /></Button>
          <Button variant="secondary" size="iconSm" aria-label={t("chart.fullscreen")}><Maximize2 className="size-3.5" /></Button>
          <Button variant="secondary" size="iconSm" aria-label={t("chart.zoomIn")}><ZoomIn className="size-3.5" /></Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <LegendPill color={CHART_COLORS.income} label={t("chart.income")} />
        <LegendPill color={CHART_COLORS.expenses} label={t("chart.expenses")} />
        <LegendPill color={CHART_COLORS.goals} label={t("chart.goals")} />
        <LegendPill color="#9a958f" label={t("chart.savings")} line />
        <span className="ml-1 text-xs font-semibold">— {t("chart.base")}</span>
        <span className="text-xs text-[var(--fp-color-muted-foreground)]">--- {t("chart.optimistic")}</span>
        <span className="text-xs text-[var(--fp-color-muted-foreground)]">··· {t("chart.pessimistic")}</span>
      </div>

      {hintVisible && (
        <div className="mt-3 flex items-center gap-3 rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/40 px-4 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-muted)]">
            <Lightbulb className="size-4 text-[var(--fp-color-muted-foreground)]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{t("chart.modelFuture")}</div>
            <div className="text-sm text-[var(--fp-color-muted-foreground)]">{t("chart.modelFutureDescription")}</div>
          </div>
          <Button variant="ghost" size="iconSm" onClick={() => setHintVisible(false)} aria-label={t("common.close")}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="scrollbar-thin mt-3 overflow-x-auto">
          <div className="flex flex-col h-[540px] min-w-[820px]">
            <div className="absolute right-10 top-7 z-10 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/80 px-3 py-1 text-[11px] font-bold text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
              {t("chart.pensionMarker")}
            </div>
            
            {/* Top Chart: Capital (Line/Area) */}
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} syncId="finance" margin={{ top: 18, right: 22, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.capitalFill1} stopOpacity={0.62} />
                      <stop offset="100%" stopColor={CHART_COLORS.capitalFill2} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} minTickGap={20} tick={false} />
                  <YAxis
                    domain={[0, CHART_TOP_RUB_MLN]}
                    ticks={[0, 250, 500, CHART_TOP_RUB_MLN]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => (value === CHART_TOP_RUB_MLN ? "млн ₽953" : value === 0 ? "0.0" : String(value))}
                    tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
                    width={58}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as (typeof data)[number];
                      return (
                        <div className="rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-3 text-xs shadow-[var(--fp-shadow-tooltip)]">
                          <div className="mb-3 font-bold text-[var(--fp-color-foreground)] border-b border-[var(--fp-color-border)] pb-2">{label} год · {row.age} лет</div>
                          <div className="text-[var(--fp-color-muted-foreground)] mb-1 uppercase tracking-wider text-[10px]">Накопления</div>
                          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 ml-2 border-l-2 border-[var(--fp-color-border)] pl-2">
                            <span className="text-[var(--fp-color-pessimistic)] text-[var(--fp-color-muted-foreground)]">— Пессимистичный</span><span className="font-semibold">{formatRub(row.capitalPessimisticRubMln * 1_000_000, { compact: true })}</span>
                            <span className="text-[var(--fp-color-optimistic)] text-[var(--fp-color-teal)]">-- Оптимистичный</span><span className="font-semibold">{formatRub(row.capitalOptimisticRubMln * 1_000_000, { compact: true })}</span>
                            <span className="text-[var(--fp-color-foreground)] font-medium">— Базовый</span><span className="font-semibold">{formatRub(row.capitalRubMln * 1_000_000, { compact: true })}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine x={2054} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
                  <Area isAnimationActive={false} type="monotone" dataKey="capitalRubMln" stroke="#1a141b" strokeWidth={3} fill="url(#capitalFill)" name="Накопления" />
                  <Line isAnimationActive={false} type="monotone" dataKey="capitalOptimisticRubMln" stroke={CHART_COLORS.optimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name="Оптимистичный" />
                  <Line isAnimationActive={false} type="monotone" dataKey="capitalPessimisticRubMln" stroke={CHART_COLORS.pessimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name="Пессимистичный" />
                  <ReferenceLine y={Math.min(chartPeak, CHART_TOP_RUB_MLN)} stroke="rgba(26,20,27,0.1)" strokeDasharray="4 6" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Chart: Flows (Bars) */}
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} syncId="finance" margin={{ top: 10, right: 22, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} minTickGap={20} tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }} />
                  <YAxis
                    domain={[0, 'auto']}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value === 0 ? "0.0" : String(value)}
                    tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
                    width={58}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--fp-color-surface-hover)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as (typeof data)[number];
                      return (
                        <div className="rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-3 text-xs shadow-[var(--fp-shadow-tooltip)]">
                          <div className="mb-3 font-bold text-[var(--fp-color-foreground)] border-b border-[var(--fp-color-border)] pb-2">{row.age} лет ({label} г.)</div>
                          <div className="text-[var(--fp-color-muted-foreground)] mb-1 uppercase tracking-wider text-[10px]">Потоки</div>
                          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 ml-2">
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background: CHART_COLORS.income}} />Доходы</span><span className="font-semibold">{formatRub(row.incomeRubMln * 1_000_000, { compact: true })}</span>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background: CHART_COLORS.expenses}} />Расходы</span><span className="font-semibold">{formatRub(row.expensesRubMln * 1_000_000, { compact: true })}</span>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background: CHART_COLORS.goals}} />Цели</span><span className="font-semibold">{formatRub(row.goalsAbs * 1_000_000, { compact: true })}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine x={2054} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
                  <Bar isAnimationActive={false} dataKey="incomeRubMln" barSize={16} radius={[4, 4, 0, 0]} fill={CHART_COLORS.income} fillOpacity={0.92} name="Доходы" />
                  <Bar isAnimationActive={false} dataKey="expensesRubMln" barSize={16} radius={[4, 4, 0, 0]} fill={CHART_COLORS.expenses} fillOpacity={0.9} name="Расходы" />
                  <Bar isAnimationActive={false} dataKey="goalsAbs" barSize={16} radius={[4, 4, 0, 0]} fill={CHART_COLORS.goals} fillOpacity={0.9} name="Цели" />
                  <Brush dataKey="year" height={16} stroke="var(--fp-color-border-strong)" fill="var(--fp-color-surface)" travellerWidth={6} tickFormatter={() => ''} className="opacity-80" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>

      {/* Scale hint */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/60 px-4 py-3 shadow-sm">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--fp-color-muted)] text-[var(--fp-color-foreground)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3-4 4 4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
        </div>
        <div>
          <div className="text-sm font-semibold">{t("chart.scaleTitle")}</div>
          <div className="text-xs text-[var(--fp-color-muted-foreground)]">Двигайте ползунки внизу графика для приближения к нужному периоду.</div>
        </div>
      </div>
    </Card>
  );
}

function LegendPill({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <button className="inline-flex h-7 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/70 px-3 text-xs text-[var(--fp-color-muted-foreground)]" type="button">
      <span className={line ? "h-0.5 w-4 rounded-full" : "size-2 rounded-full"} style={{ background: color }} />
      {label}
      <Eye className="size-3" />
    </button>
  );
}
