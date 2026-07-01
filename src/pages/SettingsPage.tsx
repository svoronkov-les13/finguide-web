import { Bell, Shield, SlidersHorizontal } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { useI18n } from "@/i18n/I18nProvider";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { TranslationKey } from "@/i18n/messages";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groups: Array<{ titleKey: TranslationKey; icon: any; items: TranslationKey[] }> = [
  {
    titleKey: "settings.groupInterface" as const,
    icon: SlidersHorizontal,
    items: [
      "settings.optAchievements",
      "settings.optChartHints",
      "settings.optCompact",
    ],
  },
  {
    titleKey: "settings.groupPlans",
    icon: Shield,
    items: [
      "settings.optAutoSave",
      "settings.optConfirmDelete",
      "settings.optSaveWhatIf",
    ],
  },
  {
    titleKey: "settings.groupNotifications",
    icon: Bell,
    items: [
      "settings.optRemind",
      "settings.optShowForecastChanges",
      "settings.optGoalReached",
    ],
  },
];

export function SettingsPage() {
  const { t } = useI18n();
  return (
    <Page bottom={false}>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,800px)_280px]">
        <div className="grid gap-5">
          {groups.map((group) => (
            <Card key={group.titleKey} className="overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <span className="grid size-9 place-items-center rounded-full border border-[var(--fp-color-teal)]/20 bg-[var(--fp-color-teal-soft)] text-[var(--fp-color-teal)]">
                  <group.icon className="size-[22px] text-[var(--fp-color-primary)]" />
                </span>
                <div>
                  <h2 className="font-semibold">{t(group.titleKey)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("settings.descLocal")}</p>
                </div>
              </div>
              <div className="divide-y divide-border/70">
                {group.items.map((labelKey, index) => (
                  <div key={labelKey} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <div className="font-semibold">{t(labelKey as Parameters<typeof t>[0])}</div>
                      <div className="text-sm text-muted-foreground">{t("settings.descApply")}</div>
                    </div>
                    <Switch defaultChecked={index !== 0 || group.titleKey !== "settings.groupNotifications"} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <aside className="grid content-start gap-5 text-sm text-muted-foreground">
          <Card className="p-5">
            <div className="mb-4 font-semibold text-foreground">{t("settings.summary")}</div>
            <SummaryRow label={t("settings.groups")} value={String(groups.length)} />
            <SummaryRow label={t("settings.parameters")} value={String(groups.reduce((sum, group) => sum + group.items.length, 0))} />
            <SummaryRow label={t("settings.backendProfile")} value="read-only" />
          </Card>
          <HelpBlock title={t("settings.profileTitle")}>{t("settings.profileDesc")}</HelpBlock>
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
