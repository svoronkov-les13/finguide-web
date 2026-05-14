import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { CashflowPage } from "@/pages/CashflowPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FaqPage } from "@/pages/FaqPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { AuthErrorPage } from "@/pages/AuthErrorPage";
import { GeneralDataPage } from "@/pages/GeneralDataPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PensionPage } from "@/pages/PensionPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SummaryPage } from "@/pages/SummaryPage";
import { TrackingPage } from "@/pages/TrackingPage";

const rootRoute = createRootRoute({
  component: Outlet,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: ProtectedRoute,
});

function IndexRedirect() {
  try {
    const onboardingSeen = globalThis.localStorage?.getItem("fp.onboarding.seen") === "true";
    if (!onboardingSeen) return <Navigate to="/onboarding" replace />;
  } catch {
    /* Non-critical — fall through to /dashboard */
  }
  return <Navigate to="/dashboard" replace />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRedirect,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const generalRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/general",
  component: GeneralDataPage,
});

const incomeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/income",
  component: () => <CashflowPage type="income" />,
});

const expensesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/expenses",
  component: () => <CashflowPage type="expense" />,
});

const expenseRedirectRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/expense",
  component: () => <Navigate to="/expenses" replace />,
});

const goalsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/goals",
  component: GoalsPage,
});

const trackingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tracking",
  component: TrackingPage,
});

const pensionRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/pension",
  component: PensionPage,
});

const summaryRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/summary",
  component: SummaryPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: SettingsPage,
});

const faqRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/faq",
  component: FaqPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: AuthCallbackPage,
});

const authErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/error",
  component: AuthErrorPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  loginRoute,
  registerRoute,
  authCallbackRoute,
  authErrorRoute,
  appRoute.addChildren([
    dashboardRoute,
    generalRoute,
    incomeRoute,
    expensesRoute,
    expenseRedirectRoute,
    goalsRoute,
    trackingRoute,
    pensionRoute,
    summaryRoute,
    settingsRoute,
    faqRoute,
  ]),
]);

const routerBasepath = import.meta.env.VITE_FINGUIDE_BASE_PATH?.replace(/\/$/, "") || "/";

export const router = createRouter({ routeTree, basepath: routerBasepath });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
