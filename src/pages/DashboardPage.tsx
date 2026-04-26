import { useState } from "react";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { GoalsTable } from "@/components/dashboard/GoalsTable";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ScenarioBar } from "@/components/dashboard/ScenarioBar";
import { WhatIfDialog } from "@/components/dashboard/WhatIfDialog";
import { Page } from "@/components/layout/Page";
import { useI18n } from "@/i18n/I18nProvider";

export function DashboardPage() {
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const { t } = useI18n();

  return (
    <Page className="gap-2.5">
      <section className="flex items-end justify-between gap-6 max-[760px]:block">
        <h1 className="text-[26px] font-bold leading-[1.4] max-[760px]:mb-4 max-[760px]:text-2xl">{t("dashboard.title")}</h1>
        <ScenarioBar onWhatIf={() => setWhatIfOpen(true)} />
      </section>
      <KpiCards />
      <ForecastChart />
      <GoalsTable />
      <WhatIfDialog open={whatIfOpen} onOpenChange={setWhatIfOpen} />
    </Page>
  );
}
