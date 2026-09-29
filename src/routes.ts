import {
  CalendarCheck,
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
  /** Left out of the sidebar and command palette; the page still opens by direct link. */
  hidden?: boolean;
}

export const navigation = [
  { href: "/dashboard", labelKey: "routes.dashboard", icon: LayoutDashboard },
  { href: "/general", labelKey: "routes.general", icon: SlidersHorizontal },
  { href: "/income", labelKey: "routes.income", icon: Wallet },
  { href: "/expenses", labelKey: "routes.expenses", icon: CreditCard },
  { href: "/goals", labelKey: "routes.goals", icon: Target },
  { href: "/pension", labelKey: "routes.pension", icon: Landmark },
  { href: "/summary", labelKey: "routes.summary", icon: FileChartColumnIncreasing },
] satisfies RouteNavItem[];


export const tools = [{ href: "/tracking", labelKey: "routes.tracker", icon: CalendarCheck }] satisfies RouteNavItem[];

// Settings and FAQ are placeholders so far; hidden until they get real content.
export const systemRoutes: RouteNavItem[] = [
  { href: "/settings", labelKey: "routes.settings", icon: Settings, hidden: true },
  { href: "/faq", labelKey: "routes.faq", icon: CircleHelp, hidden: true },
];

export const visibleSystemRoutes = systemRoutes.filter((item) => !item.hidden);
