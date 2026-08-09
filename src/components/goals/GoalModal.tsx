import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { Goal } from "@/types/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell, InstructionAside } from "@/components/ui/modal-shell";
import { GOAL_ICONS, GOAL_ICON_NAMES, goalIcon } from "@/components/goals/goalIcons";
import { Segmented } from "@/components/ui/segmented";
import { useI18n } from "@/i18n/I18nProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface GoalFormData {
  id?: string;
  name: string;
  icon: string;
  targetYear: number;
  targetMonth: number;
  cost: number;
  saved: number;
  growth: number;
  reachable: boolean;
  type: "onetime" | "periodic";
}

export function GoalModal({
  open,
  onOpenChange,
  initialData,
  defaultGrowth,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Partial<Goal> | null;
  defaultGrowth?: number;
  onSubmit: (data: Partial<Goal>) => void;
  onDelete?: (id: string) => void;
}) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const form = useForm<GoalFormData>({
    defaultValues: {
      icon: "Target",
      growth: 4.0,
      reachable: true,
      type: "onetime",
      targetMonth: 12,
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [inflationEnabled, setInflationEnabled] = useState(false);

  useEffect(() => {
    if (open) {
      const targetYear = currentYear + 5;
      const initialGrowth = initialData?.growth !== undefined ? initialData.growth : (defaultGrowth ?? 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- modal form state is reset when a new goal/edit target opens.
      setInflationEnabled(initialGrowth > 0);
      form.reset({
        ...initialData,
        name: initialData?.name || "",
        icon: initialData?.icon || "Target",
        targetYear: initialData?.targetYear ?? targetYear,
        targetMonth: initialData?.targetMonth ?? 12,
        cost: initialData?.cost || 0,
        saved: initialData?.saved || 0,
        growth: resolveGoalDefaultGrowthPercent(initialData, defaultGrowth ?? 0),
        reachable: initialData?.reachable ?? true,
        type: initialData?.type || "onetime",
      } as GoalFormData);
    }
  }, [open, initialData, defaultGrowth, form, currentYear]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      growth: inflationEnabled ? (data.growth || 0) / 100 : 0,
    });
    onOpenChange(false);
  });

  const typeValue = useWatch({ control: form.control, name: "type" });
  const iconValue = useWatch({ control: form.control, name: "icon" });
  const targetMonthValue = useWatch({ control: form.control, name: "targetMonth" });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setIsDeleting(false);
    onOpenChange(newOpen);
  };

  const { errors } = form.formState;

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      title={initialData?.id ? t("goals.editGoal") : t("goals.newGoal")}
      aside={
        <InstructionAside
          label={t("goals.modalInstructionTitle")}
          intro={t("goals.modalInstructionDesc")}
          steps={[
            { title: t("goals.modalStep1Title"), description: t("goals.modalStep1Desc") },
            { title: t("goals.modalStep2Title"), description: t("goals.modalStep2Desc") },
            { title: t("goals.colType"), description: t("goals.modalStep3Desc") },
            { title: t("goals.iconLabel"), description: t("goals.modalStep4Desc") },
            { title: t("goals.modalStep5Title"), description: t("goals.modalStep5Desc") },
            { title: t("goals.modalStep6Title"), description: t("goals.modalStep6Desc") },
          ]}
          tipsLabel={t("goals.tipsTitle")}
          tips={[t("goals.modalTip1"), t("goals.modalTip2"), t("goals.modalTip3")]}
        />
      }
    >
      <div className="flex-1 px-8 md:px-10 pb-6">
                <form id="goal-form" onSubmit={handleSubmit} className="grid gap-6">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.nameLabel")}</Label>
                    <Input
                      placeholder={t("goals.modalStep1Desc")}
                      {...form.register("name", {
                        required: t("goals.validation.nameRequired"),
                      })}
                    />
                    {errors.name && <span className="text-xs text-[var(--fp-color-danger)]">{errors.name.message}</span>}
                  </div>

                  {/* Cost, Currency, Type */}
                  <div className="grid grid-cols-[1fr_120px_240px] items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.cost")}</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...form.register("cost", {
                          valueAsNumber: true,
                          min: { value: 1, message: t("goals.validation.costMin") },
                        })}
                      />
                      {errors.cost && <span className="text-xs text-[var(--fp-color-danger)]">{errors.cost.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.currency")}</Label>
                      <Select disabled value="RUB">
                          <SelectTrigger className="opacity-60 cursor-not-allowed bg-[var(--fp-color-input-disabled)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RUB">RUB</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.colType")}</Label>
                      <Segmented
                        value={typeValue}
                        onChange={(next) => form.setValue("type", next)}
                        options={[
                          { value: "onetime", label: t("goals.typeOneTimeShort") },
                          { value: "periodic", label: t("goals.typePeriodicShort") },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.iconLabel")}</Label>
                    </div>
                    <div className="grid grid-cols-8 gap-3 md:gap-4 w-full justify-items-center">
                      {GOAL_ICON_NAMES.map((iconName) => {
                        const Icon = GOAL_ICONS[iconName] ?? goalIcon(undefined);
                        const isSelected = iconValue === iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => form.setValue("icon", iconName)}
                            className={`grid aspect-square w-full max-w-[48px] place-items-center rounded-full border transition-all ${
                              isSelected 
                                ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-surface-hover)] text-[var(--fp-color-foreground)] font-semibold shadow-sm scale-105" 
                                : "border-[var(--fp-color-border)] bg-transparent text-[var(--fp-color-muted-foreground)] hover:border-[var(--fp-color-border-strong)] hover:bg-[var(--fp-color-surface)]"
                            }`}
                          >
                            <Icon className="size-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Year and Month */}
                  <div className="grid grid-cols-[140px_1fr] items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.targetYear")}</Label>
                      <Input
                        type="number"
                        placeholder="2030"
                        {...form.register("targetYear", {
                          valueAsNumber: true,
                          min: { value: currentYear, message: t("goals.validation.yearMin") },
                        })}
                      />
                      {errors.targetYear && <span className="text-xs text-[var(--fp-color-danger)]">{errors.targetYear.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.targetMonth")}</Label>
                      <Select
                          value={String(targetMonthValue)}
                          onValueChange={(v) => form.setValue("targetMonth", Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <SelectItem key={m} value={String(m)}>{t(`goals.monthNames.${m}` as Parameters<typeof t>[0])}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                  </div>

                  {/* Growth / Inflation Section */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold text-[var(--fp-color-foreground)]">{t("goals.modalIndexationTitle")}</Label>
                    </div>
                    
                    <div className="grid gap-3">
                      {/* Card 1: Inflation Adjustment */}
                      <div className="rounded-[20px] border border-[var(--fp-color-border)] p-5 bg-[var(--fp-color-surface)]/60 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.modalBaseIndexation")}</div>
                            <div className="text-xs text-[var(--fp-color-muted-foreground)] mt-0.5">{t("goals.modalBaseIndexationDesc")}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !inflationEnabled;
                              setInflationEnabled(nextVal);
                              if (!nextVal) {
                                form.setValue("growth", 0);
                              } else {
                                form.setValue("growth", resolveGoalDefaultGrowthPercent(null, defaultGrowth ?? 0));
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              inflationEnabled ? "bg-[var(--fp-color-foreground)]" : "bg-[var(--fp-color-muted)]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                inflationEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                        {inflationEnabled && (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.1"
                              {...form.register("growth", {
                                valueAsNumber: true,
                              })}
                              className="h-[38px] w-[80px] rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-input)] px-3 text-sm text-center font-semibold hover:border-[var(--fp-color-border-hover)] focus:border-[var(--fp-color-border-strong)] focus:ring-0 outline-none"
                            />
                            <span className="text-xs text-[var(--fp-color-muted-foreground)] font-medium">{t("format.percentPerYear")}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Actions Inline */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <Check className="size-4" />
                      {initialData?.id ? t("goals.saveBtnEdit") : t("goals.saveBtnAdd")}
                    </button>
                    <Dialog.Close asChild>
                      <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-transparent px-5 text-sm font-semibold text-[var(--fp-color-foreground)] transition hover:bg-[var(--fp-color-surface-hover)]">
                        <X className="size-4" />
                        {t("cashflow.cancel")}
                      </button>
                    </Dialog.Close>
                    
                    {initialData?.id && onDelete && (
                      <div className="ml-auto">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--fp-color-danger)]">{t("common.confirmDelete")}</span>
                            <button
                              type="button"
                              onClick={() => { onDelete(initialData.id!); onOpenChange(false); }}
                              className="inline-flex h-[40px] items-center rounded-full bg-[var(--fp-color-danger)] px-4 text-xs font-bold text-white hover:opacity-90"
                            >
                              {t("goals.confirmYes")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDeleting(false)}
                              className="inline-flex h-[40px] items-center rounded-full bg-muted px-4 text-xs font-bold text-foreground hover:bg-muted/80"
                            >
                              {t("goals.confirmNo")}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsDeleting(true)}
                            className="inline-flex h-10 place-items-center rounded-full border border-[var(--fp-color-danger)]/20 bg-[var(--fp-color-danger)]/10 px-5 text-sm font-semibold text-[var(--fp-color-danger)] transition-colors hover:bg-[var(--fp-color-danger)]/20"
                          >
                            {t("goals.deleteGoalBtn")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
    </ModalShell>
  );
}

export function resolveGoalDefaultGrowthPercent(initialData: Partial<Goal> | null, defaultGrowth: number) {
  const growth = initialData?.growth !== undefined ? initialData.growth : defaultGrowth;
  return growth > 0 ? Math.round(growth * 1000) / 10 : 0;
}
