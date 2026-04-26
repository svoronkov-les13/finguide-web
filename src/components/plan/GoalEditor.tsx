import * as Icons from "lucide-react";
import type { ReactNode } from "react";
import { SurfaceRow } from "@/components/plan/DataPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRub } from "@/lib/utils";
import type { Goal } from "@/types/finance";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

interface GoalEditorProps {
  goals: Goal[];
  onUpdate: (id: string, patch: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}

export function GoalEditor({ goals, onUpdate, onDelete }: GoalEditorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalEditorCard key={goal.id} goal={goal} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function GoalEditorCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: string, patch: Partial<Goal>) => void; onDelete: (id: string) => void }) {
  const Icon = iconMap[goal.icon] ?? Icons.Target;
  const progress = Math.min(100, Math.round((goal.saved / goal.cost) * 100));

  return (
    <SurfaceRow className="bg-card/42">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[14px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
          <Icon className="size-4" />
        </span>
        <Input className="h-10 min-w-0 flex-1 bg-card/90 font-semibold" defaultValue={goal.name} onBlur={(event) => onUpdate(goal.id, { name: event.currentTarget.value })} />
        <Button variant="danger" size="iconSm" onClick={() => onDelete(goal.id)} aria-label={`Удалить ${goal.name}`}>
          <Icons.Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-foreground">{formatRub(goal.saved, { compact: true })}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">из {formatRub(goal.cost, { compact: true })}</div>
          </div>
          <div className="rounded-full border border-border/75 bg-card/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{progress}%</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
        <Field label="Год">
          <Input type="number" defaultValue={goal.targetYear} onBlur={(event) => onUpdate(goal.id, { targetYear: Number(event.currentTarget.value) })} />
        </Field>
        <Field label="Стоимость">
          <Input type="number" defaultValue={goal.cost} onBlur={(event) => onUpdate(goal.id, { cost: Number(event.currentTarget.value) })} />
        </Field>
        <Field label="Накоплено">
          <Input type="number" defaultValue={goal.saved} onBlur={(event) => onUpdate(goal.id, { saved: Number(event.currentTarget.value) })} />
        </Field>
      </div>
    </SurfaceRow>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-label">{label}</span>
      {children}
    </label>
  );
}
