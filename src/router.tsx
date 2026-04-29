import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CashflowPage } from "@/pages/CashflowPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FaqPage } from "@/pages/FaqPage";
import { GeneralDataPage } from "@/pages/GeneralDataPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { PensionPage } from "@/pages/PensionPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SummaryPage } from "@/pages/SummaryPage";
import { TrackingPage } from "@/pages/TrackingPage";

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" replace />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const generalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/general",
  component: GeneralDataPage,
});

const incomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/income",
  component: () => <CashflowPage type="income" />,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: () => <CashflowPage type="expense" />,
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals",
  component: GoalsPage,
});

const trackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tracking",
  component: TrackingPage,
});

const pensionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pension",
  component: PensionPage,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FaqPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  generalRoute,
  incomeRoute,
  expensesRoute,
  goalsRoute,
  trackingRoute,
  pensionRoute,
  summaryRoute,
  settingsRoute,
  faqRoute,
]);

const routerBasepath = import.meta.env.VITE_FINGUIDE_BASE_PATH?.replace(/\/$/, "") || "/";

export const router = createRouter({ routeTree, basepath: routerBasepath });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
