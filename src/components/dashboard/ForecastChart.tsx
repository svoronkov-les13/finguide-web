import { useMemo } from "react";
import { Eye, Lightbulb, Maximize2, Search, X, ZoomIn } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function ForecastChart() {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  const hintVisible = useUiStore((state) => state.hintVisible);
  const setHintVisible = useUiStore((state) => state.setHintVisible);
  const data = useMemo(
    () =>
      plan?.forecast
        .filter((point) => point.year >= 2026)
        .map((point) => ({
          ...point,
          expensesAbs: Math.abs(point.expenses),
          goalsAbs: Math.abs(point.goals),
          capitalRubMln: (point.capital * DISPLAY_USD_TO_RUB) / 1_000_000,
          incomeRubMln: (point.income * DISPLAY_USD_TO_RUB) / 1_000_000,
          expensesRubMln: (Math.abs(point.expenses) * DISPLAY_USD_TO_RUB) / 1_000_000,
        })) ?? [],
    [plan],
  );
  const chartPeak = Math.max(...data.map((point) => point.capitalRubMln), 0);

  if (!plan) return <Card className="h-[620px] max-w-[1122px] animate-pulse bg-muted/60" />;

  return (
    <Card className="max-w-[1122px] p-4">
      <div className="flex items-start justify-between gap-4 max-[760px]:block">
        <div>
          <h2 className="section-title text-[15px]">{t("chart.title")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("chart.projection", { years: 31 })}</p>
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
        <LegendPill color="#61b99d" label={t("chart.income")} />
        <LegendPill color="#f4a5b7" label={t("chart.expenses")} />
        <LegendPill color="#bebbb6" label={t("chart.goals")} />
        <LegendPill color="#9a958f" label={t("chart.savings")} line />
        <LegendPill color="#2aa18d" label={t("chart.actual")} line />
        <span className="ml-1 text-xs font-semibold">— {t("chart.base")}</span>
        <span className="text-xs text-muted-foreground">— {t("chart.optimistic")}</span>
        <span className="text-xs text-muted-foreground">— {t("chart.pessimistic")}</span>
      </div>

      {hintVisible && (
        <div className="mt-3 flex items-center gap-3 rounded-[24px] border border-border bg-surface/40 px-4 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-muted">
            <Lightbulb className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{t("chart.modelFuture")}</div>
            <div className="text-sm text-muted-foreground">{t("chart.modelFutureDescription")}</div>
          </div>
          <Button variant="ghost" size="iconSm" onClick={() => setHintVisible(false)} aria-label={t("common.close")}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="scrollbar-thin mt-3 overflow-x-auto">
        <div className="relative h-[440px] min-w-[820px]">
          <div className="absolute right-10 top-7 z-10 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-[11px] font-bold text-muted-foreground shadow-soft">
            {t("chart.pensionMarker")}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 18, right: 22, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cfcac1" stopOpacity={0.62} />
                  <stop offset="100%" stopColor="#d8d3cb" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#61b99d" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#61b99d" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, CHART_TOP_RUB_MLN]}
                ticks={[0, 250, 500, CHART_TOP_RUB_MLN]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (value === CHART_TOP_RUB_MLN ? "или ₽953" : value === 0 ? "0.0" : String(value))}
                tick={{ fontSize: 12 }}
                width={58}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  return (
                    <div className="rounded-2xl border border-border bg-card p-3 text-xs shadow-elevated">
                      <div className="mb-2 font-bold">{label} · {row.age} лет</div>
                      <div>{t("chart.capitalTooltip")}: {formatRub(row.capitalRubMln * 1_000_000, { compact: true })}</div>
                      <div>{t("chart.income")}: {formatRub(row.incomeRubMln * 1_000_000, { compact: true })}</div>
                      <div>{t("chart.expenses")}: {formatRub(row.expensesRubMln * 1_000_000, { compact: true })}</div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <ReferenceLine x={2027} stroke="rgba(31,28,37,0.2)" strokeDasharray="6 5" />
              <ReferenceLine x={2028} stroke="rgba(31,28,37,0.14)" strokeDasharray="6 5" />
              <ReferenceLine x={2029} stroke="rgba(31,28,37,0.14)" strokeDasharray="6 5" />
              <ReferenceLine x={2054} label={{ value: "60", position: "top", fontSize: 10 }} stroke="rgba(31,28,37,0.14)" strokeDasharray="6 5" />
              <Area isAnimationActive={false} type="monotone" dataKey="incomeRubMln" stroke="#61b99d" strokeWidth={2} fill="url(#incomeFill)" name="Доходы" />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="capitalRubMln"
                stroke="#a39d94"
                strokeWidth={1.5}
                fill="url(#capitalFill)"
                name="Накопления"
              />
              <Line isAnimationActive={false} type="monotone" dataKey="expensesRubMln" stroke="#f4a5b7" strokeWidth={2} dot={false} name="Расходы" />
              <ReferenceLine y={Math.min(chartPeak, CHART_TOP_RUB_MLN)} stroke="rgba(31,28,37,0.1)" strokeDasharray="4 6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 h-6 rounded-full bg-foreground/5 p-0.5">
        <div className="h-5 w-2 rounded-full border border-foreground/25 bg-muted" />
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[24px] border border-border bg-surface/40 px-4 py-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-muted">↔</span>
        <div>
          <div className="text-sm font-bold">{t("chart.scaleTitle")}</div>
          <div className="text-sm text-muted-foreground">{t("chart.scaleDescription")}</div>
        </div>
      </div>
    </Card>
  );
}

function LegendPill({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <button className="inline-flex h-7 items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 text-xs text-muted-foreground" type="button">
      <span className={line ? "h-0.5 w-4 rounded-full" : "size-2 rounded-full"} style={{ background: color }} />
      {label}
      <Eye className="size-3" />
    </button>
  );
}
