import { Download, RotateCcw } from "lucide-react";
import { createPlanWorkbookWithExcelJs, createPlanWorkbookWithSheetJs } from "@/api/exportPlan";
import { usePlanQuery, useResetPlanMutation } from "@/api/planQueries";
import { Page, PageHeader } from "@/components/layout/Page";
import { DataPanel, SurfaceRow } from "@/components/plan/DataPanel";
import { MetricCard, MetricsGrid } from "@/components/plan/MetricCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";

export function SummaryPage() {
  const { data: plan } = usePlanQuery();
  const resetPlan = useResetPlanMutation();
  if (!plan) return <Card className="h-96 animate-pulse bg-muted/60" />;

  const current = plan.forecast[2];
  const final = plan.forecast.at(-1)!;
  const exportSheetJs = () => downloadXlsx(createPlanWorkbookWithSheetJs(plan), "finguide-plan-sheetjs.xlsx");
  const exportExcelJs = async () => downloadXlsx(await createPlanWorkbookWithExcelJs(plan), "finguide-plan-exceljs.xlsx");

  return (
    <Page>
      <PageHeader
        title="Summary"
        description="Сводка доходов, расходов, целей, накоплений и ключевых рисков."
        actions={
        <>
          <Button variant="secondary" onClick={exportSheetJs}>
            <Download className="size-4" /> SheetJS
          </Button>
          <Button variant="secondary" onClick={() => void exportExcelJs()}>
            <Download className="size-4" /> ExcelJS
          </Button>
          <Button variant="danger" onClick={() => resetPlan.mutate()}>
            <RotateCcw className="size-4" /> Сбросить
          </Button>
        </>
        }
      />
      <MetricsGrid columns={4}>
        <MetricCard label="Доходы сейчас" value={formatUsd(current.income, { compact: true })} />
        <MetricCard label="Расходы сейчас" value={formatUsd(Math.abs(current.expenses), { compact: true })} />
        <MetricCard label="Накопления сейчас" value={formatUsd(current.capital, { compact: true })} />
        <MetricCard label="Капитал 2054" value={formatUsd(final.capital, { compact: true })} />
      </MetricsGrid>
      <DataPanel title="Рекомендации">
        <div className="grid gap-3 md:grid-cols-3">
          <SurfaceRow>Ускорить формирование финансовой подушки до 2027 года.</SurfaceRow>
          <SurfaceRow>Проверить ипотечные расходы при пессимистичном сценарии.</SurfaceRow>
          <SurfaceRow>Сохранить плановый уровень доходности инвестиций не ниже 6%.</SurfaceRow>
        </div>
      </DataPanel>
    </Page>
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
