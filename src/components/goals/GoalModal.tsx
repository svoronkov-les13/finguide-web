import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Goal } from "@/types/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/I18nProvider";
import * as Icons from "lucide-react";

interface GoalFormData {
  id?: string;
  name: string;
  icon: string;
  targetYear: number;
  cost: number;
  saved: number;
  growth: number;
  reachable: boolean;
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
  const form = useForm<GoalFormData>({
    defaultValues: {
      icon: "Target",
      growth: 0.05,
      reachable: true,
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      const targetYear = new Date().getFullYear() + 5;
      form.reset({
        ...initialData,
        name: initialData?.name || "",
        icon: initialData?.icon || "Target",
        targetYear: initialData?.targetYear ?? targetYear,
        cost: initialData?.cost || 0,
        saved: initialData?.saved || 0,
        growth: initialData?.growth || 0.05,
        reachable: initialData?.reachable ?? true,
      } as GoalFormData);
    }
  }, [open, initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-stretch justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ padding: "32px 0" }}
          onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="mx-auto flex w-full max-w-[600px] overflow-hidden rounded-[24px] bg-[var(--fp-color-background)] shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-10 pt-10 pb-2">
                <Dialog.Title className="text-xl font-bold text-[var(--fp-color-foreground)]">
                  {initialData?.id ? t("goals.editGoal") : t("goals.newGoal")}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="grid size-8 place-items-center rounded-full text-[var(--fp-color-muted-foreground)] transition-colors hover:bg-[var(--fp-color-surface-hover)] hover:text-[var(--fp-color-foreground)]">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 px-10 pb-10 pt-4">
                <form id="goal-form" onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.nameLabel")}</Label>
                      <Input
                        placeholder={t("goals.nameLabel")}
                        {...form.register("name")}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.iconLabel")}</Label>
                      <Input
                        placeholder="Target"
                        {...form.register("icon")}
                        className="h-[48px] w-[120px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.cost")}</Label>
                      <Input
                        type="number"
                        {...form.register("cost", { valueAsNumber: true })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.saved")}</Label>
                      <Input
                        type="number"
                        {...form.register("saved", { valueAsNumber: true })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-end gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">{t("goals.targetYear")}</Label>
                      <Input
                        type="number"
                        {...form.register("targetYear", { valueAsNumber: true })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-[var(--fp-color-foreground)]">
                        {t("goals.growth")} <span className="text-xs font-normal text-muted-foreground">(в долях, напр. 0.05)</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register("growth", { valueAsNumber: true })}
                        className="h-[48px] rounded-full border-[var(--fp-color-border)] bg-[var(--fp-color-surface)] px-5 text-sm"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--fp-color-border)] p-6 px-10">
                <div>
                  {initialData?.id && onDelete && (
                    isDeleting ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{t("common.confirmDelete")}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(initialData.id!);
                            onOpenChange(false);
                          }}
                          className="inline-flex h-8 items-center rounded-full bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700"
                        >
                          {t("common.yes")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleting(false)}
                          className="inline-flex h-8 items-center rounded-full bg-muted px-3 text-xs font-bold text-foreground hover:bg-muted/80"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsDeleting(true)}
                        className="inline-flex h-[48px] items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-500"
                      >
                        <Icons.Trash2 className="size-4" />
                        {t("goals.deleteGoal")}
                      </button>
                    )
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Dialog.Close asChild>
                    <button type="button" className="text-sm font-medium text-[var(--fp-color-muted-foreground)] transition-colors hover:text-[var(--fp-color-foreground)]">
                      {t("common.close")}
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    form="goal-form"
                    className="inline-flex h-[48px] items-center gap-2 rounded-full bg-[var(--fp-color-primary)] px-8 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <Check className="size-4" />
                    {t("common.collapse")} {/* or save translation */}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
