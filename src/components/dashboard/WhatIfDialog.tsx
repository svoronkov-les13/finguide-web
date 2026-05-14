import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, CheckCircle2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type React from "react";
import type { z } from "zod";
import { useSaveWhatIfScenarioMutation } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { whatIfSchema, type WhatIfFormValues } from "@/forms/settingsSchema";
import { cn } from "@/lib/utils";

interface WhatIfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const presets = {
  optimistic: {
    title: "Оптимистичный",
    tone: "positive",
    values: {
      incomeChangePercent: 15,
      expenseChangePercent: 5,
      returnDeltaPercent: 1,
      inflationDeltaPercent: -1,
      retirementAgeShift: -2,
      goalsCostChangePercent: 0,
    },
    description: "Благоприятные условия: доходы растут быстрее, расходы - медленнее",
  },
  pessimistic: {
    title: "Пессимистичный",
    tone: "negative",
    values: {
      incomeChangePercent: -10,
      expenseChangePercent: 12,
      returnDeltaPercent: -2,
      inflationDeltaPercent: 2,
      retirementAgeShift: 3,
      goalsCostChangePercent: 15,
    },
    description: "Стресс-тест: снижение доходов и рост расходов",
  },
} as const;

export function WhatIfDialog({ open, onOpenChange }: WhatIfDialogProps) {
  const saveScenario = useSaveWhatIfScenarioMutation();
  const form = useForm<z.input<typeof whatIfSchema>, unknown, WhatIfFormValues>({
    resolver: zodResolver(whatIfSchema),
    values: {
      incomeChangePercent: 0,
      expenseChangePercent: 0,
      returnDeltaPercent: 0,
      inflationDeltaPercent: 0,
      retirementAgeShift: 0,
      goalsCostChangePercent: 0,
    },
  });
  const values = useWatch({ control: form.control }) as WhatIfFormValues;

  const applyPreset = (preset: (typeof presets)[keyof typeof presets]) => {
    Object.entries(preset.values).forEach(([key, value]) => {
      form.setValue(key as keyof WhatIfFormValues, value, { shouldDirty: true, shouldValidate: true });
    });
  };

  const onSubmit = form.handleSubmit((next) => {
    saveScenario.mutate({
      incomeGrowthDelta: next.incomeChangePercent / 100,
      expenseGrowthDelta: next.expenseChangePercent / 100,
      returnDelta: next.returnDeltaPercent / 100,
      inflationDelta: next.inflationDeltaPercent / 100,
      retirementAgeShift: next.retirementAgeShift,
      goalsCostDelta: next.goalsCostChangePercent / 100,
      description: "Пользовательский сценарий",
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-40px)] w-[min(1160px,calc(100vw-32px))] overflow-hidden rounded-[38px] p-0">
        <div className="flex items-start gap-4 border-b border-[var(--fp-color-border)] px-7 py-6 max-[760px]:px-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)] shadow-[var(--fp-shadow-soft)]">
            <BrainCircuit className="size-6" />
          </span>
          <DialogHeader className="min-w-0 flex-1">
            <DialogTitle className="text-[28px] leading-tight max-[760px]:text-xl">Моделирование сценариев</DialogTitle>
            <DialogDescription className="text-base max-[760px]:text-sm">
              Базовые пресеты и пользовательские сценарии с полной кастомизацией
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="scrollbar-thin max-h-[calc(100vh-186px)] overflow-auto px-7 py-6 max-[760px]:px-5" onSubmit={onSubmit}>
          <SectionTitle>Базовые пресеты</SectionTitle>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {Object.values(presets).map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "rounded-[28px] border p-6 text-left transition hover:shadow-[var(--fp-shadow-elevated)]",
                  preset.tone === "positive"
                    ? "border-[var(--fp-color-teal)]/70 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-deep-plum)]"
                    : "border-[var(--fp-color-coral)]/75 bg-[var(--fp-color-coral-soft)] text-[var(--fp-color-coral)]",
                )}
              >
                <div className="mb-6 text-2xl text-current/80">{preset.title}</div>
                <PresetLine label="Изменение всех доходов" value={formatPercent(preset.values.incomeChangePercent)} />
                <PresetLine label="Изменение всех расходов" value={formatPercent(preset.values.expenseChangePercent)} />
                <PresetLine label="Ожидаемая доходность" value={formatPp(preset.values.returnDeltaPercent)} />
                <PresetLine label="Уровень инфляции" value={formatPp(preset.values.inflationDeltaPercent)} />
                <PresetLine label="Сдвиг возраста выхода" value={formatYears(preset.values.retirementAgeShift)} />
                <PresetLine label="Изменение стоимости" value={formatPercent(preset.values.goalsCostChangePercent)} />
                <p className="mt-7 text-xl leading-relaxed text-[var(--fp-color-foreground)]/70">{preset.description}</p>
              </button>
            ))}
          </div>

          <SectionTitle className="mt-8">Пользовательский сценарий</SectionTitle>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ScenarioSlider label="Изменение всех доходов" min={-50} max={100} step={1} value={values.incomeChangePercent} suffix="%" {...form.register("incomeChangePercent")} />
            <ScenarioSlider label="Изменение всех расходов" min={-50} max={100} step={1} value={values.expenseChangePercent} suffix="%" {...form.register("expenseChangePercent")} />
            <ScenarioSlider label="Ожидаемая доходность" min={-5} max={10} step={0.5} value={values.returnDeltaPercent} suffix="пп" {...form.register("returnDeltaPercent")} />
            <ScenarioSlider label="Уровень инфляции" min={-5} max={10} step={0.5} value={values.inflationDeltaPercent} suffix="пп" {...form.register("inflationDeltaPercent")} />
            <ScenarioSlider label="Сдвиг возраста выхода" min={-10} max={10} step={1} value={values.retirementAgeShift} suffix="лет" {...form.register("retirementAgeShift")} />
            <ScenarioSlider label="Изменение стоимости целей" min={-30} max={100} step={1} value={values.goalsCostChangePercent} suffix="%" {...form.register("goalsCostChangePercent")} />
          </div>

          <div className="sticky bottom-0 -mx-7 mt-7 flex justify-center border-t border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/95 px-7 py-5 backdrop-blur max-[760px]:-mx-5 max-[760px]:px-5">
            <Button type="submit" size="lg" className="min-w-64 rounded-[28px]" disabled={saveScenario.isPending}>
              <CheckCircle2 className="size-4" />
              Применить и закрыть
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ className, children }: { className?: string; children: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <h3 className="shrink-0 text-2xl font-bold leading-none max-[760px]:text-lg">{children}</h3>
      <span className="h-px flex-1 bg-[var(--fp-color-border)]" />
    </div>
  );
}

function PresetLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-current/10 py-4">
      <div className="flex items-center justify-between gap-4 text-xl text-[var(--fp-color-foreground)]/70 max-[760px]:text-base">
        <span>{label}</span>
        <strong className="text-current">{value}</strong>
      </div>
      <div className="mt-5 h-1.5 rounded-full bg-white/80" />
    </div>
  );
}

interface ScenarioSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
  suffix: string;
}

function ScenarioSlider({ label, value, suffix, min, max, className, ...props }: ScenarioSliderProps) {
  return (
    <label className={cn("rounded-[var(--fp-radius-2xl)] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)]/80 p-5 shadow-[var(--fp-shadow-soft)]", className)}>
      <span className="label-caps flex items-center justify-between gap-4">
        {label}
        <strong className={cn("card-value-xl normal-case tracking-normal", value < 0 ? "text-[var(--fp-color-coral)]" : value > 0 ? "text-[var(--fp-color-teal)]" : "text-[var(--fp-color-foreground)]")}>
          {formatSigned(value)}{suffix}
        </strong>
      </span>
      <input
        className="mt-5 h-2 w-full accent-[var(--fp-color-teal)]"
        type="range"
        min={min}
        max={max}
        value={value}
        {...props}
      />
      <span className="mt-2 flex justify-between text-xs text-[var(--fp-color-muted-foreground)]">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </span>
    </label>
  );
}

function formatSigned(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function formatPercent(value: number) {
  return `${formatSigned(value)}%`;
}

function formatPp(value: number) {
  return `${formatSigned(value)}пп`;
}

function formatYears(value: number) {
  return `${formatSigned(value)} лет`;
}
