import { Download, FileChartColumnIncreasing, RotateCcw, ShieldAlert } from "lucide-react";
import { createPlanWorkbookWithExcelJs, createPlanWorkbookWithSheetJs } from "@/api/exportPlan";
import { usePlanQuery, useResetPlanMutation } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";

export function SummaryPage() {
  const { data: plan } = usePlanQuery();
  const resetPlan = useResetPlanMutation();
  if (!plan) return <Card className="h-96 max-w-[1256px] animate-pulse bg-muted/60" />;

  const current = plan.forecast[2] ?? plan.forecast[0];
  const final = plan.forecast.at(-1)!;
  const exportSheetJs = () => downloadXlsx(createPlanWorkbookWithSheetJs(plan), "finguide-plan-sheetjs.xlsx");
  const exportExcelJs = async () => downloadXlsx(await createPlanWorkbookWithExcelJs(plan), "finguide-plan-exceljs.xlsx");

  return (
    <div className="grid max-w-[1256px] gap-6">
      <header className="flex items-start justify-between gap-5 max-[760px]:block">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
            <FileChartColumnIncreasing className="size-5" />
          </span>
          <div>
            <h1 className="page-title">Сводка</h1>
            <p className="mt-1 text-sm text-muted-foreground">Доходы, расходы, цели, накопления и ключевые риски</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-[760px]:mt-4">
          <Button variant="secondary" onClick={exportSheetJs}>
            <Download className="size-4" /> SheetJS
          </Button>
          <Button variant="secondary" onClick={() => void exportExcelJs()}>
            <Download className="size-4" /> ExcelJS
          </Button>
          <Button variant="danger" onClick={() => resetPlan.mutate()}>
            <RotateCcw className="size-4" /> Сбросить
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="Доходы сейчас" value={formatUsd(current.income, { compact: true })} />
            <MetricCard label="Расходы сейчас" value={formatUsd(Math.abs(current.expenses), { compact: true })} />
            <MetricCard label="Накопления сейчас" value={formatUsd(current.capital, { compact: true })} />
            <MetricCard label={`Капитал ${final.year}`} value={formatUsd(final.capital, { compact: true })} />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Рекомендации</h2>
              <p className="mt-1 text-sm text-muted-foreground">Сводные действия по текущей модели</p>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-3">
              <Recommendation>Ускорить формирование финансовой подушки до 2027 года.</Recommendation>
              <Recommendation>Проверить ипотечные расходы при пессимистичном сценарии.</Recommendation>
              <Recommendation>Сохранить плановый уровень доходности инвестиций не ниже 6%.</Recommendation>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_160px_160px] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-label max-[760px]:grid-cols-1">
              <span>Раздел</span><span>Сейчас</span><span>Финал</span><span>Статус</span>
            </div>
            <SummaryLine label="Доходы" now={formatUsd(current.income, { compact: true })} final={formatUsd(final.income, { compact: true })} status="Стабильно" />
            <SummaryLine label="Расходы" now={formatUsd(Math.abs(current.expenses), { compact: true })} final={formatUsd(Math.abs(final.expenses), { compact: true })} status="Контроль" />
            <SummaryLine label="Цели" now={formatUsd(Math.abs(current.goals), { compact: true })} final={formatUsd(Math.abs(final.goals), { compact: true })} status="План" />
          </Card>
        </div>

        <aside className="grid content-start gap-5 text-sm text-muted-foreground">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <ShieldAlert className="size-4 text-muted-foreground" />
              Контроль рисков
            </div>
            <SummaryRow label="Health score" value={`${plan.dashboardSnapshot?.healthScore ?? 0}/100`} />
            <SummaryRow label="Сценарий" value={plan.scenarios.find((scenario) => scenario.id === plan.activeScenario)?.name ?? "Базовый"} />
            <SummaryRow label="Целей" value={String(plan.goals.length)} />
          </Card>
          <HelpBlock title="Экспорт">Экспорт остаётся клиентским: SheetJS и ExcelJS формируют XLSX из текущего `FinancialPlan` snapshot.</HelpBlock>
          <HelpBlock title="Backend">Import/export endpoints есть в OpenAPI шире real Springdoc, поэтому UI не зависит от них для базовой выгрузки.</HelpBlock>
        </aside>
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

function Recommendation({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[22px] border border-border bg-surface/35 p-4 text-sm leading-5 text-muted-foreground">{children}</div>;
}

function SummaryLine({ label, now, final, status }: { label: string; now: string; final: string; status: string }) {
  return (
    <div className="grid grid-cols-[1fr_160px_160px_160px] gap-3 border-b border-border/70 px-5 py-4 text-sm last:border-b-0 max-[760px]:grid-cols-1">
      <span className="font-semibold">{label}</span>
      <span>{now}</span>
      <span>{final}</span>
      <span className="text-[var(--fp-color-teal)]">{status}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-b-0">
      <dt>{label}</dt>
      <dd className="text-foreground">{value}</dd>
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

function downloadXlsx(data: BlobPart, filename: string) {
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
