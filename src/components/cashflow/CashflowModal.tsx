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
import type { TranslationKey } from "@/i18n/messages";

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

function stepTitleKey(key: (typeof STEP_KEYS)[number], type: "income" | "expense"): TranslationKey {
  return key === "stepType" ? `cashflow.${key}_${type}` : `cashflow.${key}`;
}

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
          <div className="mx-auto flex w-full max-w-[1100px] overflow-hidden rounded-[24px] bg-[var(--fp-color-background)] shadow-elevated" onClick={(e) => e.stopPropagation()}>
            {/* Left: Form */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-10 pt-10 pb-2">
                <Dialog.Title className="text-xl font-bold text-[var(--fp-color-foreground)]">
                  {initialData?.id ? t("cashflow.editing") : t(`cashflow.modalTitle_${type}`)}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 px-10 pb-10 pt-4">
                <form id="cashflow-form" onSubmit={handleSubmit} className="grid gap-8">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t(`cashflow.nameLabel_${type}`)}</Label>
                    <Input
                      placeholder={t(`cashflow.namePlaceholder_${type}`)}
                      {...form.register("name")}
                      className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                    />
                  </div>

                  {/* Amount + Currency + Type */}
                  <div className="grid grid-cols-[1fr_auto_auto] items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.amount")}</Label>
                      <Input
                        type="number"
                        {...form.register("amount", { valueAsNumber: true })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.currency")}</Label>
                      <div className="relative">
                        <select
                          className="h-[48px] w-[100px] appearance-none rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-4 pr-8 text-sm text-[var(--fp-color-foreground)] outline-none"
                          {...form.register("currency")}
                        >
                          <option value="RUB">₽</option>
                          <option value="USD">$</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                        {t(`cashflow.typeLabel_${type}`)}
                      </Label>
                      <div className="flex h-[48px] items-center rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-1">
                        <button
                          type="button"
                          onClick={() => setFrequency("monthly")}
                          className={cn(
                            "h-full rounded-full px-4 text-sm font-medium transition-all",
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
                            "h-full rounded-full px-4 text-sm font-medium transition-all",
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
                            "h-full rounded-full px-4 text-sm font-medium transition-all",
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
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.endDate")}</Label>
                      <Input
                        type="number"
                        placeholder={t("cashflow.indefinite")}
                        {...form.register("endYear", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.growthTitle")}</span>
                      <span className="grid size-4 place-items-center rounded-full border border-[var(--fp-color-border)] text-[9px] text-[var(--fp-color-muted-foreground)]">
                        ?
                      </span>
                    </div>

                    {/* Inflation toggle */}
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-5">
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
                    <div className="rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-5">
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
                                      className="h-[42px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 pr-8 text-sm"
                                    />
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
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
                                      className="h-[42px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 pr-8 text-sm"
                                    />
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--fp-color-muted-foreground)]" />
                                  </div>
                                </div>
                                <div className="grid gap-1.5">
                                  <Label className="text-xs text-[var(--fp-color-muted-foreground)]">{t("cashflow.rangeGrowthPercent")}</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      {...form.register(`growthRanges.${index}.growthPercent` as const, { valueAsNumber: true })}
                                      className="h-[42px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 pr-8 text-sm"
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
                                  className="flex items-center gap-1.5 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-3 py-1.5 text-xs text-[var(--fp-color-muted-foreground)] transition-colors hover:text-red-500"
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
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--fp-color-border)] py-3 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
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
              <div className="flex items-center gap-3 px-10 pb-8">
                <button
                  type="submit"
                  form="cashflow-form"
                  className="flex items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Check className="size-4" />
                  {initialData?.id ? t("cashflow.save") : t("cashflow.add")}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-6 py-3 text-sm font-medium text-[var(--fp-color-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)]"
                >
                  <X className="size-4" />
                  {t("cashflow.cancel")}
                </button>
                {initialData?.id && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="ml-auto flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="size-4" />
                    {t("cashflow.delete")}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Instruction panel */}
            <div className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[var(--fp-color-border)] bg-[var(--fp-color-background)] p-8 lg:flex">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: type === "income" ? "#2D8B5E" : "#C75D3A" }}>
                <BookOpen className="size-4" />
                {t("cashflow.instructionLabel")}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-[var(--fp-color-muted-foreground)]">
                {t(`cashflow.instructionIntro_${type}`)}
              </p>

              <div className="flex flex-col gap-5">
                {STEP_KEYS.map((key, i) => (
                  <div key={key} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: type === "income" ? "#2D8B5E" : "#C75D3A" }}
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

              <div className="my-6 border-t border-[var(--fp-color-border)]" />

              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fp-color-muted-foreground)]">
                <Lightbulb className="size-4" />
                {t("cashflow.tipsLabel")}
              </div>

              <ul className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--fp-color-muted-foreground)]">
                    <span className="mt-0.5 text-[10px]">→</span>
                    <span>{t(`cashflow.tip${i}_${type}` as Parameters<typeof t>[0])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
