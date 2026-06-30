import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BookOpen, CircleDollarSign, Info, SlidersHorizontal, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { usePlanQuery, useUpdateSettingsMutation } from "@/api/planQueries";
import { useAuth } from "@/auth/AuthProvider";
import { Card } from "@/components/ui/card";
import { GeneralDataSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsSchema, type SettingsFormValues } from "@/forms/settingsSchema";

import { useI18n } from "@/i18n/I18nProvider";
import { Page } from "@/components/layout/Page";
import { useFormat } from "@/lib/useFormat";

export function GeneralDataPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const auth = useAuth();
  const { data: plan } = usePlanQuery();
  const updateSettings = useUpdateSettingsMutation();
  const settings = plan?.settings;
  const form = useForm<z.input<typeof settingsSchema>, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      startYear: settings?.startYear ?? 2024,
      birthYear: settings?.birthYear ?? 1993,
      monthsInYear: settings?.monthsInYear ?? 12,
      retirementAge: settings?.retirementAge ?? 60,
      inflationPercent: Math.round((settings?.inflation ?? 0.07) * 100),
      investmentReturnPercent: Math.round((settings?.investmentReturn ?? 0.09) * 100),
      startingCapital: settings?.startingCapital ?? 0,
      targetMonthlySpend: settings?.targetMonthlySpend ?? 0,
    },
  });

  const values = useWatch({ control: form.control }) as SettingsFormValues;
  const age = Math.max(0, values.startYear - values.birthYear);
  const retirementAge = settings?.retirementAge ?? values.retirementAge;
  const horizon = Math.max(0, retirementAge - age);
  const realReturn = values.investmentReturnPercent - values.inflationPercent;

  const onSubmit = form.handleSubmit((next) => {
    updateSettings.mutate({
      startYear: next.startYear,
      birthYear: next.birthYear,
      monthsInYear: next.monthsInYear,
      inflation: next.inflationPercent / 100,
      investmentReturn: next.investmentReturnPercent / 100,
      startingCapital: next.startingCapital,
      targetMonthlySpend: next.targetMonthlySpend,
    });
  });

  if (!plan || !settings) return <GeneralDataSkeleton />;

  return (
    <Page>
      <form onSubmit={onSubmit} className="contents">
      <header className="min-w-0">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
            <SlidersHorizontal className="size-5" />
          </span>
          <div>
            <h1 className="page-title">{t("general.title")}</h1>
            <p className="mt-1 text-sm text-[var(--fp-color-muted-foreground)]">{t("general.subtitle")}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          <Card className="px-5 py-4">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <div>
                <div className="font-semibold text-foreground">{t("general.howItWorks")}</div>
                <p className="mt-1 leading-5">{t("general.howItWorksDesc")}</p>
              </div>
            </div>
          </Card>

          <Card className="px-5 py-4">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-muted-foreground" />
              {t("general.instruction")}
            </div>
            <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
              <InstructionStep index={1} title={t("general.step1Title")}>{t("general.step1Desc")}</InstructionStep>
              <InstructionStep index={2} title={t("general.step2Title")}>{t("general.step2Desc")}</InstructionStep>
              <InstructionStep index={3} title={t("general.step3Title")}>{t("general.step3Desc")}</InstructionStep>
            </div>
          </Card>

          <FormSection
            icon={<CircleDollarSign className="size-4" />}
            title={t("general.currencyAndCapital")}
            description={t("general.currencyAndCapitalDesc")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("general.baseCurrency")} hint={t("general.baseCurrencyHint")}>
                <Input value={t("general.rubCurrencyName")} readOnly />
              </Field>
              <Field label={t("general.startingCapital")} hint={t("general.startingCapitalHint")} error={form.formState.errors.startingCapital?.message}>
                <Input type="number" {...form.register("startingCapital")} />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={<TrendingUp className="size-4" />}
            title={t("general.modelParameters")}
            description={t("general.modelParametersDesc")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("general.investmentReturn")} hint={t("general.investmentReturnHint")} error={form.formState.errors.investmentReturnPercent?.message}>
                <Input type="number" step="0.1" {...form.register("investmentReturnPercent")} />
              </Field>
              <Field label={t("general.inflation")} hint={t("general.inflationHint")} error={form.formState.errors.inflationPercent?.message}>
                <Input type="number" step="0.1" {...form.register("inflationPercent")} />
              </Field>
              <MetricBox label={t("general.realReturn")} value={`${realReturn > 0 ? "+" : ""}${realReturn.toFixed(1)}%`} detail={t("general.realReturnDetail")} />
              <MetricBox label={t("general.horizon")} value={`${horizon} ${t("general.years")}`} detail={t("general.horizonDetail")} />
            </div>
          </FormSection>

          {/* Temporary visible fields (Not in Figma) */}
          <FormSection
            icon={<Info className="size-4 text-[var(--fp-color-orange)]" />}
            title={
              <div className="flex items-center gap-2 text-[var(--fp-color-orange)]">
                {t("general.tempFields")}
                <span className="rounded bg-[var(--fp-color-orange)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fp-color-orange)]">{t("general.tempBadge")}</span>
              </div>
            }
            description={t("general.tempFieldsDesc")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("general.birthYear")} hint={t("general.birthYearHint")} error={form.formState.errors.birthYear?.message}>
                <Input type="number" {...form.register("birthYear", { valueAsNumber: true })} />
              </Field>
            </div>
          </FormSection>

          {/* Hidden technical fields */}
          <input type="hidden" {...form.register("startYear", { valueAsNumber: true })} />
          <input type="hidden" {...form.register("monthsInYear", { valueAsNumber: true })} />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={updateSettings.isPending} className="px-8 font-semibold">
              {t("general.save")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="px-8 font-semibold"
              onClick={() => navigate({ to: "/income" })}
            >
              {t("general.continue")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <aside className="grid content-start gap-5 text-sm text-muted-foreground">
          <SummaryCard
            name={auth.session?.profile?.name || auth.session?.profile?.preferredUsername || plan.owner.name}
            age={age}
            currency="RUB"
            capital={values.startingCapital}
            returnPct={values.investmentReturnPercent}
            inflationPct={values.inflationPercent}
            realReturn={realReturn}
            horizon={horizon}
            retirementAge={retirementAge}
          />
          <HelpBlock title={t("general.baseCurrency")}>{t("general.helpCurrency")}</HelpBlock>
          <HelpBlock title={t("general.startingCapital")}>{t("general.helpCapital")}</HelpBlock>
          <HelpBlock title={t("general.investmentReturn")}>{t("general.helpReturn")}</HelpBlock>
          <HelpBlock title={t("general.inflation")}>{t("general.helpInflation")}</HelpBlock>
        </aside>
      </div>
      </form>
    </Page>
  );
}

function SummaryCard(props: {
  name: string;
  age: number;
  currency: string;
  capital: number;
  returnPct: number;
  inflationPct: number;
  realReturn: number;
  horizon: number;
  retirementAge: number;
}) {
  const { t } = useI18n();
  const { formatRub } = useFormat();
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        {t("general.summaryTitle")}
      </div>
      <dl className="grid gap-3 text-sm">
        <SummaryRow label={t("general.profile")} value={props.name} />
        <SummaryRow label={t("general.age")} value={`${props.age} ${t("general.years")}`} />
        <SummaryRow label={t("general.currency")} value={props.currency} />
        <SummaryRow label={t("general.capital")} value={formatRub(props.capital)} />
        <SummaryRow label={t("general.returnPct")} value={`${props.returnPct}%`} tone="positive" />
        <SummaryRow label={t("general.inflationPct")} value={`${props.inflationPct}%`} tone="negative" />
        <SummaryRow label={t("general.realPct")} value={`${props.realReturn > 0 ? "+" : ""}${props.realReturn.toFixed(1)}%`} tone={props.realReturn >= 0 ? "positive" : "negative"} />
        <SummaryRow label={t("general.horizon")} value={`${props.horizon} ${t("general.years")}`} />
        <SummaryRow label={t("general.pensionIn")} value={`${props.retirementAge} ${t("general.years")}`} />
      </dl>
    </Card>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "positive" ? "text-[var(--fp-color-teal)]" : tone === "negative" ? "text-[var(--fp-color-coral)]" : "text-[var(--fp-color-foreground)]"}>{value}</dd>
    </div>
  );
}

function InstructionStep({ index, title, children }: { index: number; title: string; children: ReactNode }) {
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

function FormSection({ icon, title, description, children }: { icon: ReactNode; title: ReactNode; description: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-teal)]/20 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">{icon}</span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <span className="text-xs text-[var(--fp-color-danger)]">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function MetricBox({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col justify-center rounded-[var(--fp-radius-full)] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/50 px-6 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fp-color-muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-bold text-[var(--fp-color-teal)]">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)]">{detail}</div>
    </div>
  );
}

function HelpBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-3">
      <span className="pt-0.5 text-muted-foreground">→</span>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  );
}
