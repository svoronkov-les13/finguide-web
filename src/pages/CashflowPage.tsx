import { Copy, Plus, Trash2 } from "lucide-react";
import {
  useAddCashflowMutation,
  useDeleteCashflowMutation,
  useDuplicateCashflowMutation,
  usePlanQuery,
  useUpdateCashflowMutation,
} from "@/api/planQueries";
import { Page, PageHeader } from "@/components/layout/Page";
import { MetricCard, MetricsGrid } from "@/components/plan/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatUsd } from "@/lib/utils";
import type { Cashflow } from "@/types/finance";

export function CashflowPage({ type }: { type: "income" | "expense" }) {
  const { data: plan } = usePlanQuery();
  const updateCashflow = useUpdateCashflowMutation();
  const addCashflow = useAddCashflowMutation();
  const duplicateCashflow = useDuplicateCashflowMutation();
  const deleteCashflow = useDeleteCashflowMutation();
  if (!plan) return <Card className="h-96 animate-pulse bg-muted/60" />;

  const items = plan.cashflows.filter((item) => item.type === type);
  const total = items.reduce((sum, item) => sum + (item.enabled ? annualized(item) : 0), 0);
  const title = type === "income" ? "Доходы" : "Расходы";

  return (
    <Page>
      <PageHeader
        title={title}
        description="Флаги, суммы, период действия и темпы роста из финансовой модели."
        actions={
        <Button
          onClick={() =>
            addCashflow.mutate({
              name: type === "income" ? "Новый доход" : "Новый расход",
              type,
              frequency: "monthly",
              amount: 0,
              currency: "USD",
              startYear: plan.settings.startYear,
              endYear: 2076,
              growth: 0.03,
              enabled: true,
              category: type === "income" ? "Ежемесячные доходы" : "Ежемесячные расходы",
            })
          }
        >
          <Plus className="size-4" /> Добавить
        </Button>
        }
      />

      <MetricsGrid>
        <MetricCard label="Активных строк" value={String(items.filter((item) => item.enabled).length)} />
        <MetricCard label="Всего в год" value={formatUsd(total, { compact: true })} />
        <MetricCard label="Средний рост" value={`${Math.round(avg(items.map((item) => item.growth)) * 100)}%`} />
      </MetricsGrid>

      <Card className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[1fr_120px_120px_110px_110px_110px_90px_88px] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-label">
            <span>Название</span><span>Категория</span><span>Сумма</span><span>Период</span><span>Рост</span><span>Статус</span><span className="text-right">Флаг</span><span />
          </div>
          {items.map((item) => (
            <CashflowRow
              key={item.id}
              item={item}
              onChange={(patch) => updateCashflow.mutateAsync({ id: item.id, patch })}
              onDuplicate={() => duplicateCashflow.mutate(item.id)}
              onDelete={() => deleteCashflow.mutate(item.id)}
            />
          ))}
        </div>
      </Card>
    </Page>
  );
}

function CashflowRow({
  item,
  onChange,
  onDuplicate,
  onDelete,
}: {
  item: Cashflow;
  onChange: (patch: Partial<Cashflow>) => Promise<unknown>;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px_110px_110px_110px_90px_88px] items-center gap-3 border-b border-border/60 px-5 py-3 text-xs last:border-b-0">
      <Input defaultValue={item.name} onBlur={(event) => void onChange({ name: event.currentTarget.value })} />
      <Badge variant="subtle">{item.category.replace("Ежемесячные ", "")}</Badge>
      <Input type="number" defaultValue={item.amount} onBlur={(event) => void onChange({ amount: Number(event.currentTarget.value) })} />
      <span className="text-muted-foreground">{item.startYear}-{item.endYear}</span>
      <Input type="number" defaultValue={Math.round(item.growth * 100)} onBlur={(event) => void onChange({ growth: Number(event.currentTarget.value) / 100 })} />
      <Badge variant={item.enabled ? "success" : "subtle"}>{item.enabled ? "Активно" : "Отключено"}</Badge>
      <div className="flex justify-end"><Switch checked={item.enabled} onCheckedChange={(enabled) => void onChange({ enabled })} /></div>
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="iconSm" onClick={onDuplicate} aria-label={`Дублировать ${item.name}`}>
          <Copy className="size-3.5" />
        </Button>
        <Button variant="danger" size="iconSm" onClick={onDelete} aria-label={`Удалить ${item.name}`}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function annualized(item: Cashflow) {
  return item.frequency === "monthly" ? item.amount * 12 : item.amount;
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}
