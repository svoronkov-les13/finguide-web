import { Bell, Settings, Shield, SlidersHorizontal } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const groups = [
  {
    title: "Интерфейс",
    icon: SlidersHorizontal,
    items: ["Показывать достижения", "Показывать подсказки на графике", "Компактные таблицы"],
  },
  {
    title: "Планы и сценарии",
    icon: Shield,
    items: ["Автоматически сохранять сценарии", "Подтверждать удаление строк", "Сохранять пользовательский what-if"],
  },
  {
    title: "Уведомления",
    icon: Bell,
    items: ["Напоминать о вводе факта", "Показывать изменения прогноза", "Сообщать о достижении целей"],
  },
];

export function SettingsPage() {
  return (
    <Page bottom={false}>
      <header className="flex min-w-0 items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
          <Settings className="size-5" />
        </span>
        <div>
          <h1 className="page-title">Настройки</h1>
          <p className="mt-1 text-sm text-muted-foreground">Интерфейс, сценарии, уведомления и локальные параметры приложения</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          {groups.map((group) => (
            <Card key={group.title} className="overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-teal)]/20 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">
                  <group.icon className="size-4" />
                </span>
                <div>
                  <h2 className="font-semibold">{group.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Локальные настройки текущего frontend</p>
                </div>
              </div>
              <div className="divide-y divide-border/70">
                {group.items.map((label, index) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-sm text-muted-foreground">Применяется сразу и хранится в состоянии интерфейса</div>
                    </div>
                    <Switch defaultChecked={index !== 0 || group.title !== "Уведомления"} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <aside className="grid content-start gap-5 text-sm text-muted-foreground">
          <Card className="p-5">
            <div className="mb-4 font-semibold text-foreground">Сводка настроек</div>
            <SummaryRow label="Групп" value={String(groups.length)} />
            <SummaryRow label="Параметров" value={String(groups.reduce((sum, group) => sum + group.items.length, 0))} />
            <SummaryRow label="Backend profile" value="read-only" />
          </Card>
          <HelpBlock title="Profile/API">Profile/avatar/account mutations пока отмечены в backend status как follow-up, поэтому настройки аккаунта не отправляются на сервер.</HelpBlock>
        </aside>
      </div>
    </Page>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-b-0">
      <dt>{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function HelpBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-3">
      <span className="pt-0.5">→</span>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 leading-5">{children}</p>
      </div>
    </div>
  );
}
