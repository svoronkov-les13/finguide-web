import { useState, useMemo } from "react";
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
import { formatRub, cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import type { ForecastPoint, FinancialPlan } from "@/types/finance";
import { useTrackerDeviation } from "@/hooks/useTrackerDeviation";
import { Dialog, DialogContent } from "@/components/ui/dialog";


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
    return {
      ...point,
      expensesAbs: Math.abs(point.expenses),
      goalsAbs: Math.abs(point.goals) / 1_000_000,
      capitalRubMln: point.capital / 1_000_000,
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
  const hintVisible = useUiStore((state) => state.hintVisible);
  const setHintVisible = useUiStore((state) => state.setHintVisible);
  const tracker = useTrackerDeviation();

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

  // Apply tracker deviation: adjust forecast for the tracked year
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const adjustedForecast = useMemo(() => {
    if (!plan?.forecast || !tracker.hasData || tracker.deviation === 0) return plan?.forecast;
    return plan.forecast.map((point) => {
      if (point.year !== tracker.year) return point;
      // Adjust capital and savings for the tracked year
      const adjustedSavings = point.savings + tracker.deviation;
      const adjustedCapital = Math.max(0, point.capital + tracker.deviation);
      return { ...point, savings: adjustedSavings, capital: adjustedCapital };
    });
  }, [plan?.forecast, tracker]);

  const data = useMemo(() => buildForecastChartData(adjustedForecast, plan?.scenarioForecasts), [adjustedForecast, plan?.scenarioForecasts]);
  const lineData = useMemo(
    () => buildForecastChartData(plan?.monthlyForecast?.length ? plan.monthlyForecast : adjustedForecast, plan?.scenarioForecasts),
    [adjustedForecast, plan?.monthlyForecast, plan?.scenarioForecasts],
  );
  const lineXAxisKey = xAxisMode === "year" && lineData.some((point) => point.label) ? "label" : xAxisMode;
  const chartTop = chartTopRubMln(data);
  const ticks = chartTicks(chartTop);
  const retirementYear = plan ? plan.settings.birthYear + plan.settings.retirementAge : undefined;

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
    const retirementPoint = lineData.find((point) => point.year === retirementYear) ?? data.find((point) => point.year === retirementYear);
    const retirementCapitalVal = retirementPoint ? (retirementPoint.capital / 1_000_000).toFixed(1) : "80.3";
    const retirementReferenceX = xAxisMode === "year" && lineXAxisKey === "label"
      ? lineData.find((point) => point.year === retirementYear && point.monthNumber === 12)?.label
      : xAxisMode === "year" ? retirementYear : plan.settings.retirementAge;
    const pensionText = `${t("chart.pensionMarker").split(":")[0]}: ${retirementCapitalVal} млн`;

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
            label={t("chart.baseFull")}
            line
            active={visibleSeries.savings}
            onClick={() => toggleSeries("savings")}
          />
          {plan.scenarioForecasts?.optimistic && (
            <LegendPill
              color={CHART_COLORS.optimistic}
              label={t("chart.optimisticFull")}
              line
              dashed
              active={visibleSeries.savings}
              onClick={() => toggleSeries("savings")}
            />
          )}
          {plan.scenarioForecasts?.pessimistic && (
            <LegendPill
              color={CHART_COLORS.pessimistic}
              label={t("chart.pessimisticFull")}
              line
              dashed
              active={visibleSeries.savings}
              onClick={() => toggleSeries("savings")}
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
        <div className={cn("mt-4 w-full overflow-hidden relative", isModal ? "flex-1 min-h-[250px]" : "h-[250px]")}>
          {/* Retirement Capital reference label */}
          {retirementCapitalVal && (
            <div className="absolute right-10 top-2 z-10 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/80 px-3 py-1 text-[11px] font-bold text-[var(--fp-color-muted-foreground)] shadow-[var(--fp-shadow-soft)]">
              {pensionText}
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={lineData} syncId="finance" margin={{ top: 18, right: 22, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--fp-color-border)" strokeDasharray="3 3" />
              {plan.scenarioForecasts?.optimistic && plan.scenarioForecasts?.pessimistic ? (
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="capitalRange"
                  stroke="none"
                  fill="rgba(26, 20, 27, 0.04)"
                  connectNulls
                />
              ) : null}
              <XAxis dataKey={lineXAxisKey} tickLine={false} axisLine={false} minTickGap={20} tick={false} />
              <YAxis
                domain={[0, chartTop]}
                ticks={ticks}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (value === 0 ? "0.0" : String(value))}
                tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }}
                width={58}
              />
              <ReferenceLine y={0} stroke={CHART_COLORS.zeroLine} strokeWidth={1.5} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  return (
                    <div className="rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-3 text-xs shadow-[var(--fp-shadow-tooltip)]">
                      <div className="mb-3 font-bold text-[var(--fp-color-foreground)] border-b border-[var(--fp-color-border)] pb-2">
                        {t("chart.tooltipTitle", {
                          year: String(xAxisMode === "year" ? (row.label ?? label) : row.year),
                          age: String(xAxisMode === "age" ? label : row.age),
                        })}
                      </div>
                      <div className="text-[var(--fp-color-muted-foreground)] mb-1 uppercase tracking-wider text-[10px]">{t("chart.savings")}</div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 ml-2 border-l-2 border-[var(--fp-color-border)] pl-2">
                        <span className="text-[var(--fp-color-foreground)] font-medium">— {t("chart.baseFull")}</span>
                        <span className="font-semibold">{formatRub(row.capitalRubMln * 1_000_000, { compact: true })}</span>
                        {row.capitalOptimisticRubMln !== undefined ? (
                          <>
                            <span className="text-[var(--fp-color-teal)]">-- {t("chart.optimisticFull")}</span>
                            <span className="font-semibold">{formatRub(row.capitalOptimisticRubMln * 1_000_000, { compact: true })}</span>
                          </>
                        ) : null}
                        {row.capitalPessimisticRubMln !== undefined ? (
                          <>
                            <span className="text-[var(--fp-color-muted-foreground)]">— {t("chart.pessimisticFull")}</span>
                            <span className="font-semibold">{formatRub(row.capitalPessimisticRubMln * 1_000_000, { compact: true })}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                }}
              />
              {retirementYear ? (
                <ReferenceLine
                  x={retirementReferenceX}
                  stroke={CHART_COLORS.reference}
                  strokeDasharray="6 5"
                />
              ) : null}
              <Line isAnimationActive={false} type="monotone" dataKey="capitalRubMln" stroke={CHART_COLORS.savings} strokeWidth={3} dot={false} name={t("chart.savings")} hide={!visibleSeries.savings} />
              {plan.scenarioForecasts?.optimistic ? <Line isAnimationActive={false} type="monotone" dataKey="capitalOptimisticRubMln" stroke={CHART_COLORS.optimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name={t("chart.optimisticFull")} hide={!visibleSeries.savings} /> : null}
              {plan.scenarioForecasts?.pessimistic ? <Line isAnimationActive={false} type="monotone" dataKey="capitalPessimisticRubMln" stroke={CHART_COLORS.pessimistic} strokeDasharray="6 6" strokeWidth={2} dot={false} name={t("chart.pessimisticFull")} hide={!visibleSeries.savings} /> : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Subtle dividing line */}
        <div className="my-3 border-t border-[var(--fp-color-border)] opacity-60" />

        {/* Bottom Chart: Cash Flows (Grouped Bars) */}
        <div className={cn("mt-2 w-full overflow-hidden relative", isModal ? "flex-1 min-h-[220px]" : "h-[220px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} syncId="finance" margin={{ top: 10, right: 22, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--fp-color-border)" strokeDasharray="3 3" />
              <XAxis dataKey={xAxisMode} tickLine={false} axisLine={false} minTickGap={20} tick={{ fontSize: 12, fill: 'var(--fp-color-muted-foreground)' }} />
              
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
                  
                  // Helper to get active goal names
                  const getActiveGoalNames = (year: number): string[] => {
                    const list: string[] = [];
                    if (plan?.goals) {
                      plan.goals.forEach((g) => {
                        if (g.targetYear === year) {
                          list.push(g.name);
                        }
                      });
                    }
                    if (plan?.cashflows) {
                      plan.cashflows.forEach((cf) => {
                        if (cf.type === "goal" && cf.enabled && cf.startYear <= year && (cf.endYear === null || cf.endYear >= year)) {
                          list.push(cf.name);
                        }
                      });
                    }
                    return list;
                  };

                  const activeGoals = getActiveGoalNames(row.year);

                  return (
                    <div className="rounded-[var(--fp-radius-xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] p-3 text-xs shadow-[var(--fp-shadow-tooltip)] min-w-[200px]">
                      <div className="mb-3 font-bold text-[var(--fp-color-foreground)] border-b border-[var(--fp-color-border)] pb-2">
                        {t("chart.tooltipTitleFlows", {
                          year: String(xAxisMode === "year" ? label : row.year),
                          age: String(xAxisMode === "age" ? label : row.age),
                        })}
                      </div>
                      <div className="text-[var(--fp-color-muted-foreground)] mb-1 uppercase tracking-wider text-[10px]">{t("chart.flows")}</div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 ml-2 border-l-2 border-[var(--fp-color-border)] pl-2">
                        {visibleSeries.income && (
                          <>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background: CHART_COLORS.income}} />{t("chart.income")}</span>
                            <span className="font-semibold">{formatRub(row.incomeRubMln * 1_000_000, { compact: true })}</span>
                          </>
                        )}
                        {visibleSeries.expenses && (
                          <>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background: CHART_COLORS.expenses}} />{t("chart.expenses")}</span>
                            <span className="font-semibold">{formatRub(row.onlyExpensesRubMln * 1_000_000, { compact: true })}</span>
                          </>
                        )}
                        {visibleSeries.goals && (
                          <>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-[var(--fp-color-border)] bg-transparent" style={{borderColor: CHART_COLORS.goals, borderWidth: "1.5px", borderStyle: "dashed"}} />{t("chart.goals")}</span>
                            <span className="font-semibold">{formatRub(row.goalsAbs * 1_000_000, { compact: true })}</span>
                          </>
                        )}
                      </div>

                      {/* Display names of active goals in this year exactly like in Figma! */}
                      {activeGoals.length > 0 && visibleSeries.goals && (
                        <div className="mt-3 pt-2 border-t border-[var(--fp-color-border)] flex flex-col gap-1.5 ml-2 pl-2 border-l-2 border-[var(--fp-color-border)]">
                          {activeGoals.map((name, i) => (
                            <div key={i} className="font-semibold text-[var(--fp-color-foreground)] flex items-center gap-1">
                              <span className="size-1 rounded-full bg-[var(--fp-color-foreground)]" />
                              {name}
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
                  stroke={CHART_COLORS.reference}
                  strokeDasharray="6 5"
                />
              ) : null}
              <Bar isAnimationActive={false} dataKey="incomeRubMln" barSize={14} radius={[4, 4, 0, 0]} fill={CHART_COLORS.income} fillOpacity={0.95} name={t("chart.income")} hide={!visibleSeries.income} />
              <Bar isAnimationActive={false} dataKey="onlyExpensesRubMln" barSize={14} radius={[4, 4, 0, 0]} fill={CHART_COLORS.expenses} fillOpacity={0.95} name={t("chart.expenses")} hide={!visibleSeries.expenses} />
              <Brush
                startIndex={brushRange.start}
                endIndex={brushRange.end}
                onChange={(e) => {
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
        <Card className="w-full p-6 border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)] shadow-sm">
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
