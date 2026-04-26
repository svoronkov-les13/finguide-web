import { Plus, Trash2 } from "lucide-react";
import { useAddTrackerEntryMutation, useDeleteTrackerEntryMutation, usePlanQuery, useUpdateTrackerEntryMutation } from "@/api/planQueries";
import { Page, PageHeader } from "@/components/layout/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUsd } from "@/lib/utils";

export function TrackingPage() {
  const { data: plan } = usePlanQuery();
  const addTrackerEntry = useAddTrackerEntryMutation();
  const updateTrackerEntry = useUpdateTrackerEntryMutation();
  const deleteTrackerEntry = useDeleteTrackerEntryMutation();
  const tracker = plan?.tracker ?? [];

  return (
    <Page>
      <PageHeader
        title="Tracking"
        description="Плановые и фактические операции, которые можно сверять с прогнозом."
        actions={
        <Button onClick={() => addTrackerEntry.mutate({ date: new Date().toISOString().slice(0, 10), title: "Новая операция", amount: 0, type: "expense", status: "planned" })}>
          <Plus className="size-4" /> Операция
        </Button>
        }
      />
      <Card className="overflow-hidden">
        {tracker.map((entry) => (
          <div key={entry.id} className="grid grid-cols-[120px_1fr_120px_100px_44px] items-center gap-3 border-b border-border px-5 py-4 text-sm last:border-b-0 max-[760px]:grid-cols-1">
            <Input type="date" defaultValue={entry.date} onBlur={(event) => updateTrackerEntry.mutate({ id: entry.id, patch: { date: event.currentTarget.value } })} />
            <Input defaultValue={entry.title} onBlur={(event) => updateTrackerEntry.mutate({ id: entry.id, patch: { title: event.currentTarget.value } })} />
            <Input type="number" defaultValue={entry.amount} onBlur={(event) => updateTrackerEntry.mutate({ id: entry.id, patch: { amount: Number(event.currentTarget.value) } })} />
            <Badge variant={entry.status === "actual" ? "success" : "subtle"}>{entry.status === "actual" ? "Факт" : "План"}</Badge>
            <Button variant="danger" size="iconSm" onClick={() => deleteTrackerEntry.mutate(entry.id)} aria-label={`Удалить ${entry.title}`}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <div className="px-5 py-3 text-xs font-semibold text-muted-foreground">
          Итого операций: {tracker.length} · баланс: {formatUsd(tracker.reduce((sum, entry) => sum + entry.amount, 0), { compact: true, sign: true })}
        </div>
      </Card>
    </Page>
  );
}
