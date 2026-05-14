import { Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import { usePlanQuery } from "@/api/planQueries";
import { Card } from "@/components/ui/card";
import { formatPercent, formatUsd } from "@/lib/utils";

export function PensionPage() {
  const { data: plan } = usePlanQuery();
  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const point = plan.forecast.find((item) => item.age >= plan.settings.retirementAge) ?? plan.forecast.at(-1)!;
  const realReturn = (1 + plan.settings.investmentReturn) / (1 + plan.settings.inflation) - 1;
  const annualSpend = plan.settings.targetMonthlySpend * 12;
  const spendDownYears = Math.max(0, Math.floor(point.capital / Math.max(annualSpend, 1)));

  return (
    <div className="grid max-w-[1256px] gap-6">
      <header className="flex min-w-0 items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
          <Landmark className="size-5" />
        </span>
        <div>
          <h1 className="page-title">Пенсия</h1>
          <p className="mt-1 text-sm text-muted-foreground">Капитал, достаточность и варианты расходования после выхода на пенсию</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Возраст выхода" value={`${plan.settings.retirementAge} лет`} />
            <MetricCard label="Год выхода" value={String(point.year)} />
            <MetricCard label="Капитал" value={formatUsd(point.capital, { compact: true })} />
            <MetricCard label="Реальная доходность" value={formatPercent(realReturn)} />
          </div>

          <Card className="p-6">
            <SectionHead icon={<TrendingUp className="size-4" />} title="Вариант расходования процентов от накоплений" description="Капитал сохраняется, тратится только инвестиционный доход" />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricCard label="Доход доступный для трат" value={formatUsd(point.capital * realReturn, { compact: true })} />
              <MetricCard label="В текущем выражении" value={formatUsd((point.capital * realReturn) / 1.84, { compact: true })} />
              <MetricCard label="В месяц" value={formatUsd((point.capital * realReturn) / 12 / 1.84, { compact: true })} />
            </div>
          </Card>

          <Card className="p-6">
            <SectionHead icon={<ShieldCheck className="size-4" />} title="Вариант расходования всей суммы накоплений" description="Капитал постепенно расходуется на заданный пенсионный бюджет" />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricCard label="Желаемый расход" value={formatUsd(-annualSpend, { compact: true })} />
              <MetricCard label="Пенсионных лет" value={`${spendDownYears} лет`} />
              <MetricCard label="Возраст израсходования" value={`${plan.settings.retirementAge + spendDownYears} лет`} />
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-5 text-sm text-muted-foreground">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Landmark className="size-4 text-muted-foreground" />
              Пенсионная сводка
            </div>
            <SummaryRow label="Возраст" value={`${plan.settings.retirementAge} лет`} />
            <SummaryRow label="Капитал" value={formatUsd(point.capital, { compact: true })} tone="positive" />
            <SummaryRow label="Расход / год" value={formatUsd(annualSpend, { compact: true })} />
            <SummaryRow label="Хватит на" value={`${spendDownYears} лет`} />
          </Card>
          <HelpBlock title="Backend status">Persisted pension settings выделены в backend follow-up. UI использует текущий `/plans/current` и pension patch endpoint, когда данные доступны.</HelpBlock>
          <HelpBlock title="Модель">Реальная доходность считается как доходность с поправкой на инфляцию, а не простым вычитанием.</HelpBlock>
        </aside>
      </div>
    </div>
  );
}

function SectionHead({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-teal)]/20 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">{icon}</span>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="label-caps">{label}</div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
    </Card>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-b-0">
      <dt>{label}</dt>
      <dd className={tone === "positive" ? "text-[var(--fp-color-teal)]" : tone === "negative" ? "text-[var(--fp-color-coral)]" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function HelpBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-3">
      <span className="pt-0.5">→</span>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  );
}
