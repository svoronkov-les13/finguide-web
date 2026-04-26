import { usePlanQuery } from "@/api/planQueries";
import { Page, PageHeader } from "@/components/layout/Page";
import { DataPanel } from "@/components/plan/DataPanel";
import { MetricCard, MetricsGrid } from "@/components/plan/MetricCard";
import { Card } from "@/components/ui/card";
import { formatPercent, formatUsd } from "@/lib/utils";

export function PensionPage() {
  const { data: plan } = usePlanQuery();
  if (!plan) return <Card className="h-96 animate-pulse bg-muted/60" />;

  const point = plan.forecast.find((item) => item.age >= plan.settings.retirementAge) ?? plan.forecast.at(-1)!;
  const realReturn = (1 + plan.settings.investmentReturn) / (1 + plan.settings.inflation) - 1;
  const annualSpend = plan.settings.targetMonthlySpend * 12;

  return (
    <Page>
      <PageHeader title="Пенсия" description="Две модели расходования: проценты от накоплений или вся сумма накоплений." />
      <MetricsGrid columns={4}>
        <MetricCard label="Возраст выхода" value={`${plan.settings.retirementAge} лет`} />
        <MetricCard label="Год выхода" value={String(point.year)} />
        <MetricCard label="Капитал" value={formatUsd(point.capital, { compact: true })} />
        <MetricCard label="Реальная доходность" value={formatPercent(realReturn)} />
      </MetricsGrid>
      <DataPanel title="Вариант расходования процентов от накоплений">
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Доход доступный для трат" value={formatUsd(point.capital * realReturn, { compact: true })} />
          <MetricCard label="В текущем выражении" value={formatUsd((point.capital * realReturn) / 1.84, { compact: true })} />
          <MetricCard label="В месяц" value={formatUsd((point.capital * realReturn) / 12 / 1.84, { compact: true })} />
        </div>
      </DataPanel>
      <DataPanel title="Вариант расходования всей суммы накоплений">
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Желаемый расход" value={formatUsd(-annualSpend, { compact: true })} />
          <MetricCard label="Пенсионных лет" value={`${Math.floor(point.capital / annualSpend)} лет`} />
          <MetricCard label="Возраст израсходования" value={`${plan.settings.retirementAge + Math.floor(point.capital / annualSpend)} лет`} />
        </div>
      </DataPanel>
    </Page>
  );
}
