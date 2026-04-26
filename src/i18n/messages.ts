export const ru = {
  common: {
    appName: "Finguide",
    privateBanking: "Private banking",
    overview: "Обзор",
    searchPlaceholder: "Поиск разделов и настроек...",
    mainPlan: "Основной план",
    collapse: "Свернуть",
    expandMenu: "Развернуть меню",
    collapseMenu: "Свернуть меню",
    notifications: "Уведомления",
    close: "Закрыть",
    language: "Язык",
    russian: "Русский",
    english: "English",
    pro: "Pro",
  },
  groups: {
    navigation: "Navigation",
    tools: "Tools",
    system: "System",
  },
  routes: {
    dashboard: "Dashboard",
    general: "General Data",
    income: "Income",
    expenses: "Expenses",
    goals: "Goals",
    tracking: "Tracking",
    pension: "Pension",
    summary: "Summary",
    tracker: "Tracker",
    settings: "Settings",
    faq: "FAQ",
  },
  sidebar: {
    balanceYear: "Balance / year",
  },
  command: {
    title: "Быстрый переход",
    placeholder: "Раздел, настройка, сценарий...",
  },
  dashboard: {
    title: "Финансовый дашборд",
    scenariosLabel: "Сценарии прогноза",
    recommendation: "Рекомендация",
    recommendationText: "При текущих показателях финансовая независимость достижима к {{year}} году. Отличный темп накоплений!",
    needToSave: "Нужно откладывать",
    perMonth: "/мес",
    perYear: "/год",
    pensionCapital: "Капитал к пенсии",
    independence: "Фин. независимость",
    health: "Финансовое здоровье",
    healthGood: "Хорошо",
    reachableGoals: "{{count}} целей достижимы в текущем плане",
  },
  chart: {
    title: "Прогноз финансов по годам",
    projection: "Проекция на {{years}} лет · млн ₽",
    yearly: "По годам",
    byAge: "По возрасту",
    zoomOut: "Уменьшить",
    fullscreen: "На весь экран",
    zoomIn: "Увеличить",
    income: "Доходы",
    expenses: "Расходы",
    goals: "Цели",
    savings: "Накопления",
    actual: "Факт",
    base: "Баз.",
    optimistic: "Опт.",
    pessimistic: "Песс.",
    modelFuture: "Моделируйте своё будущее",
    modelFutureDescription: "Нажмите «Что если?» — настройте рост доходов, расходов и доходность инвестиций, сохраняйте свои сценарии.",
    pensionMarker: "Пенсия: 80.3 млн",
    scaleTitle: "Масштабируйте график",
    scaleDescription: "Двигайте ползунки внизу графика для приближения к нужному периоду.",
    capitalTooltip: "Капитал",
  },
  toast: {
    unlocked: "Достижение разблокировано!",
    title: "Крупный накопитель",
    description: "Общие накопления > 500 000 ₽",
  },
} as const;

type DictionaryShape<T> = {
  [K in keyof T]: T[K] extends string ? string : DictionaryShape<T[K]>;
};

export const en = {
  common: {
    appName: "Finguide",
    privateBanking: "Private banking",
    overview: "Overview",
    searchPlaceholder: "Search sections and settings...",
    mainPlan: "Main plan",
    collapse: "Collapse",
    expandMenu: "Expand menu",
    collapseMenu: "Collapse menu",
    notifications: "Notifications",
    close: "Close",
    language: "Language",
    russian: "Русский",
    english: "English",
    pro: "Pro",
  },
  groups: {
    navigation: "Navigation",
    tools: "Tools",
    system: "System",
  },
  routes: {
    dashboard: "Dashboard",
    general: "General Data",
    income: "Income",
    expenses: "Expenses",
    goals: "Goals",
    tracking: "Tracking",
    pension: "Pension",
    summary: "Summary",
    tracker: "Tracker",
    settings: "Settings",
    faq: "FAQ",
  },
  sidebar: {
    balanceYear: "Balance / year",
  },
  command: {
    title: "Quick navigation",
    placeholder: "Section, setting, scenario...",
  },
  dashboard: {
    title: "Financial dashboard",
    scenariosLabel: "Forecast scenarios",
    recommendation: "Recommendation",
    recommendationText: "At the current pace, financial independence is reachable by {{year}}. The savings trend is strong.",
    needToSave: "Need to save",
    perMonth: "/mo",
    perYear: "/year",
    pensionCapital: "Capital at pension",
    independence: "Financial independence",
    health: "Financial health",
    healthGood: "Good",
    reachableGoals: "{{count}} goals are reachable in the current plan",
  },
  chart: {
    title: "Financial forecast by year",
    projection: "{{years}} year projection · RUB mln",
    yearly: "By year",
    byAge: "By age",
    zoomOut: "Zoom out",
    fullscreen: "Fullscreen",
    zoomIn: "Zoom in",
    income: "Income",
    expenses: "Expenses",
    goals: "Goals",
    savings: "Savings",
    actual: "Actual",
    base: "Base",
    optimistic: "Opt.",
    pessimistic: "Pess.",
    modelFuture: "Model your future",
    modelFutureDescription: "Click “What if?” to tune income growth, expense growth, and investment returns, then save scenarios.",
    pensionMarker: "Pension: 80.3 mln",
    scaleTitle: "Scale the chart",
    scaleDescription: "Move the sliders below the chart to zoom into the period you need.",
    capitalTooltip: "Capital",
  },
  toast: {
    unlocked: "Achievement unlocked!",
    title: "Major saver",
    description: "Total savings > RUB 500,000",
  },
} satisfies DictionaryShape<typeof ru>;

export const dictionaries = { ru, en } as const;
export const locales = ["ru", "en"] as const;

export type Locale = (typeof locales)[number];

type Primitive = string | number | boolean | null | undefined;
type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, Primitive>
    ? LeafPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = LeafPaths<typeof ru>;
