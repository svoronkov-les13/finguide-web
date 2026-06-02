import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, BookOpen, Lightbulb, Trash2, ChevronDown } from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { Cashflow } from "@/types/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePlanQuery } from "@/api/planQueries";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

interface CashflowFormData {
  id?: string;
  name: string;
  amount: number;
  currency: "USD" | "RUB";
  category: string;
  startYear: number;
  endYear: number | null;
  growth: number;
  growthType: "inflation" | "ranges";
  growthRanges: { startYear: number; endYear: number | null; growthPercent: number }[];
  enabled: boolean;
  type: "income" | "expense";
  frequency: "monthly" | "yearly" | "onetime";
}

const STEP_KEYS = ["stepName", "stepAmount", "stepType", "stepDates", "stepGrowth"] as const;



export function CashflowModal({
  open,
  onOpenChange,
  initialData,
  type,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Partial<Cashflow> | null;
  type: "income" | "expense";
  onSubmit: (data: Partial<Cashflow>) => void;
  onDelete?: () => void;
}) {
  const { data: plan } = usePlanQuery();
  const { t } = useI18n();
  const form = useForm<CashflowFormData>({
    defaultValues: {
      growthRanges: [],
      growthType: "inflation",
    },
  });

  const { fields: growthRanges, append: appendRange, remove: removeRange } = useFieldArray({
    control: form.control,
    name: "growthRanges",
  });

  const growthType = useWatch({ control: form.control, name: "growthType" });

  useEffect(() => {
    if (open) {
      const startYear = plan?.settings.startYear ?? new Date().getFullYear();
      form.reset({
        ...initialData,
        name: initialData?.name || "",
        amount: initialData?.amount || 0,
        currency: initialData?.currency || "RUB",
        startYear: initialData?.startYear ?? startYear,
        endYear: initialData?.endYear ?? null,
        growth: initialData?.growth || 0,
        growthType: initialData?.growthRanges?.length ? "ranges" : "inflation",
        growthRanges: initialData?.growthRanges || [],
        type: type,
        frequency: initialData?.frequency || "monthly",
      } as CashflowFormData);
    }
  }, [open, initialData, plan, type, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const submitData = { ...data };
    if (data.growthType === "inflation") {
      submitData.growthRanges = [];
      submitData.growth = 0; // Using default inflation logic
    }
    onSubmit(submitData);
    onOpenChange(false);
  });

  const setFrequency = (freq: "monthly" | "yearly" | "onetime") => {
    form.setValue("frequency", freq);
  };

  const frequencyValue = useWatch({ control: form.control, name: "frequency" });
  const isMonthly = frequencyValue === "monthly";
  const isYearly = frequencyValue === "yearly";
  const isOnetime = frequencyValue === "onetime";

  const growthRangesValues = useWatch({ control: form.control, name: "growthRanges" });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-stretch justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ padding: "32px 0" }}
          onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
        >
          <div className="mx-auto flex w-full max-w-[1100px] overflow-hidden rounded-[32px] bg-[var(--fp-color-card)] shadow-elevated border border-[var(--fp-color-border)]" onClick={(e) => e.stopPropagation()}>
            {/* Left: Form */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between p-8 md:p-10 pb-4">
                <Dialog.Title className="text-xl font-bold text-[var(--fp-color-foreground)]">
                  {initialData?.id ? t("cashflow.editing") : t(`cashflow.modalTitle_${type}`)}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="grid size-8 place-items-center rounded-full border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 px-8 md:px-10 pb-6">
                <form id="cashflow-form" onSubmit={handleSubmit} className="grid gap-6">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t(`cashflow.nameLabel_${type}`)}</Label>
                    <Input
                      placeholder={t(`cashflow.namePlaceholder_${type}`)}
                      {...form.register("name")}
                      className="h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm text-[var(--fp-color-foreground)] placeholder:text-[var(--fp-color-text-muted)] transition-all focus:border-[var(--fp-color-border-strong)] focus:bg-[var(--fp-color-card)] focus:ring-0 outline-none"
                    />
                  </div>

                  {/* Amount + Currency + Type */}
                  <div className="grid grid-cols-[1fr_120px_270px] items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.amount")}</Label>
                      <Input
                        type="number"
                        {...form.register("amount", { valueAsNumber: true })}
                        className="h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm text-[var(--fp-color-foreground)] transition-all focus:border-[var(--fp-color-border-strong)] focus:bg-[var(--fp-color-card)] focus:ring-0 outline-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.currency")}</Label>
                      <div className="relative">
                        <select
                          className="h-12 w-full appearance-none rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 pr-10 text-sm text-[var(--fp-color-foreground)] font-semibold outline-none cursor-pointer hover:border-[var(--fp-color-border-strong)] focus:border-[var(--fp-color-border-strong)]"
                          {...form.register("currency")}
                        >
                          <option value="RUB">RUB</option>
                          <option value="USD">USD</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                        {t(`cashflow.typeLabel_${type}`)}
                      </Label>
                      <div className="flex h-12 items-center gap-1 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-1">
                        <button
                          type="button"
                          onClick={() => setFrequency("monthly")}
                          className={cn(
                            "h-full rounded-full px-4 text-sm font-semibold transition-all flex-1 shadow-none",
                            isMonthly
                              ? "bg-[var(--fp-color-foreground)] text-white shadow-sm"
                              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                          )}
                        >
                          {t("cashflow.freqMonthly")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrequency("yearly")}
                          className={cn(
                            "h-full rounded-full px-4 text-sm font-semibold transition-all flex-1 shadow-none",
                            isYearly
                              ? "bg-[var(--fp-color-foreground)] text-white shadow-sm"
                              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                          )}
                        >
                          {t("cashflow.freqYearly")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrequency("onetime")}
                          className={cn(
                            "h-full rounded-full px-4 text-sm font-semibold transition-all flex-1 shadow-none",
                            isOnetime
                              ? "bg-[var(--fp-color-foreground)] text-white shadow-sm"
                              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                          )}
                        >
                          {t("cashflow.freqOnetime")}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.startDate")}</Label>
                      <Input
                        type="number"
                        {...form.register("startYear", { valueAsNumber: true })}
                        className="h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm text-[var(--fp-color-foreground)] transition-all focus:border-[var(--fp-color-border-strong)] focus:bg-[var(--fp-color-card)] focus:ring-0 outline-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.endDate")}</Label>
                      <Input
                        type="number"
                        placeholder={t("cashflow.indefinite")}
                        {...form.register("endYear", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })}
                        className="h-12 w-full rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm text-[var(--fp-color-foreground)] transition-all focus:border-[var(--fp-color-border-strong)] focus:bg-[var(--fp-color-card)] focus:ring-0 outline-none"
                      />
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.growthTitle")}</span>
                    </div>

                    {/* Inflation toggle */}
                    <div className="flex items-center justify-between rounded-[20px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/60 p-5">
                      <div>
                        <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.growthInflation")}</div>
                        <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)]">
                          {t("cashflow.growthInflationDesc")}
                        </div>
                      </div>
                      <Switch
                        checked={growthType === "inflation"}
                        onCheckedChange={(checked) =>
                          form.setValue("growthType", checked ? "inflation" : "ranges")
                        }
                      />
                    </div>

                    {/* Range growth */}
                    <div className="rounded-[20px] border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)]/60 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                            {t("cashflow.growthRange")}
                          </div>
                          <div className="mt-0.5 text-xs text-[var(--fp-color-muted-foreground)]">
                            {t("cashflow.growthRangeDesc")}
                          </div>
                        </div>
                        <Switch
                          checked={growthType === "ranges"}
                          onCheckedChange={(checked) =>
                            form.setValue("growthType", checked ? "ranges" : "inflation")
                          }
                        />
                      </div>

                      {growthType === "ranges" && (
                        <div className="mt-5 flex flex-col gap-5 border-t border-[var(--fp-color-border)] pt-5">
                          {growthRanges.map((field, index) => (
                            <div key={field.id} className="grid gap-3">
                              <div className="grid grid-cols-3 items-end gap-3">
                                <div className="grid gap-1.5">
                                  <Label className="text-xs text-[var(--fp-color-muted-foreground)]">{t("cashflow.rangeStartYear")}</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      {...form.register(`growthRanges.${index}.startYear` as const, { valueAsNumber: true })}
                                      className="h-[42px] w-full rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 text-sm text-[var(--fp-color-foreground)] transition-all focus:border-[var(--fp-color-border-strong)] outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label className="text-xs text-[var(--fp-color-muted-foreground)]">{t("cashflow.rangeEndYear")}</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      placeholder={t("cashflow.indefinite")}
                                      {...form.register(`growthRanges.${index}.endYear` as const, {
                                        setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                                      })}
                                      className="h-[42px] w-full rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 text-sm text-[var(--fp-color-foreground)] transition-all focus:border-[var(--fp-color-border-strong)] outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label className="text-xs text-[var(--fp-color-muted-foreground)]">{t("cashflow.rangeGrowthPercent")}</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      {...form.register(`growthRanges.${index}.growthPercent` as const, { valueAsNumber: true })}
                                      className="h-[42px] w-full rounded-xl border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-4 pr-8 text-sm text-[var(--fp-color-foreground)] text-center font-semibold focus:border-[var(--fp-color-border-strong)] outline-none"
                                    />
                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--fp-color-muted-foreground)]">
                                      %
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="radio"
                                    className="size-4 accent-[var(--fp-color-foreground)]"
                                    checked={!growthRangesValues?.[index]?.endYear}
                                    onChange={() => form.setValue(`growthRanges.${index}.endYear`, null)}
                                  />
                                  <span className="text-sm text-[var(--fp-color-foreground)]">{t("cashflow.rangeIndefinite")}</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeRange(index)}
                                  className="flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] px-3 py-1.5 text-xs text-[var(--fp-color-muted-foreground)] transition-colors hover:text-red-500"
                                >
                                  <Trash2 className="size-3" />
                                  {t("cashflow.delete")}
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              appendRange({
                                startYear: new Date().getFullYear(),
                                endYear: null,
                                growthPercent: 0,
                              })
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-[var(--fp-color-border)] py-3 text-sm font-semibold text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
                          >
                            {t("cashflow.addRange")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center gap-4 px-8 md:px-10 pb-8 pt-4">
                <button
                  type="submit"
                  form="cashflow-form"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-8 text-sm font-semibold text-[var(--fp-color-card)] transition hover:opacity-90"
                >
                  <Check className="size-4" />
                  {initialData?.id ? t("cashflow.save") : t("cashflow.add")}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-transparent px-6 text-sm font-semibold text-[var(--fp-color-foreground)] transition hover:bg-[var(--fp-color-surface-hover)]"
                >
                  <X className="size-4" />
                  {t("cashflow.cancel")}
                </button>
                {initialData?.id && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="ml-auto inline-flex h-12 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-6 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="size-4" />
                    {t("cashflow.delete")}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Instruction panel */}
            <div className="hidden w-[360px] shrink-0 flex-col bg-[var(--fp-color-surface)] p-8 md:p-10 md:flex border-l border-[var(--fp-color-border)] overflow-y-auto">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: type === "income" ? "var(--fp-color-teal)" : "var(--fp-color-coral)" }}>
                <BookOpen className="size-4" />
                {t("cashflow.instructionLabel")}
              </div>

              <p className="mb-6 text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                {t(`cashflow.instructionIntro_${type}`)}
              </p>

              <div className="flex flex-col gap-5">
                {STEP_KEYS.map((key, i) => (
                  <div key={key} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: type === "income" ? "var(--fp-color-teal)" : "var(--fp-color-coral)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                        {t((key === "stepType" ? `cashflow.stepType_${type}` : `cashflow.${key}`) as Parameters<typeof t>[0])}
                      </div>
                      <div className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                        {t(`cashflow.${key}Desc_${type}` as Parameters<typeof t>[0])}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--fp-color-muted-foreground)]">
                  <Lightbulb className="size-4" />
                  <span>{t("cashflow.tipsLabel")}</span>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--fp-color-primary)] opacity-50" />
                      <span>{t(`cashflow.tip${i}_${type}` as Parameters<typeof t>[0])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
