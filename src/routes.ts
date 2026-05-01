import {
  CalendarCheck,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  FileChartColumnIncreasing,
  Landmark,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  Target,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import type { TranslationKey } from "@/i18n/messages";

export interface RouteNavItem {
  href: string;
  labelKey: TranslationKey;
  badge?: string;
  icon: ComponentType<{ className?: string }>;
}

export const navigation = [
  { href: "/dashboard", labelKey: "routes.dashboard", icon: LayoutDashboard },
  { href: "/general", labelKey: "routes.general", icon: SlidersHorizontal },
  { href: "/income", labelKey: "routes.income", icon: Wallet },
  { href: "/expenses", labelKey: "routes.expenses", icon: CreditCard },
  { href: "/goals", labelKey: "routes.goals", icon: Target },
  { href: "/tracking", labelKey: "routes.tracking", icon: CircleDollarSign },
  { href: "/pension", labelKey: "routes.pension", icon: Landmark },
  { href: "/summary", labelKey: "routes.summary", icon: FileChartColumnIncreasing },
] satisfies RouteNavItem[];

export const tools = [{ href: "/tracking", labelKey: "routes.tracker", icon: CalendarCheck }] satisfies RouteNavItem[];

export const systemRoutes = [
  { href: "/settings", labelKey: "routes.settings", icon: Settings },
  { href: "/faq", labelKey: "routes.faq", icon: CircleHelp },
] satisfies RouteNavItem[];
