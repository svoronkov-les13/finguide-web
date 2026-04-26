import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  return (
    <Page>
      <PageHeader title="Settings" description="Настройки интерфейса, планов и уведомлений." />
      <Card className="divide-y divide-border">
        {["Показывать достижения", "Напоминать о вводе факта", "Автоматически сохранять сценарии", "Показывать подсказки на графике"].map((label, index) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="font-semibold">{label}</div>
              <div className="text-sm text-muted-foreground">Локальная настройка демо-интерфейса</div>
            </div>
            <Switch defaultChecked={index !== 1} />
          </div>
        ))}
      </Card>
    </Page>
  );
}
