import { useMemo } from "react";
import { Eye, Lightbulb, Maximize2, Search, X, ZoomIn } from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
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
            goalsAbs: Math.abs(point.goals),
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

  if (!plan) return <Card className="h-[620px] max-w-[1122px] animate-pulse bg-[var(--fp-color-muted)]/60" />;

  return (
    <Card className="max-w-[1122px] p-4">
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
        <div className="relative h-[440px] min-w-[820px]">
          <div className="absolute right-10 top-7 z-10 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/80 px-3 py-1 text-[11px] font-bold text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
            {t("chart.pensionMarker")}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 18, right: 22, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.capitalFill1} stopOpacity={0.62} />
                  <stop offset="100%" stopColor={CHART_COLORS.capitalFill2} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, CHART_TOP_RUB_MLN]}
                ticks={[0, 250, 500, CHART_TOP_RUB_MLN]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (value === CHART_TOP_RUB_MLN ? "млн ₽953" : value === 0 ? "0.0" : String(value))}
                tick={{ fontSize: 12 }}
                width={58}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  return (
                    <div className="rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-3 text-xs shadow-[var(--fp-shadow-tooltip)]">
                      <div className="mb-2 font-bold">{label} · {row.age} лет</div>
                      <div>{t("chart.capitalTooltip")}: {formatRub(row.capitalRubMln * 1_000_000, { compact: true })}</div>
                      <div>{t("chart.income")}: {formatRub(row.incomeRubMln * 1_000_000, { compact: true })}</div>
                      <div>{t("chart.expenses")}: {formatRub(row.expensesRubMln * 1_000_000, { compact: true })}</div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <ReferenceLine x={2027} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
              <ReferenceLine x={2028} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
              <ReferenceLine x={2029} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
              <ReferenceLine x={2054} label={{ value: "60", position: "top", fontSize: 10 }} stroke={CHART_COLORS.reference} strokeDasharray="6 5" />
              <Bar isAnimationActive={false} dataKey="incomeRubMln" barSize={16} radius={[5, 5, 0, 0]} fill={CHART_COLORS.income} fillOpacity={0.92} name="Доходы" />
              <Bar isAnimationActive={false} dataKey="expensesRubMln" barSize={16} radius={[5, 5, 0, 0]} fill={CHART_COLORS.expenses} fillOpacity={0.9} name="Расходы" />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="capitalRubMln"
                stroke="#1a141b"
                strokeWidth={3}
                fill="url(#capitalFill)"
                name="Накопления"
              />
              <Line isAnimationActive={false} type="monotone" dataKey="capitalOptimisticRubMln" stroke={CHART_COLORS.optimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name="Оптимистичный" />
              <Line isAnimationActive={false} type="monotone" dataKey="capitalPessimisticRubMln" stroke={CHART_COLORS.pessimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name="Пессимистичный" />
              <ReferenceLine y={Math.min(chartPeak, CHART_TOP_RUB_MLN)} stroke="rgba(26,20,27,0.1)" strokeDasharray="4 6" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Range slider track */}
      <div className="mt-2 h-6 rounded-full bg-[var(--fp-color-border-track)]/30 p-0.5">
        <div className="h-5 w-2 rounded-full border border-[var(--fp-color-foreground)]/25 bg-[var(--fp-color-muted)]" />
      </div>

      {/* Scale hint */}
      <div className="mt-3 flex items-center gap-3 rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/40 px-4 py-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-muted)]">↔</span>
        <div>
          <div className="text-sm font-bold">{t("chart.scaleTitle")}</div>
          <div className="text-sm text-[var(--fp-color-muted-foreground)]">{t("chart.scaleDescription")}</div>
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
