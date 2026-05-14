import { CalendarCheck, CheckCircle2, CircleDollarSign, Plus, Trash2, WalletCards } from "lucide-react";
import { useAddTrackerEntryMutation, useDeleteTrackerEntryMutation, usePlanQuery, useUpdateTrackerEntryMutation } from "@/api/planQueries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRub } from "@/lib/utils";
import type { TrackerEntry } from "@/types/finance";

export function TrackingPage() {
  const { data: plan } = usePlanQuery();
  const addTrackerEntry = useAddTrackerEntryMutation();
  const updateTrackerEntry = useUpdateTrackerEntryMutation();
  const deleteTrackerEntry = useDeleteTrackerEntryMutation();
  const tracker = plan?.tracker ?? [];
  const totals = tracker.reduce(
    (acc, entry) => {
      acc.balance += entry.amount;
      if (entry.status === "actual") acc.actual += entry.amount;
      if (entry.status === "planned") acc.planned += entry.amount;
      return acc;
    },
    { balance: 0, actual: 0, planned: 0 },
  );

  const addEntry = () =>
    addTrackerEntry.mutate({
      date: new Date().toISOString().slice(0, 10),
      title: "Новая операция",
      amount: 0,
      type: "expense",
      status: "planned",
    });

  return (
    <div className="grid max-w-[1256px] gap-6">
      <header className="flex items-start justify-between gap-5 max-[760px]:block">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
            <CalendarCheck className="size-5" />
          </span>
          <div>
            <h1 className="page-title">Трекер операций</h1>
            <p className="mt-1 text-sm text-muted-foreground">Плановые и фактические операции, которые можно сверять с прогнозом</p>
          </div>
        </div>
        <Button className="max-[760px]:mt-4" onClick={addEntry}>
          <Plus className="size-4" />
          Операция
        </Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          <Card className="px-5 py-4">
            <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
              <InstructionStep index={1} title="План">Добавляйте ожидаемые доходы, расходы и взносы</InstructionStep>
              <InstructionStep index={2} title="Факт">Отмечайте реальные движения денег</InstructionStep>
              <InstructionStep index={3} title="Сверка">Смотрите отклонение от прогноза и корректируйте модель</InstructionStep>
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard icon={<WalletCards className="size-4" />} label="Баланс периода" value={formatRub(totals.balance, { compact: true, sign: true })} />
            <MetricCard icon={<CheckCircle2 className="size-4" />} label="Факт" value={formatRub(totals.actual, { compact: true, sign: true })} tone="positive" />
            <MetricCard icon={<CircleDollarSign className="size-4" />} label="План" value={formatRub(totals.planned, { compact: true, sign: true })} tone="muted" />
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 max-[760px]:block">
              <div>
                <h2 className="font-semibold">Журнал операций</h2>
                <p className="mt-1 text-sm text-muted-foreground">Данные сохраняются в backend-журнале операций текущего плана.</p>
              </div>
              <div className="flex gap-2 max-[760px]:mt-3">
                <Badge variant="subtle">{tracker.length} операций</Badge>
                <Badge variant={totals.balance >= 0 ? "success" : "danger"}>{formatRub(totals.balance, { compact: true, sign: true })}</Badge>
              </div>
            </div>

            <div className="scrollbar-thin overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[130px_1fr_150px_110px_110px_44px] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-label">
                  <span>Дата</span>
                  <span>Операция</span>
                  <span className="text-right">Сумма</span>
                  <span>Тип</span>
                  <span>Статус</span>
                  <span />
                </div>
                {tracker.length > 0 ? (
                  tracker.map((entry) => (
                    <TrackerRow
                      key={entry.id}
                      entry={entry}
                      onUpdate={(patch) => updateTrackerEntry.mutate({ id: entry.id, patch })}
                      onDelete={() => deleteTrackerEntry.mutate(entry.id)}
                    />
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Операций пока нет. Добавьте первую плановую или фактическую операцию.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <CalendarCheck className="size-4 text-muted-foreground" />
              Сводка трекера
            </div>
            <dl className="grid gap-3 text-sm">
              <SummaryRow label="Всего операций" value={String(tracker.length)} />
              <SummaryRow label="Плановых" value={String(tracker.filter((entry) => entry.status === "planned").length)} />
              <SummaryRow label="Фактических" value={String(tracker.filter((entry) => entry.status === "actual").length)} />
              <SummaryRow label="Доходы" value={formatRub(sumByType(tracker, "income"), { compact: true, sign: true })} tone="positive" />
              <SummaryRow label="Расходы" value={formatRub(sumByType(tracker, "expense"), { compact: true, sign: true })} tone="negative" />
              <SummaryRow label="Цели" value={formatRub(sumByType(tracker, "goal"), { compact: true, sign: true })} />
            </dl>
          </Card>

          <HelpBlock title="Что уже интегрировано">Frontend использует общий plan client, а real API сохраняет операции в журнале текущего плана.</HelpBlock>
          <HelpBlock title="Важно">Плановые строки больше не генерируются автоматически: журнал показывает только сохранённые операции.</HelpBlock>
        </aside>
      </div>
    </div>
  );
}

function TrackerRow({ entry, onUpdate, onDelete }: { entry: TrackerEntry; onUpdate: (patch: Partial<TrackerEntry>) => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-[130px_1fr_150px_110px_110px_44px] items-center gap-3 border-b border-border/70 px-5 py-3 text-sm last:border-b-0">
      <Input type="date" defaultValue={entry.date} onBlur={(event) => onUpdate({ date: event.currentTarget.value })} />
      <Input defaultValue={entry.title} onBlur={(event) => onUpdate({ title: event.currentTarget.value })} />
      <Input className="text-right" type="number" defaultValue={entry.amount} onBlur={(event) => onUpdate({ amount: Number(event.currentTarget.value) })} />
      <Badge variant={entry.type === "income" ? "success" : entry.type === "goal" ? "warning" : "danger"}>
        {entry.type === "income" ? "Доход" : entry.type === "goal" ? "Цель" : "Расход"}
      </Badge>
      <button
        type="button"
        className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground"
        onClick={() => onUpdate({ status: entry.status === "actual" ? "planned" : "actual" })}
      >
        {entry.status === "actual" ? "Факт" : "План"}
      </button>
      <Button variant="danger" size="iconSm" onClick={onDelete} aria-label={`Удалить ${entry.title}`}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "positive" | "muted" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label-caps">{label}</div>
          <div className={tone === "positive" ? "mt-3 text-2xl font-bold text-[var(--fp-color-teal)]" : "mt-3 text-2xl font-bold"}>{value}</div>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground">{icon}</span>
      </div>
    </Card>
  );
}

function InstructionStep({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[24px_1fr] gap-3">
      <span className="grid size-6 place-items-center rounded-full border border-border bg-surface text-xs text-muted-foreground">{index}</span>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "positive" ? "text-[var(--fp-color-teal)]" : tone === "negative" ? "text-[var(--fp-color-coral)]" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function HelpBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-3 text-sm text-muted-foreground">
      <span className="pt-0.5">→</span>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  );
}

function sumByType(tracker: TrackerEntry[], type: TrackerEntry["type"]) {
  return tracker.filter((entry) => entry.type === type).reduce((sum, entry) => sum + entry.amount, 0);
}
