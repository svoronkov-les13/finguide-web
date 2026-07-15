import { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { Eye, EyeOff, Lightbulb, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import type { ForecastPoint, FinancialPlan, Goal } from "@/types/finance";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFormat } from "@/lib/useFormat";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;
const TypedBrush = Brush as any;

/* Style guide chart colors */
const CHART_COLORS = {
  income: "#3C8A75",
  expenses: "#B05C50",
  goals: "#5D8AA8",
  savings: "#1A141D",
  optimistic: "#3C8A75",
  pessimistic: "#B05C50",
  grid: "var(--fp-color-divider)",
  reference: "rgba(26, 20, 27, 0.14)",
  zeroLine: "rgba(26, 20, 27, 0.34)",
} as const;

export function buildForecastChartData(forecast: ForecastPoint[] | undefined, scenarioForecasts?: FinancialPlan["scenarioForecasts"]) {
  const optimisticByYear = forecastByYear(scenarioForecasts?.optimistic);
  const pessimisticByYear = forecastByYear(scenarioForecasts?.pessimistic);

  return (forecast ?? []).map((point) => {
    const optimistic = optimisticByYear.get(point.year);
    const pessimistic = pessimisticByYear.get(point.year);
    const capMln = point.capital / 1_000_000;
    return {
      ...point,
      expensesAbs: Math.abs(point.expenses),
      goalsAbs: Math.abs(point.goals) / 1_000_000,
      capitalRubMln: capMln,
      capitalPositiveRubMln: Math.max(capMln, 0),
      capitalNegativeRubMln: Math.min(capMln, 0),
      capitalOptimisticRubMln: optimistic ? optimistic.capital / 1_000_000 : undefined,
      capitalPessimisticRubMln: pessimistic ? pessimistic.capital / 1_000_000 : undefined,
      capitalRange: [
        pessimistic ? pessimistic.capital / 1_000_000 : point.capital / 1_000_000,
        optimistic ? optimistic.capital / 1_000_000 : point.capital / 1_000_000,
      ],
      incomeRubMln: point.income / 1_000_000,
      onlyExpensesRubMln: Math.abs(point.expenses) / 1_000_000,
      expensesRubMln: (Math.abs(point.expenses) + Math.abs(point.goals)) / 1_000_000,
    };
  });
}

function forecastByYear(forecast: ForecastPoint[] | undefined) {
  return new Map((forecast ?? []).map((point) => [point.year, point]));
}

export function projectionYearsLabel(forecast: ForecastPoint[] | undefined) {
  if (!forecast?.length) return 0;
  const years = forecast.map((point) => point.year);
  return Math.max(...years) - Math.min(...years) + 1;
}

export function resolveForecastForChart(
  plan: FinancialPlan | undefined,
  tracker?: { deviation: number; year: number; hasData: boolean },
) {
  void tracker;
  return plan?.forecast;
}

function chartTopRubMln(data: ReturnType<typeof buildForecastChartData>) {
  const peak = Math.max(
    ...data.flatMap((point) => [point.capitalRubMln, point.incomeRubMln, point.expensesRubMln, point.goalsAbs]),
    0,
  );
  if (peak <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(peak)));
  return Math.ceil(peak / magnitude) * magnitude;
}

function chartTicks(top: number) {
  return [0, top / 4, top / 2, top].map((value) => Math.round(value * 10) / 10);
}

export function ForecastChart() {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  const { formatRub } = useFormat();
  const hintVisible = useUiStore((state) => state.hintVisible);
  const setHintVisible = useUiStore((state) => state.setHintVisible);
  const [xAxisMode, setXAxisMode] = useState<"year" | "age">("year");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [visibleSeries, setVisibleSeries] = useState({
    income: true,
    expenses: true,
    goals: true,
    savings: true,
  });

  const [brushRange, setBrushRange] = useState<{ start?: number; end?: number }>({});

  const [debounceBrush] = useState(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (start?: number, end?: number) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setBrushRange({ start, end });
      }, 40); // 40ms debounce to prevent layout/React lag during mouse drags!
    };
  });

  const forecast = resolveForecastForChart(plan);
  const data = useMemo(() => buildForecastChartData(forecast, plan?.scenarioForecasts), [forecast, plan?.scenarioForecasts]);
  const chartTop = chartTopRubMln(data);
  const ticks = chartTicks(chartTop);
  const retirementYear = plan ? plan.settings.birthYear + plan.settings.retirementAge : undefined;

  const visibleData = useMemo(() => {
    if (data.length === 0) return [];
    const start = brushRange.start ?? 0;
    const end = brushRange.end ?? (data.length - 1);
    return data.slice(start, end + 1);
  }, [data, brushRange]);

  const goalsByYear = useMemo(() => {
    const map = new Map<number, Goal[]>();
    if (!plan?.goals) return map;
    for (const goal of plan.goals) {
      const list = map.get(goal.targetYear) || [];
      list.push(goal);
      map.set(goal.targetYear, list);
    }
    return map;
  }, [plan?.goals]);

  const goalReferenceLines = useMemo(() => {
    if (!visibleSeries.goals || !plan?.goals) return [];
    const groups: { targetYear: number; age: number; goals: Goal[] }[] = [];
    goalsByYear.forEach((groupGoals, targetYear) => {
      const age = targetYear - plan.settings.birthYear;
      groups.push({ targetYear, age, goals: groupGoals });
    });
    return groups;
  }, [goalsByYear, visibleSeries.goals, plan]);

  const formatAge = (age: number) => {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${age} ${t("format.yearsSuffix")}`;
    if (lastDigit === 1) return `${age} ${t("format.yearsSuffix1")}`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${age} ${t("format.yearsSuffix234")}`;
    return `${age} ${t("format.yearsSuffix")}`;
  };

  const handleZoomIn = () => {
    const len = data.length;
    if (len === 0) return;
    const currentStart = brushRange.start ?? 0;
    const currentEnd = brushRange.end ?? (len - 1);
    const diff = currentEnd - currentStart;
    if (diff <= 4) return; // Limit zoom to minimum 4 years

    setBrushRange({
      start: currentStart + 1,
      end: currentEnd - 1,
    });
  };

  const handleZoomOut = () => {
    const len = data.length;
    if (len === 0) return;
    const currentStart = brushRange.start ?? 0;
    const currentEnd = brushRange.end ?? (len - 1);
    
    const newStart = Math.max(0, currentStart - 1);
    const newEnd = Math.min(len - 1, currentEnd + 1);
    
    if (newStart === 0 && newEnd === len - 1) {
      setBrushRange({});
    } else {
      setBrushRange({
        start: newStart,
        end: newEnd,
      });
    }
  };

  if (!plan) return <Card className="h-[800px] w-full animate-pulse bg-[var(--fp-color-muted)]/60" />;

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderUnifiedChart = (isModal: boolean) => {
    // Determine the dynamic retirement capital value
    const retirementPoint = data.find((point) => point.year === retirementYear);
    const retirementCapitalVal = retirementPoint ? (retirementPoint.capital / 1_000_000).toFixed(1) : "80.3";
    const pensionText = `${t("chart.pensionMarker").split(":")[0]}: ${retirementCapitalVal} ${t("format.million")}`;

    const renderRetirementLabel = (props: any) => {
      const { viewBox } = props;
      if (!viewBox) return null;
      const { x, y } = viewBox;
      return (
        <g>
          <rect
            x={x - 65}
            y={y + 10}
            width={130}
            height={24}
            rx={12}
            fill="var(--fp-color-card)"
            stroke="var(--fp-color-border-strong)"
            strokeWidth={1}
          />
          <text
            x={x}
            y={y + 26}
            textAnchor="middle"
            fill="var(--fp-color-muted-foreground)"
            fontSize={10}
            fontWeight="bold"
          >
            {pensionText}
          </text>
        </g>
      );
    };

    const renderRetirementBottomLabel = (props: any) => {
      const { viewBox } = props;
      if (!viewBox) return null;
      const { x, y } = viewBox;
      return (
        <g>
          <rect
            x={x - 30}
            y={y + 10}
            width={60}
            height={20}
            rx={10}
            fill="var(--fp-color-card)"
            stroke="var(--fp-color-border)"
            strokeWidth={1}
          />
          <text
            x={x}
            y={y + 23}
            textAnchor="middle"
            fill="var(--fp-color-muted-foreground)"
            fontSize={9}
            fontWeight="bold"
          >
            {t("pension.pensionLine")}
          </text>
        </g>
      );
    };

    /* Goal icons are rendered via a customized SVG layer (see below) to avoid
       being covered by the ReferenceLine stroke. The reference lines themselves
       intentionally have NO label — icons float above them. */

    return (
      <div className={cn("flex flex-col w-full", isModal && "h-full flex-1 min-h-0")}>
        {/* Header line */}
        <div className="flex items-start justify-between gap-4 max-[860px]:block">
          <div>
            <h2 className="section-title text-[var(--fp-text-md)] font-bold text-[var(--fp-color-foreground)]">
              {t("chart.title")}
            </h2>
            <p className="mt-1 text-xs text-[var(--fp-color-muted-foreground)]">
              {t("chart.projection", { years: projectionYearsLabel(plan.forecast) })}
            </p>
          </div>
          <div className="flex gap-1 max-[860px]:mt-3 items-center">
            <Button
              variant={xAxisMode === "year" ? "active" : "secondary"}
              size="sm"
              onClick={() => setXAxisMode("year")}
            >
              {t("chart.yearly")}
            </Button>
            <Button
              variant={xAxisMode === "age" ? "active" : "secondary"}
              size="sm"
              onClick={() => setXAxisMode("age")}
            >
              {t("chart.byAge")}
            </Button>
            <span className="w-[1px] h-6 bg-[var(--fp-color-border-strong)] mx-1 self-center" />
            <Button variant="secondary" size="iconSm" onClick={handleZoomOut} aria-label={t("chart.zoomOut")}>
              <ZoomOut className="size-3.5" />
            </Button>
            <Button variant="secondary" size="iconSm" onClick={handleZoomIn} aria-label={t("chart.zoomIn")}>
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              variant={isModal ? "active" : "secondary"}
              size="iconSm"
              onClick={() => setIsFullscreen(!isModal)}
              aria-label={t("chart.fullscreen")}
            >
              {isModal ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </Button>
          </div>
        </div>

        {/* Unified Legend Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-[var(--fp-color-border)] pb-3">
          <LegendPill
            color={CHART_COLORS.income}
            label={t("chart.income")}
            active={visibleSeries.income}
            onClick={() => toggleSeries("income")}
          />
          <LegendPill
            color={CHART_COLORS.expenses}
            label={t("chart.expenses")}
            active={visibleSeries.expenses}
            onClick={() => toggleSeries("expenses")}
          />
          <LegendPill
            color={CHART_COLORS.goals}
            dashed
            label={t("chart.goals")}
            active={visibleSeries.goals}
            onClick={() => toggleSeries("goals")}
          />
          <LegendPill
            color={CHART_COLORS.savings}
            label={t("chart.savings")}
            line
            active={visibleSeries.savings}
            onClick={() => toggleSeries("savings")}
          />
          {plan.scenarioForecasts?.optimistic && (
            <LegendLabel
              color={CHART_COLORS.optimistic}
              label={t("chart.optimisticFull")}
              dashed
            />
          )}
          {plan.scenarioForecasts?.pessimistic && (
            <LegendLabel
              color={CHART_COLORS.pessimistic}
              label={t("chart.pessimisticFull")}
              dashed
            />
          )}
        </div>

        {/* Tip/Banner */}
        {hintVisible && !isModal && (
          <div className="mt-4 flex items-center gap-3 rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/40 px-4 py-2.5">
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

        {/* Top Chart: Capital Accumulation (Line chart) */}
        <div className={cn("mt-4 w-full overflow-visible relative z-20", isModal ? "flex-1 min-h-[320px]" : "h-[320px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} syncId="finance" margin={{ top: 18, right: 22, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--fp-color-border)" strokeDasharray="3 3" />
              {plan.scenarioForecasts?.optimistic && plan.scenarioForecasts?.pessimistic ? (
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="capitalRange"
                  stroke="none"
                  fill="rgba(26, 20, 27, 0.04)"
                  connectNulls
                  hide={!visibleSeries.savings}
                />
              ) : null}
              <XAxis
                dataKey={xAxisMode}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
                tickFormatter={(value) => (xAxisMode === "age" ? formatAge(Number(value)) : String(value))}
                tick={false}
                height={1}
              />
              <YAxis
                domain={[0, chartTop]}
                ticks={ticks}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => String(value)}
                tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
                width={68}
                label={{ value: t("chart.axisLabel"), position: 'top', offset: 8, style: { fontSize: 11, fill: 'var(--fp-color-muted-foreground)', fontWeight: 500 } }}
              />
              <ReferenceLine y={0} stroke={CHART_COLORS.zeroLine} strokeWidth={1.5} />
              <Tooltip
                cursor={{ stroke: 'var(--fp-color-border-strong)', strokeWidth: 1, strokeDasharray: '4 3', strokeOpacity: 0.5 }}
                allowEscapeViewBox={{ x: false, y: true }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  const titleText = xAxisMode === "year"
                    ? `${row.year} ${t("format.yearSuffix")}`
                    : formatAge(row.age);
                  const yearGoals = goalsByYear.get(row.year) ?? [];
                  return (
                    <div className="rounded-[20px] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-4 text-xs shadow-[var(--fp-shadow-tooltip)] min-w-[220px] max-h-[70vh] overflow-y-auto">
                      <div className="mb-2 font-bold text-[var(--fp-color-foreground)] text-sm">
                        {titleText}
                      </div>
                      <div className="text-[var(--fp-color-muted-foreground)] mb-2 uppercase tracking-wider text-[10px] font-bold">
                        {t("chart.savings")}
                      </div>
                      <div className="flex flex-col gap-2">
                        {row.capitalPessimisticRubMln !== undefined ? (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="h-0 w-3 border-t border-dashed" style={{ borderColor: CHART_COLORS.pessimistic }} />
                              <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.pessimisticFull")}</span>
                            </div>
                            <span className="font-bold text-[var(--fp-color-foreground)]">
                              {formatRub(row.capitalPessimisticRubMln * 1_000_000, { compact: true })}
                            </span>
                          </div>
                        ) : null}
                        {row.capitalOptimisticRubMln !== undefined ? (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="h-0 w-3 border-t border-dashed" style={{ borderColor: CHART_COLORS.optimistic }} />
                              <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.optimisticFull")}</span>
                            </div>
                            <span className="font-bold text-[var(--fp-color-foreground)]">
                              {formatRub(row.capitalOptimisticRubMln * 1_000_000, { compact: true })}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.savings }} />
                            <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.baseFull")}</span>
                          </div>
                          <span className="font-bold text-[var(--fp-color-foreground)]">
                            {formatRub(row.capitalRubMln * 1_000_000, { compact: true })}
                          </span>
                        </div>
                      </div>
                      {yearGoals.length > 0 && visibleSeries.goals && (
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--fp-color-border)] flex flex-col gap-1">
                          {yearGoals.map((g) => (
                            <div key={g.id} className="font-semibold text-[var(--fp-color-foreground)] text-xs">
                              {g.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {retirementYear ? (
                <ReferenceLine
                  x={xAxisMode === "year" ? retirementYear : plan.settings.retirementAge}
                  stroke="var(--fp-color-neutral-80)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={renderRetirementLabel}
                />
              ) : null}
              {goalReferenceLines.map((group) => (
                <ReferenceLine
                  key={group.targetYear}
                  x={xAxisMode === "year" ? group.targetYear : group.age}
                  stroke={CHART_COLORS.goals}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              ))}
              {/* Invisible bars to force band scale matching the bottom chart —
                  without these, Line uses point scale and Bar uses band scale,
                  causing syncId pixel positions to diverge */}
              <Bar dataKey="incomeRubMln" barSize={14} fill="none" stroke="none" hide legendType="none" />
              <Bar dataKey="onlyExpensesRubMln" barSize={14} fill="none" stroke="none" hide legendType="none" />
              {/* Green/Red shading: single Area using same dataKey as the line,
                  with an SVG gradient that splits at the zero crossing point */}
              {(() => {
                const dataMax = Math.max(...visibleData.map(d => d.capitalRubMln));
                const dataMin = Math.min(...visibleData.map(d => d.capitalRubMln));
                // Where 0 falls between dataMax and dataMin as a fraction [0,1]
                const gradientOffset = dataMax <= 0 ? 0 : dataMin >= 0 ? 1 : dataMax / (dataMax - dataMin);
                return (
                  <>
                    <defs>
                      <linearGradient id="capitalFillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={0} stopColor="rgba(60, 138, 117, 0.18)" />
                        <stop offset={gradientOffset} stopColor="rgba(60, 138, 117, 0.18)" />
                        <stop offset={gradientOffset} stopColor="rgba(176, 92, 80, 0.18)" />
                        <stop offset={1} stopColor="rgba(176, 92, 80, 0.18)" />
                      </linearGradient>
                    </defs>
                    <Area
                      isAnimationActive={false}
                      type="monotone"
                      dataKey="capitalRubMln"
                      stroke="none"
                      fill="url(#capitalFillGradient)"
                      baseValue={0}
                      hide={!visibleSeries.savings}
                      legendType="none"
                    />
                  </>
                );
              })()}
              <Line isAnimationActive={false} type="monotone" dataKey="capitalRubMln" stroke={CHART_COLORS.savings} strokeWidth={3} dot={false} name={t("chart.savings")} hide={!visibleSeries.savings} />
              {plan.scenarioForecasts?.optimistic ? <Line isAnimationActive={false} type="monotone" dataKey="capitalOptimisticRubMln" stroke={CHART_COLORS.optimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name={t("chart.optimisticFull")} hide={!visibleSeries.savings} /> : null}
              {plan.scenarioForecasts?.pessimistic ? <Line isAnimationActive={false} type="monotone" dataKey="capitalPessimisticRubMln" stroke={CHART_COLORS.pessimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name={t("chart.pessimisticFull")} hide={!visibleSeries.savings} /> : null}
              {/* Goal icons — placed AFTER Lines and Tooltip in JSX so they
                  render above the cursor line in SVG paint order */}
              {goalReferenceLines.map((group) => {
                const sorted = [...group.goals].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                return (
                  <ReferenceLine
                    key={`icon-${group.targetYear}`}
                    x={xAxisMode === "year" ? group.targetYear : group.age}
                    stroke="none"
                    strokeWidth={0}
                    ifOverflow="extendDomain"
                    label={(props: any) => {
                      const { viewBox } = props;
                      if (!viewBox) return null;
                      const { x: cx, y: cy } = viewBox;
                      const radius = 14;
                      const iconSz = 18;
                      const gap = radius * 2.4;
                      return (
                        <g>
                          {sorted.map((goal, idx) => {
                            const Ic = iconMap[goal.icon] ?? Icons.Target;
                            const oy = idx * gap;
                            const clr = "var(--fp-color-neutral-80)";
                            return (
                              <g key={goal.id}>
                                <circle cx={cx} cy={cy + 14 + oy} r={radius} fill="var(--fp-color-card)" stroke="var(--fp-color-border-strong)" strokeWidth={1} />
                                <foreignObject x={cx - iconSz / 2} y={cy + 14 + oy - iconSz / 2} width={iconSz} height={iconSz}>
                                  <Ic style={{ width: iconSz, height: iconSz, color: clr }} />
                                </foreignObject>
                              </g>
                            );
                          })}
                        </g>
                      );
                    }}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Subtle dividing line */}
        <div className="my-3 border-t border-[var(--fp-color-border)] opacity-60" />

        {/* Bottom Chart: Cash Flows (Grouped Bars) */}
        <div className={cn("mt-2 w-full overflow-visible relative z-10", isModal ? "flex-1 min-h-[280px]" : "h-[280px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleData} syncId="finance" margin={{ top: 18, right: 22, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--fp-color-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisMode}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
                tickFormatter={(value) => (xAxisMode === "age" ? formatAge(Number(value)) : String(value))}
                tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
              />
              
              <YAxis
                domain={[0, 'auto']}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => String(value)}
                tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
                width={68}
                label={{ value: t("chart.axisLabel"), position: 'top', offset: 8, style: { fontSize: 11, fill: 'var(--fp-color-muted-foreground)', fontWeight: 500 } }}
              />

              <Tooltip
                cursor={{ fill: 'var(--fp-color-surface-hover)' }}
                allowEscapeViewBox={{ x: false, y: true }}
                offset={16}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  const titleText = xAxisMode === "year"
                    ? `${row.year} ${t("format.yearSuffix")}`
                    : formatAge(row.age);

                  const yearGoals = goalsByYear.get(row.year) ?? [];

                  return (
                    <div className="rounded-[20px] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-4 text-xs shadow-[var(--fp-shadow-tooltip)] min-w-[220px] max-h-[70vh] overflow-y-auto">
                      <div className="mb-3 font-bold text-[var(--fp-color-foreground)] text-sm">
                        {titleText}
                      </div>
                      <div className="text-[var(--fp-color-muted-foreground)] mb-2 uppercase tracking-wider text-[10px] font-bold">
                        {t("chart.flows")}
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {visibleSeries.income && (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS.income }} />
                              <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.income")}</span>
                            </div>
                            <span className="font-bold text-[var(--fp-color-foreground)]">
                              {formatRub(row.incomeRubMln * 1_000_000, { compact: true })}
                            </span>
                          </div>
                        )}
                        {visibleSeries.expenses && (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS.expenses }} />
                              <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.expenses")}</span>
                            </div>
                            <span className="font-bold text-[var(--fp-color-foreground)]">
                              {formatRub(row.onlyExpensesRubMln * 1_000_000, { compact: true })}
                            </span>
                          </div>
                        )}
                        {visibleSeries.goals && row.goalsAbs > 0 && (
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS.goals }} />
                              <span className="text-[var(--fp-color-muted-foreground)] font-medium">{t("chart.goals")}</span>
                            </div>
                            <span className="font-bold text-[var(--fp-color-foreground)]">
                              {formatRub(row.goalsAbs * 1_000_000, { compact: true })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Display names of active goals in this year */}
                      {yearGoals.length > 0 && visibleSeries.goals && (
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--fp-color-border)] flex flex-col gap-1">
                          {yearGoals.map((g) => (
                            <div key={g.id} className="font-semibold text-[var(--fp-color-foreground)] text-xs">
                              {g.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {retirementYear ? (
                <ReferenceLine
                  x={xAxisMode === "year" ? retirementYear : plan.settings.retirementAge}
                  stroke="var(--fp-color-neutral-80)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={renderRetirementBottomLabel}
                />
              ) : null}
              <Bar isAnimationActive={false} dataKey="incomeRubMln" barSize={14} radius={[4, 4, 0, 0]} fill={CHART_COLORS.income} fillOpacity={0.95} name={t("chart.income")} hide={!visibleSeries.income} />
              <Bar isAnimationActive={false} dataKey="onlyExpensesRubMln" barSize={14} radius={[4, 4, 0, 0]} fill={CHART_COLORS.expenses} fillOpacity={0.95} name={t("chart.expenses")} hide={!visibleSeries.expenses} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Standalone Brush Timeline Horizon Slider */}
        <div className="mt-3 w-full h-[24px] overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 22, left: 68, bottom: 0 }}>
              <XAxis dataKey={xAxisMode} hide />
              <YAxis hide />
              <TypedBrush
                data={data}
                startIndex={brushRange.start}
                endIndex={brushRange.end}
                onChange={(e: any) => {
                  debounceBrush(e.startIndex ?? undefined, e.endIndex ?? undefined);
                }}
                dataKey={xAxisMode}
                height={16}
                stroke="var(--fp-color-border-strong)"
                fill="var(--fp-color-surface)"
                travellerWidth={6}
                tickFormatter={() => ''}
                className="opacity-80"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isFullscreen && (
        <Card className="w-full p-6 border-[var(--fp-color-border-strong)] shadow-sm">
          {renderUnifiedChart(false)}

          {/* Scale hint footer */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/60 px-4 py-3 shadow-sm">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--fp-color-muted)] text-[var(--fp-color-foreground)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 3-4 4 4 4" />
                <path d="M4 7h16" />
                <path d="m16 21 4-4-4-4" />
                <path d="M20 17H4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold">{t("chart.scaleTitle")}</div>
              <div className="text-xs text-[var(--fp-color-muted-foreground)]">{t("chart.scaleDescription")}</div>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          hideClose
          className="max-w-[95vw] w-[95vw] h-[92vh] max-h-[92vh] p-6 bg-[var(--fp-color-background)] border-[var(--fp-color-border)] rounded-[var(--fp-radius-2xl)] shadow-2xl flex flex-col justify-start overflow-y-auto"
        >
          {isFullscreen && renderUnifiedChart(true)}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LegendPill({
  color,
  label,
  line,
  dashed,
  active,
  onClick,
}: {
  color: string;
  label: string;
  line?: boolean;
  dashed?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-xs transition-all duration-200",
        active
          ? "border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/70 text-[var(--fp-color-foreground)] font-medium shadow-[var(--fp-shadow-sm)]"
          : "border-[var(--fp-color-border)] bg-[var(--fp-color-muted)]/40 text-[var(--fp-color-muted-foreground)]/40 opacity-50 hover:opacity-75"
      )}
      type="button"
      onClick={onClick}
    >
      {line ? (
        <span
          className={cn("h-0.5 w-4 rounded-full")}
          style={{
            borderColor: dashed ? color : undefined,
            borderStyle: dashed ? "dashed" : undefined,
            borderWidth: dashed ? "1.5px 0 0 0" : undefined,
            background: dashed ? "transparent" : color,
            height: dashed ? "0" : undefined,
          }}
        />
      ) : (
        <span
          className={cn("size-2 rounded-full", dashed && "border border-dashed bg-transparent")}
          style={{
            borderColor: dashed ? color : undefined,
            background: dashed ? "transparent" : color,
          }}
        />
      )}
      {label}
      {active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
    </button>
  );
}

/** Non-interactive legend label for scenario lines (Optimistic / Pessimistic).
 *  Matches the Figma design where these are plain indicators, not toggle buttons. */
function LegendLabel({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-2 px-1 text-xs text-[var(--fp-color-muted-foreground)] font-medium">
      <span
        className="h-0 w-4"
        style={{
          borderColor: color,
          borderStyle: dashed ? "dashed" : "solid",
          borderWidth: "1.5px 0 0 0",
        }}
      />
      {label}
    </span>
  );
}
