// Screen-level context for copy review, not a text-to-endpoint binding.
// Paths are relative to VITE_FINGUIDE_BASE_PATH / VITE_FINGUIDE_API_BASE_URL.
const plan = "GET /plans/current";
const forecast = "GET /plans/{planId}/analytics/cashflow?years={years}";
const token = "POST {OIDC_ISSUER}/protocol/openid-connect/token";
const local = "Нет собственного API: текст и поведение интерфейса";
const common = ["Общие компоненты на нескольких экранах", local];
const contexts = {
  onboarding: ["/onboarding", local],
  onboardingDemo: ["/onboarding", "Нет API: демонстрационные иллюстрации"],
  dashboard: ["/dashboard", [plan, "GET /plans/{planId}/dashboard", forecast, "GET /plans/{planId}/analytics/health", "GET /scenarios", "POST /scenarios/compare", "POST /scenarios", "PATCH /scenarios/{id}"].join("\n")],
  chart: ["/dashboard", [plan, forecast, "GET /plans/{planId}/analytics/cashflow/monthly", "POST /scenarios/compare"].join("\n")],
  general: ["/general", [plan, "PATCH /plans/{planId}/analytics/assumptions", "PATCH /plans/{planId}/pension"].join("\n")],
  cashflow: ["/income\n/expenses", [plan, "POST /plans/{planId}/incomes", "PATCH /plans/{planId}/incomes/{id}", "DELETE /plans/{planId}/incomes/{id}", "POST /plans/{planId}/expenses", "PATCH /plans/{planId}/expenses/{id}", "DELETE /plans/{planId}/expenses/{id}"].join("\n")],
  goals: ["/goals\n/dashboard (краткий список)", [plan, "POST /plans/{planId}/goals", "PATCH /plans/{planId}/goals/{id}", "DELETE /plans/{planId}/goals/{id}", "POST /plans/{planId}/goals/reorder"].join("\n")],
  pension: ["/pension", [plan, forecast, "GET /plans/{planId}/pension/projection", "PATCH /plans/{planId}/pension", "PATCH /plans/{planId}/analytics/assumptions"].join("\n")],
  pensionFormat: ["/pension", [plan, forecast].join("\n")],
  tracking: ["/tracking", [plan, "GET /plans/{planId}/calendar/monthly-tracker?year={year}", "POST /plans/{planId}/calendar/monthly-tracker"].join("\n")],
  summary: ["/summary", [plan, forecast].join("\n")],
  settings: ["/settings", "Нет API сохранения настроек: переключатели пока демонстрационные"],
  faq: ["/faq", "Нет API: вопросы и ответы из словаря"],
  planExport: ["/goals → Экспорт", "Нет API экспорта: Excel создаётся в браузере из загруженного плана"],
  topbar: ["Шапка всех экранов плана", ["GET /plans", "POST /plans", "POST /plans/{planId}/copy", "PUT /plans/current"].join("\n")],
  auth: ["/login\n/register\n/forgot-password\n/auth/callback\n/auth/error", "Зависит от формы; см. ключ и контекст"],
  app: ["Все страницы: метаданные, ошибка маршрута и 404", local],
  errors: ["Все экраны: ошибки запросов и операций", "Зависит от операции. Показывается перевод кода ошибки; сырой ответ сервера не импортируется"],
  validation: ["Все формы: проверка ввода", "Проверка в браузере до запроса API"],
  dataLabels: ["Подписи данных на экранах плана", "GET /plans/current; подписи создаются при преобразовании данных"],
  common,
  routes: common,
  groups: common,
  sidebar: common,
  command: ["Быстрый переход на экранах плана", local],
  toast: ["Уведомление о достижении на экранах плана", local],
  instructionPanel: ["Панели инструкций на экранах плана", local],
  format: ["Числа и единицы на нескольких экранах", "Форматирование в браузере"],
};

export function copyContext(key) {
  if (key.startsWith("auth.login.")) return { screens: "/login", api: token };
  if (key.startsWith("auth.register.")) return { screens: "/register", api: `POST /auth/register\n${token}` };
  if (key.startsWith("auth.forgot.")) return { screens: "/forgot-password", api: "POST /auth/password/forgot" };
  const context = contexts[key.split(".")[0]];
  if (!context) throw new Error(`Нет контекста для ${key}`);
  return { screens: context[0], api: context[1] };
}
