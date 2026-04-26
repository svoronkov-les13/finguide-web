import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useUpdateSettingsMutation, usePlanQuery } from "@/api/planQueries";
import { settingsSchema, type SettingsFormValues } from "@/forms/settingsSchema";
import { Page, PageHeader } from "@/components/layout/Page";
import { DataPanel } from "@/components/plan/DataPanel";
import { MetricCard, MetricsGrid } from "@/components/plan/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPercent, formatRub } from "@/lib/utils";

export function GeneralDataPage() {
  const { data: plan } = usePlanQuery();
  const updateSettings = useUpdateSettingsMutation();
  const settings = plan?.settings;
  const form = useForm<z.input<typeof settingsSchema>, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      startYear: settings?.startYear ?? 2024,
      birthYear: settings?.birthYear ?? 1993,
      monthsInYear: settings?.monthsInYear ?? 12,
      retirementAge: settings?.retirementAge ?? 50,
      inflationPercent: Math.round((settings?.inflation ?? 0.03) * 100),
      investmentReturnPercent: Math.round((settings?.investmentReturn ?? 0.06) * 100),
      startingCapital: settings?.startingCapital ?? 0,
      targetMonthlySpend: settings?.targetMonthlySpend ?? 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateSettings.mutate({
      startYear: values.startYear,
      birthYear: values.birthYear,
      monthsInYear: values.monthsInYear,
      retirementAge: values.retirementAge,
      inflation: values.inflationPercent / 100,
      investmentReturn: values.investmentReturnPercent / 100,
      startingCapital: values.startingCapital,
      targetMonthlySpend: values.targetMonthlySpend,
    });
  });

  if (!plan || !settings) return <Card className="h-96 animate-pulse bg-muted/60" />;

  return (
    <Page>
      <PageHeader title="Вводные данные" description="Технические параметры, возраст, инфляция и базовая доходность модели." />
      <form onSubmit={onSubmit}>
        <DataPanel title="Технические" description="React Hook Form + Zod валидируют модель перед отправкой в API-клиент.">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Дата начала" error={form.formState.errors.startYear?.message}><Input type="number" {...form.register("startYear")} /></Field>
            <Field label="Год рождения" error={form.formState.errors.birthYear?.message}><Input type="number" {...form.register("birthYear")} /></Field>
            <Field label="Месяцев в году" error={form.formState.errors.monthsInYear?.message}><Input type="number" {...form.register("monthsInYear")} /></Field>
            <Field label="Возраст пенсии" error={form.formState.errors.retirementAge?.message}><Input type="number" {...form.register("retirementAge")} /></Field>
            <Field label="Инфляция, %" error={form.formState.errors.inflationPercent?.message}><Input type="number" step="0.1" {...form.register("inflationPercent")} /></Field>
            <Field label="Доходность, %" error={form.formState.errors.investmentReturnPercent?.message}><Input type="number" step="0.1" {...form.register("investmentReturnPercent")} /></Field>
            <Field label="Стартовый капитал, ₽" error={form.formState.errors.startingCapital?.message}><Input type="number" {...form.register("startingCapital")} /></Field>
            <Field label="Расход на пенсии, $" error={form.formState.errors.targetMonthlySpend?.message}><Input type="number" {...form.register("targetMonthlySpend")} /></Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={updateSettings.isPending}>Сохранить вводные</Button>
          </div>
        </DataPanel>
      </form>
      <MetricsGrid>
        <MetricCard label="Инфляция" value={formatPercent(settings.inflation)} />
        <MetricCard label="Инвест. доходность" value={formatPercent(settings.investmentReturn)} />
        <MetricCard label="Стартовый капитал" value={formatRub(settings.startingCapital, { compact: true })} />
      </MetricsGrid>
    </Page>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </label>
  );
}
