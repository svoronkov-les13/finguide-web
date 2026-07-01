import { useState } from "react";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { GoalsTable } from "@/components/dashboard/GoalsTable";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ScenarioBar } from "@/components/dashboard/ScenarioBar";
import { WhatIfDialog } from "@/components/dashboard/WhatIfDialog";
import { Page, PageHeader } from "@/components/layout/Page";
import { useI18n } from "@/i18n/I18nProvider";

export function DashboardPage() {
  const { t } = useI18n();
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  return (
    <Page>
      <PageHeader
        title={t("dashboard.title")}
        actions={<ScenarioBar onWhatIf={() => setWhatIfOpen(true)} />}
      />

      {/* KPI Cards Grid */}
      <KpiCards />

      {/* Main Content */}
      <div className="grid gap-6">
        <ForecastChart />
        <GoalsTable />
      </div>

      <WhatIfDialog open={whatIfOpen} onOpenChange={setWhatIfOpen} />
    </Page>
  );
}
