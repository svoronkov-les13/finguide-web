import { useState } from "react";
import { CircleDollarSign, PiggyBank, Trash2, Pencil } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useContributionsQuery,
  useAddContributionMutation,
  useUpdateContributionMutation,
  useDeleteContributionMutation,
} from "@/api/planQueries";
import { usePlanQuery } from "@/api/planQueries";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, formatRub } from "@/lib/utils";
import type { Contribution } from "@/types/finance";

// ─── Contribution Modal ───────────────────────────────────────────────────────

interface ContributionModalProps {
  goals: { id: string; name: string }[];
  initial?: Contribution | null;
  onSave: (data: Omit<Contribution, "id">) => void;
  onCancel: () => void;
  saving: boolean;
  t: ReturnType<typeof useI18n>["t"];
}

function ContributionModal({ goals, initial, onSave, onCancel, saving, t }: ContributionModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [goalId, setGoalId] = useState<string>(initial?.goalId ?? "");
  const [amount, setAmount] = useState<string>(String(initial?.amount ?? ""));
  const [currency, setCurrency] = useState<"RUB" | "USD">(initial?.currency ?? "RUB");
  const [date, setDate] = useState<string>(initial?.date ?? today);
  const [note, setNote] = useState<string>(initial?.note ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      goalId: goalId || null,
      amount: Number(amount) || 0,
      currency,
      date,
      note: note || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-semibold text-[var(--fp-color-foreground)]">
          {initial ? t("savings.modalEditTitle") : t("savings.modalAddTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Goal */}
          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.goal")}</span>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            >
              <option value="">{t("savings.noGoal")}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>

          {/* Amount + Currency */}
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.amount")}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:ring-1 focus:ring-[var(--fp-color-teal)]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.currency")}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "RUB" | "USD")}
                className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:ring-1 focus:ring-[var(--fp-color-teal)]"
              >
                <option value="RUB">₽ RUB</option>
                <option value="USD">$ USD</option>
              </select>
            </label>
          </div>

          {/* Date */}
          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.date")}</span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            />
          </label>

          {/* Note */}
          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.note")}</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("savings.notePlaceholder")}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] placeholder:text-[var(--fp-color-label)] outline-none focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? t("savings.saving") : t("savings.save")}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              {t("savings.cancel")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── SavingsPage ──────────────────────────────────────────────────────────────

export function SavingsPage() {
  const { t } = useI18n();
  const { data: plan } = usePlanQuery();
  const { data: contributions = [], isLoading } = useContributionsQuery();
  const addMutation = useAddContributionMutation();
  const updateMutation = useUpdateContributionMutation();
  const deleteMutation = useDeleteContributionMutation();

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Contribution | null>(null);

  const goals = plan?.goals ?? [];
  const goalMap = new Map(goals.map((g) => [g.id, g.name]));

  const totalAmount = contributions.reduce((sum, c) => sum + (c.currency === "RUB" ? c.amount : c.amount), 0);

  // Group by goal
  const byGoal = contributions.reduce<Record<string, Contribution[]>>((acc, c) => {
    const key = c.goalId ?? "__none__";
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  const openEdit = (c: Contribution) => { setEditing(c); setModal("edit"); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = (data: Omit<Contribution, "id">) => {
    if (modal === "add") {
      addMutation.mutate(data, { onSuccess: closeModal });
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, patch: data }, { onSuccess: closeModal });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("savings.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Page>
      <PageHeader
        title={t("savings.title")}
        description={t("savings.subtitle")}
        icon={<CircleDollarSign className="size-5" />}
        actions={
          <Button onClick={() => setModal("add")}>
            {t("savings.addContribution")}
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">
            {t("savings.totalContributions")}
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--fp-color-foreground)]">
            {contributions.length}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">
            {t("savings.totalAmount")}
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--fp-color-teal)]">
            {formatRub(totalAmount)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[var(--fp-color-label)]">
            {t("savings.perGoal")}
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--fp-color-foreground)]">
            {Object.keys(byGoal).length}
          </div>
        </Card>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="h-48 animate-pulse bg-[var(--fp-color-surface)]" />
      ) : contributions.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <PiggyBank className="size-12 text-[var(--fp-color-label)]" />
          <div>
            <div className="font-semibold text-[var(--fp-color-foreground)]">{t("savings.noContributions")}</div>
            <div className="mt-1 text-sm text-[var(--fp-color-label)]">{t("savings.noContributionsHint")}</div>
          </div>
          <Button onClick={() => setModal("add")}>{t("savings.addContribution")}</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(byGoal).map(([goalId, items]) => {
            const goalName = goalId === "__none__" ? t("savings.noGoal") : (goalMap.get(goalId) ?? goalId);
            const groupTotal = items.reduce((s, c) => s + c.amount, 0);
            return (
              <Card key={goalId} className="overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between border-b border-[var(--fp-color-border)] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="size-4 text-[var(--fp-color-teal)]" />
                    <span className="font-semibold text-[var(--fp-color-foreground)]">{goalName}</span>
                    <span className="text-sm text-[var(--fp-color-label)]">· {items.length}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--fp-color-teal)]">{formatRub(groupTotal)}</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[var(--fp-color-border)]/60">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--fp-color-surface)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[15px] font-semibold text-[var(--fp-color-foreground)]">
                            {c.currency === "RUB" ? formatRub(c.amount) : `$${c.amount.toLocaleString()}`}
                          </span>
                          <span className="text-[12px] text-[var(--fp-color-label)]">{c.date}</span>
                        </div>
                        {c.note && (
                          <div className="mt-0.5 text-[12px] text-[var(--fp-color-label)]">{c.note}</div>
                        )}
                      </div>
                      <div className={cn("flex gap-1 opacity-0 transition-opacity group-hover:opacity-100")}>
                        <button
                          onClick={() => openEdit(c)}
                          className="grid size-7 place-items-center rounded-full hover:bg-[var(--fp-color-surface-hover)] text-[var(--fp-color-label)] transition-colors"
                          title={t("savings.editContribution")}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="grid size-7 place-items-center rounded-full hover:bg-red-500/10 text-[var(--fp-color-label)] hover:text-red-500 transition-colors"
                          title={t("savings.deleteContribution")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ContributionModal
          goals={goals}
          initial={modal === "edit" ? editing : null}
          onSave={handleSave}
          onCancel={closeModal}
          saving={addMutation.isPending || updateMutation.isPending}
          t={t}
        />
      )}
    </Page>
  );
}
