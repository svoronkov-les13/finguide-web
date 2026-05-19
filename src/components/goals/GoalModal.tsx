import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { Goal } from "@/types/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";
import * as Icons from "lucide-react";

const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;

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
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Partial<Goal> | null;
  onSubmit: (data: Partial<Goal>) => void;
  onDelete?: (id: string) => void;
}) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const form = useForm<GoalFormData>({
    defaultValues: {
      icon: "Target",
      growth: 0.05,
      reachable: true,
      type: "onetime",
      targetMonth: 12,
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      const targetYear = currentYear + 5;
      form.reset({
        ...initialData,
        name: initialData?.name || "",
        icon: initialData?.icon || "Target",
        targetYear: initialData?.targetYear ?? targetYear,
        targetMonth: initialData?.targetMonth ?? 12,
        cost: initialData?.cost || 0,
        saved: initialData?.saved || 0,
        growth: initialData?.growth || 0.05,
        reachable: initialData?.reachable ?? true,
        type: initialData?.type || "onetime",
      } as GoalFormData);
    }
  }, [open, initialData, form, currentYear]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });

  const typeValue = useWatch({ control: form.control, name: "type" });
  const iconValue = useWatch({ control: form.control, name: "icon" });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setIsDeleting(false);
    onOpenChange(newOpen);
  };

  const { errors } = form.formState;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-stretch justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ padding: "32px 0" }}
          onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
        >
          <div className="mx-auto flex w-full max-w-[1000px] overflow-hidden rounded-[32px] bg-[var(--fp-color-background)] shadow-elevated" onClick={(e) => e.stopPropagation()}>
            {/* Left Column: Form */}
            <div className="flex flex-1 flex-col overflow-y-auto pb-6">
              <div className="flex items-center justify-between px-10 pt-10 pb-6">
                <Dialog.Title className="text-xl font-bold text-[var(--fp-color-foreground)]">
                  {initialData?.id ? t("goals.editGoal") : t("goals.newGoal")}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="grid size-8 place-items-center rounded-full border border-[var(--fp-color-border)] text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 px-10">
                <form id="goal-form" onSubmit={handleSubmit} className="grid gap-8">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.nameLabel")}</Label>
                    <Input
                      placeholder={t("goals.modalStep1Desc")}
                      {...form.register("name", {
                        required: t("goals.validation.nameRequired"),
                      })}
                      className="h-[48px] rounded-2xl border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 text-sm"
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
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
                        className="h-[48px] rounded-2xl border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 text-sm"
                      />
                      {errors.cost && <span className="text-xs text-red-500">{errors.cost.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("cashflow.currency")}</Label>
                      <div className="flex h-[48px] items-center justify-between rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 text-sm text-[var(--fp-color-muted-foreground)]">
                        <span>RUB</span>
                        <Icons.ChevronDown className="size-4" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.colType")}</Label>
                      <div className="flex h-[48px] items-center gap-1 rounded-full border border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] p-1">
                        <button
                          type="button"
                          onClick={() => form.setValue("type", "onetime")}
                          className={`flex-1 rounded-full text-sm font-medium transition-colors h-full ${
                            typeValue === "onetime"
                              ? "bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] shadow-sm"
                              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                          }`}
                        >
                          {t("goals.typeOneTimeShort")}
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("type", "periodic")}
                          className={`flex-1 rounded-full text-sm font-medium transition-colors h-full ${
                            typeValue === "periodic"
                              ? "bg-[var(--fp-color-background)] text-[var(--fp-color-foreground)] shadow-sm"
                              : "text-[var(--fp-color-muted-foreground)] hover:text-[var(--fp-color-foreground)]"
                          }`}
                        >
                          {t("goals.typePeriodicShort")}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <Icons.Diamond className="size-4 text-[var(--fp-color-muted-foreground)]" />
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.iconLabel")}</Label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Home", "Car", "Plane", "GraduationCap", "Heart", "Clock", "Briefcase", "Diamond",
                        "Shield", "Umbrella", "Gift", "Camera", "Laptop", "Palette", "Scissors", "Mountain"
                      ].map((iconName) => {
                        const Icon = iconMap[iconName] ?? Icons.Target;
                        const isSelected = iconValue === iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => form.setValue("icon", iconName)}
                            className={`grid size-12 place-items-center rounded-full border transition-all ${
                              isSelected 
                                ? "border-[var(--fp-color-foreground)] bg-[var(--fp-color-surface)] text-[var(--fp-color-foreground)]" 
                                : "border-[var(--fp-color-border)] bg-transparent text-[var(--fp-color-muted-foreground)] hover:border-[var(--fp-color-muted-foreground)]"
                            }`}
                          >
                            <Icon className="size-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Year, Month, and Saved */}
                  <div className="grid grid-cols-3 items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.targetYear")}</Label>
                      <Input
                        type="number"
                        placeholder="2030"
                        {...form.register("targetYear", {
                          valueAsNumber: true,
                          min: { value: currentYear, message: t("goals.validation.yearMin") },
                        })}
                        className="h-[48px] rounded-2xl border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 text-sm"
                      />
                      {errors.targetYear && <span className="text-xs text-red-500">{errors.targetYear.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.targetMonth")}</Label>
                      <select
                        {...form.register("targetMonth", { valueAsNumber: true })}
                        className="h-[48px] rounded-2xl border border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-4 text-sm text-[var(--fp-color-foreground)] outline-none appearance-none cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>{t(`goals.monthNames.${m}` as Parameters<typeof t>[0])}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-[var(--fp-color-muted-foreground)]">{t("goals.monthHint")}</span>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.saved")}</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...form.register("saved", {
                          valueAsNumber: true,
                          min: { value: 0, message: t("goals.validation.savedMin") },
                        })}
                        className="h-[48px] rounded-2xl border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-5 text-sm"
                      />
                      {errors.saved && <span className="text-xs text-red-500">{errors.saved.message}</span>}
                    </div>
                  </div>

                  {/* Growth / Inflation Section */}
                  <div className="grid gap-4 rounded-2xl border border-[var(--fp-color-border)] p-6 bg-[var(--fp-color-surface)]">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold text-[var(--fp-color-foreground)]">{t("goals.modalIndexationTitle")}</Label>
                      <Icons.Info className="size-4 text-[var(--fp-color-muted-foreground)]" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.modalBaseIndexation")}</div>
                        <div className="text-xs text-[var(--fp-color-muted-foreground)]">{t("goals.modalBaseIndexationDesc")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Input
                          type="number"
                          step="0.01"
                          {...form.register("growth", {
                            valueAsNumber: true,
                            min: { value: 0, message: t("goals.validation.growthMin") },
                          })}
                          className="h-[36px] w-[100px] rounded-xl border-[var(--fp-color-border)] bg-[var(--fp-color-background)] px-3 text-sm text-right"
                        />
                        <span className="text-sm text-[var(--fp-color-muted-foreground)]">%</span>
                      </div>
                    </div>
                    {errors.growth && <span className="text-xs text-red-500">{errors.growth.message}</span>}
                  </div>

                  {/* Actions Inline */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      className="inline-flex h-[48px] items-center gap-2 rounded-full bg-[var(--fp-color-foreground)] px-8 text-sm font-bold text-[var(--fp-color-background)] transition hover:opacity-90"
                    >
                      <Check className="size-4" />
                      {initialData?.id ? t("goals.saveBtnEdit") : t("goals.saveBtnAdd")}
                    </button>
                    <Dialog.Close asChild>
                      <button type="button" className="inline-flex h-[48px] items-center gap-2 rounded-full border border-[var(--fp-color-border)] bg-transparent px-6 text-sm font-bold text-[var(--fp-color-foreground)] transition hover:bg-[var(--fp-color-surface-hover)]">
                        <X className="size-4" />
                        {t("cashflow.cancel")}
                      </button>
                    </Dialog.Close>
                    
                    {initialData?.id && onDelete && (
                      <div className="ml-auto">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-red-600">{t("common.confirmDelete")}</span>
                            <button
                              type="button"
                              onClick={() => { onDelete(initialData.id!); onOpenChange(false); }}
                              className="inline-flex h-[40px] items-center rounded-full bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
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
                            className="inline-flex h-[48px] place-items-center rounded-full border border-red-500/20 bg-red-500/10 px-6 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20"
                          >
                            {t("goals.deleteGoalBtn")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="hidden w-[360px] flex-col bg-[var(--fp-color-surface)] p-10 md:flex border-l border-[var(--fp-color-border)] overflow-y-auto">
              <div className="mb-4 flex items-center gap-3 text-[var(--fp-color-foreground)]">
                <div className="grid size-8 place-items-center rounded-full bg-[var(--fp-color-background)] border border-[var(--fp-color-border)] text-[var(--fp-color-foreground)]">
                  <Icons.BookOpen className="size-4" />
                </div>
                <h3 className="font-bold">{t("goals.modalInstructionTitle")}</h3>
              </div>
              <p className="text-xs leading-relaxed text-[var(--fp-color-muted-foreground)] mb-8">
                {t("goals.modalInstructionDesc")}
              </p>
              
              <ul className="flex flex-col gap-6 text-xs text-[var(--fp-color-muted-foreground)] mb-10">
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">1</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.modalStep1Title")}</strong>
                    {t("goals.modalStep1Desc")}
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">2</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.modalStep2Title")}</strong>
                    {t("goals.modalStep2Desc")}
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">3</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.colType")}</strong>
                    {t("goals.modalStep3Desc")}
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">4</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.iconLabel")}</strong>
                    {t("goals.modalStep4Desc")}
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">5</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.modalStep5Title")}</strong>
                    {t("goals.modalStep5Desc")}
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--fp-color-border)] text-[10px] font-bold text-[var(--fp-color-foreground)]">6</div>
                  <div>
                    <strong className="text-[var(--fp-color-foreground)] block mb-0.5">{t("goals.modalStep6Title")}</strong>
                    {t("goals.modalStep6Desc")}
                  </div>
                </li>
              </ul>

              <div className="mt-auto">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--fp-color-foreground)]">
                  <Icons.Lightbulb className="size-4 text-[var(--fp-color-muted-foreground)]" />
                  {t("goals.tipsTitle")}
                </div>
                <ul className="flex flex-col gap-3 text-xs text-[var(--fp-color-muted-foreground)]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-[var(--fp-color-primary)] opacity-50" />
                    {t("goals.modalTip1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-[var(--fp-color-primary)] opacity-50" />
                    {t("goals.modalTip2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-[var(--fp-color-primary)] opacity-50" />
                    {t("goals.modalTip3")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
