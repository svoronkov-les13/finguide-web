import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { usePlanQuery, useUpdateSettingsMutation } from "@/api/planQueries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatIfSchema, type WhatIfFormValues } from "@/forms/settingsSchema";

interface WhatIfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatIfDialog({ open, onOpenChange }: WhatIfDialogProps) {
  const { data: plan } = usePlanQuery();
  const updateSettings = useUpdateSettingsMutation();
  const form = useForm<z.input<typeof whatIfSchema>, unknown, WhatIfFormValues>({
    resolver: zodResolver(whatIfSchema),
    values: {
      investmentReturnPercent: Math.round((plan?.settings.investmentReturn ?? 0.06) * 100),
      inflationPercent: Math.round((plan?.settings.inflation ?? 0.031) * 100),
      retirementAge: plan?.settings.retirementAge ?? 50,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateSettings.mutate({
      investmentReturn: values.investmentReturnPercent / 100,
      inflation: values.inflationPercent / 100,
      retirementAge: values.retirementAge,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Что если?</DialogTitle>
          <DialogDescription>Измените ключевые параметры модели. Данные сохраняются в mock API и сразу перестраивают прогноз.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="return">Доходность, %</Label>
              <Input id="return" type="number" step="0.1" {...form.register("investmentReturnPercent")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflation">Инфляция, %</Label>
              <Input id="inflation" type="number" step="0.1" {...form.register("inflationPercent")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirement">Пенсия, лет</Label>
              <Input id="retirement" type="number" {...form.register("retirementAge")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={updateSettings.isPending}>Применить сценарий</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
