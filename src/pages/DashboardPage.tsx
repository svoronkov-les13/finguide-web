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
      <section className="grid items-center gap-4 max-[760px]:flex max-[760px]:flex-col max-[760px]:items-start mb-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_3fr]">
        <h1 className="page-title text-[28px] font-bold">Финансовый дашборд</h1>
        <div className="flex justify-start xl:justify-end overflow-hidden w-full">
          <ScenarioBar onWhatIf={() => setWhatIfOpen(true)} />
        </div>
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
