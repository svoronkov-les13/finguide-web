import { useState } from "react";
import { CircleDollarSign, Plus, Trash2, Pencil, Coins, PiggyBank, Target, CalendarDays, Wallet } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useContributionsQuery,
  useAddContributionMutation,
  useUpdateContributionMutation,
  useDeleteContributionMutation,
  usePlanQuery,
} from "@/api/planQueries";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, formatRub } from "@/lib/utils";
import type { Contribution } from "@/types/finance";

// ─── Contribution Modal ───────────────────────────────────────────────────────

interface ContributionModalProps {
  goals: { id: string; name: string }[];
  initial?: Contribution | null;
  defaultGoalId?: string;
  onSave: (data: Omit<Contribution, "id">) => void;
  onCancel: () => void;
  saving: boolean;
  t: ReturnType<typeof useI18n>["t"];
}

function ContributionModal({ goals, initial, defaultGoalId, onSave, onCancel, saving, t }: ContributionModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [goalId, setGoalId] = useState<string>(initial?.goalId ?? defaultGoalId ?? "");
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
      <Card className="w-full max-w-md p-6 shadow-2xl border-[var(--fp-color-border-strong)]">
        <h2 className="mb-5 text-lg font-semibold text-[var(--fp-color-foreground)]">
          {initial ? t("savings.modalEditTitle") : t("savings.modalAddTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.goal")}</span>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            >
              <option value="">{t("savings.noGoal")}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>

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
                className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.currency")}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "RUB" | "USD")}
                className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
              >
                <option value="RUB">₽ RUB</option>
                <option value="USD">$ USD</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.date")}</span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[var(--fp-color-label)]">{t("savings.note")}</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("savings.notePlaceholder")}
              className="rounded-[10px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-3 py-2 text-sm text-[var(--fp-color-foreground)] placeholder:text-[var(--fp-color-label)] outline-none focus:border-[var(--fp-color-teal)] focus:ring-1 focus:ring-[var(--fp-color-teal)]"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1 bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)] hover:opacity-90 transition-opacity">
              {saving ? t("savings.saving") : t("savings.save")}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 border-[var(--fp-color-border)] text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors">
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
  const [targetGoalId, setTargetGoalId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("__all__");

  const goals = plan?.goals ?? [];
  const goalMap = new Map(goals.map((g) => [g.id, g.name]));

  // Stats
  const totalAmount = contributions.reduce((sum, c) => sum + (c.currency === "RUB" ? c.amount : c.amount), 0);
  const totalCost = goals.reduce((sum, g) => sum + g.cost, 0);
  const overallProgress = totalCost > 0 ? Math.round((totalAmount / totalCost) * 100) : 0;
  
  const completedGoals = goals.filter(g => {
    const goalSaved = contributions.filter(c => c.goalId === g.id).reduce((s, c) => s + c.amount, 0);
    return goalSaved >= g.cost;
  });
  const inProgressGoals = goals.length - completedGoals.length;

  const openAdd = (goalId?: string) => { setTargetGoalId(goalId); setModal("add"); };
  const openEdit = (c: Contribution) => { setEditing(c); setModal("edit"); };
  const closeModal = () => { setModal(null); setEditing(null); setTargetGoalId(undefined); };

  const handleSave = (data: Omit<Contribution, "id">) => {
    if (modal === "add") {
      addMutation.mutate({ planId: plan!.planId!, ...data }, { onSuccess: closeModal });
    } else if (editing) {
      updateMutation.mutate({ planId: plan!.planId!, id: editing.id, patch: data }, { onSuccess: closeModal });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("savings.confirmDelete"))) {
      deleteMutation.mutate({ planId: plan!.planId!, id });
    }
  };

  const filteredGoals = activeTab === "__all__" ? goals : goals.filter(g => g.id === activeTab);

  return (
    <Page>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--fp-color-foreground)]">Учёт накоплений</h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <Card className="p-5 border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)]">
            <Coins className="size-3.5" />
            ВСЕГО ОТЛОЖЕНО
          </div>
          <div className="mt-3 text-[28px] font-bold text-[var(--fp-color-foreground)]">
            {formatRub(totalAmount, { compact: true })}
          </div>
        </Card>

        <Card className="p-5 border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)]">
            <Target className="size-3.5" />
            ОБЩИЙ ПРОГРЕСС
          </div>
          <div className="mt-3 text-[28px] font-bold text-[var(--fp-color-foreground)]">
            {overallProgress}%
          </div>
          <div className="mt-2 h-1.5 w-16 rounded-full bg-[var(--fp-color-border)] overflow-hidden">
            <div className="h-full bg-[var(--fp-color-teal)] transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </Card>

        <Card className="p-5 border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)]">
            <CircleDollarSign className="size-3.5" />
            ЦЕЛЕЙ ДОСТИГНУТО
          </div>
          <div className="mt-3 text-[28px] font-bold text-[var(--fp-color-foreground)]">
            {completedGoals.length} <span className="text-[16px] font-medium text-[var(--fp-color-label)]">из {goals.length}</span>
          </div>
        </Card>

        <Card className="p-5 border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-label)]">
            <PiggyBank className="size-3.5" />
            В ПРОЦЕССЕ
          </div>
          <div className="mt-3 text-[28px] font-bold text-[var(--fp-color-foreground)]">
            {inProgressGoals}
          </div>
        </Card>
      </div>

      {/* Goal Filters & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 bg-[var(--fp-color-surface)] p-1 rounded-full border border-[var(--fp-color-border)]">
          <button
            onClick={() => setActiveTab("__all__")}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all",
              activeTab === "__all__" ? "bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)] shadow-sm" : "text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
            )}
          >
            Все цели
          </button>
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all max-w-[200px] truncate",
                activeTab === g.id ? "bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)] shadow-sm" : "text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)]"
              )}
            >
              <span className="truncate">{g.name}</span>
            </button>
          ))}
        </div>
        
        <Button 
          onClick={() => openAdd()} 
          className="rounded-full bg-[var(--fp-color-foreground)] text-[var(--fp-color-background)] px-5 hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4 mr-1.5" />
          Внести взнос
        </Button>
      </div>

      {/* Goal Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card className="h-40 animate-pulse bg-[var(--fp-color-surface)] border-[var(--fp-color-border)]" />
          <Card className="h-40 animate-pulse bg-[var(--fp-color-surface)] border-[var(--fp-color-border)]" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {filteredGoals.map(g => {
            const saved = contributions.filter(c => c.goalId === g.id).reduce((s, c) => s + c.amount, 0);
            const remaining = Math.max(0, g.cost - saved);
            const progress = g.cost > 0 ? Math.min(100, Math.round((saved / g.cost) * 100)) : 0;
            const isCompleted = saved >= g.cost;
            const count = contributions.filter(c => c.goalId === g.id).length;

            return (
              <Card key={g.id} className={cn("p-5 border-[var(--fp-color-border-strong)] transition-all", isCompleted ? "bg-[var(--fp-color-surface-hover)]" : "bg-[var(--fp-color-surface)]")}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border-strong)] bg-[var(--fp-color-card)] text-[var(--fp-color-foreground)]">
                      {isCompleted ? <CircleDollarSign className="size-5 text-[var(--fp-color-teal)]" /> : <Wallet className="size-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px] text-[var(--fp-color-foreground)]">{g.name}</h3>
                      <div className="text-[12px] text-[var(--fp-color-label)]">
                        Цель: {g.targetYear} <span className="mx-1">·</span> {count} взноса
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => openAdd(g.id)}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)] px-3 py-1 text-[12px] font-semibold text-[var(--fp-color-foreground)] hover:bg-[var(--fp-color-surface-hover)] transition-colors"
                  >
                    <Plus className="size-3" /> Взнос
                  </button>
                </div>

                <div className="mt-5 flex items-end justify-end mb-2">
                  <span className="text-[14px] font-bold text-[var(--fp-color-teal)]">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--fp-color-border)] overflow-hidden">
                  <div className="h-full bg-[var(--fp-color-foreground)] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-[var(--fp-color-label)]">
                  <div>
                    <div className="mb-0.5">НАКОПЛЕНО</div>
                    <div className="text-[14px] font-bold text-[var(--fp-color-foreground)] lowercase">{formatRub(saved, { compact: true })}</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-0.5">ОСТАЛОСЬ</div>
                    <div className="text-[14px] font-bold text-[var(--fp-color-foreground)] lowercase">{formatRub(remaining, { compact: true })}</div>
                  </div>
                  <div className="text-right">
                    <div className="mb-0.5">СТОИМОСТЬ</div>
                    <div className="text-[14px] font-bold text-[var(--fp-color-foreground)] lowercase">{formatRub(g.cost, { compact: true })}</div>
                  </div>
                </div>
              </Card>
            );
          })}
          {filteredGoals.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-[var(--fp-color-border)] rounded-2xl">
              <p className="text-[14px] text-[var(--fp-color-label)]">Нет целей для отображения</p>
            </div>
          )}
        </div>
      )}

      {/* History Table */}
      <Card className="overflow-hidden border-[var(--fp-color-border-strong)] bg-[var(--fp-color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--fp-color-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--fp-color-label)]" />
            <h2 className="font-semibold text-[15px] text-[var(--fp-color-foreground)]">История взносов</h2>
          </div>
          <span className="text-[12px] text-[var(--fp-color-label)]">{contributions.length} записей</span>
        </div>
        
        {contributions.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--fp-color-label)]">
            Взносов пока нет
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[var(--fp-color-border)] bg-[var(--fp-color-surface-hover)] text-[11px] uppercase tracking-wider text-[var(--fp-color-label)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">ЦЕЛЬ</th>
                  <th className="px-5 py-3 font-semibold">ДАТА</th>
                  <th className="px-5 py-3 font-semibold">СУММА</th>
                  <th className="px-5 py-3 font-semibold">ЗАМЕТКА</th>
                  <th className="px-5 py-3 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--fp-color-border)]/60">
                {contributions.map((c) => {
                  const goalName = c.goalId ? (goalMap.get(c.goalId) ?? c.goalId) : "Без цели";
                  return (
                    <tr key={c.id} className="group hover:bg-[var(--fp-color-surface-hover)] transition-colors">
                      <td className="px-5 py-4 font-medium text-[var(--fp-color-foreground)]">
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="size-3.5 text-[var(--fp-color-label)]" />
                          {goalName}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[var(--fp-color-label)]">{c.date}</td>
                      <td className="px-5 py-4 font-bold text-[var(--fp-color-foreground)]">
                        +{c.currency === "RUB" ? formatRub(c.amount) : `$${c.amount.toLocaleString()}`}
                      </td>
                      <td className="px-5 py-4 text-[var(--fp-color-label)] max-w-[200px] truncate">
                        {c.note || "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(c)}
                            className="grid size-7 place-items-center rounded-full hover:bg-[var(--fp-color-border)] text-[var(--fp-color-label)] transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="grid size-7 place-items-center rounded-full hover:bg-red-500/10 text-[var(--fp-color-label)] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {modal && (
        <ContributionModal
          goals={goals}
          initial={modal === "edit" ? editing : null}
          defaultGoalId={targetGoalId}
          onSave={handleSave}
          onCancel={closeModal}
          saving={addMutation.isPending || updateMutation.isPending}
          t={t}
        />
      )}
    </Page>
  );
}
