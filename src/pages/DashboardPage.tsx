import { useState } from "react";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { GoalsTable } from "@/components/dashboard/GoalsTable";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ScenarioBar } from "@/components/dashboard/ScenarioBar";
import { WhatIfDialog } from "@/components/dashboard/WhatIfDialog";
import { Page } from "@/components/layout/Page";

export function DashboardPage() {
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  return (
    <Page>
      {/* Top Section: Title & Scenario Bar */}
      <section className="flex items-center justify-between gap-6 max-[760px]:block">
        <h1 className="page-title text-[28px] font-bold max-[760px]:mb-4">Финансовый дашборд</h1>
        <ScenarioBar onWhatIf={() => setWhatIfOpen(true)} />
      </section>

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
