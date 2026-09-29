import { expect, test } from "@playwright/test";
import { mockDashboardApi } from "./apiMocks";
import { brand } from "../../src/config/brand";

test("changes interface language and metadata while preserving user data", async ({ page }, testInfo) => {
  await mockDashboardApi(page);
  await page.route("**/scenarios/compare", (route) => route.fulfill({ contentType: "application/json", body: '{"data":{"scenarios":[]}}' }));
  await page.route("**/tracker/entries", (route) => route.fulfill({ contentType: "application/json", body: '{"data":[]}' }));
  await page.route("**/analytics/cashflow/monthly", (route) => route.fulfill({ contentType: "application/json", body: '{"data":[]}' }));
  await page.route("**/finguide-api/api/v1/plans", (route) => route.fulfill({ contentType: "application/json", body: '{"data":[]}' }));
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Финансовый дашборд" })).toBeVisible();
  await expect(page).toHaveTitle(`${brand.name} | Финансовый капитал`);
  await page.getByRole("button", { name: "Тестовый Пользователь" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Financial dashboard" })).toBeVisible();
  await expect(page).toHaveTitle(`${brand.name} | Financial capital`);
  await expect(page.getByRole("button", { name: "Тестовый Пользователь" })).toBeVisible();
  await page.getByRole("link", { name: "Goals: 4" }).click();
  await expect(page.getByRole("heading", { name: "Goals", exact: true })).toBeVisible();
  await expect(page.getByText("Подушка", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(" г.");
  await page.screenshot({ path: testInfo.outputPath("english-goals.png"), fullPage: true });
});

test("localizes branding, native validation and not-found pages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("finguide.locale", "en"));
  await page.goto("/login");
  await expect(page.locator("body")).toContainText(brand.name);
  await expect(page.locator("body")).not.toContainText("FinPlan");
  await page.locator('button[type="submit"]').click();
  const message = await page.locator('input[type="email"]').evaluate((input: HTMLInputElement) => input.validationMessage);
  expect(message).toBe("Please fill out this field");
  await page.goto("/missing-localization-check");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("renders every main screen in English without leaking Russian interface copy", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => localStorage.setItem("finguide.locale", "en"));
  await mockDashboardApi(page);
  await page.route("**/scenarios/compare", (route) => route.fulfill({ json: { data: { scenarios: [] } } }));
  await page.route("**/tracker/entries", (route) => route.fulfill({ json: { data: [] } }));
  await page.route("**/analytics/cashflow/monthly", (route) => route.fulfill({ json: { data: [] } }));
  await page.route("**/calendar/monthly-tracker**", (route) => route.fulfill({ json: { data: [] } }));
  await page.route("**/finguide-api/api/v1/plans", (route) => route.fulfill({ json: { data: [] } }));
  const screens = ["dashboard", "general", "income", "expenses", "goals", "pension", "summary", "tracking", "settings", "faq", "onboarding", "login", "register", "forgot-password", "auth/error"];
  // These are user-owned fixture values, which must remain unchanged in any language.
  const userValues = ["Тестовый Пользователь", "ТП", "Зарплата", "Бонус", "Аренда", "Еда", "Отпуск", "Подушка", "Ремонт", "Целевой взнос", "Авто"];
  for (const screen of screens) {
    await test.step(screen, async () => {
      await page.goto(`/${screen}`);
      await expect(page.getByRole("heading").first()).toBeVisible();
      // Await plan data as well as the page shell on screens that render it.
      if (["dashboard", "general", "income", "expenses", "goals", "pension", "summary", "tracking"].includes(screen)) {
        await expect(page.getByRole("button", { name: "Тестовый Пользователь" })).toBeVisible();
      }
      let text = await page.locator("body").innerText();
      for (const value of userValues) text = text.replaceAll(value, "");
      text = text.replaceAll("Русский", ""); // Language selector endonym.
      expect(text.match(/[А-Яа-яЁё]+/g) ?? [], screen).toEqual([]);
      expect(text, screen).not.toMatch(/FinGuide|FinPlan|\{\{\w+\}\}/);
      if (screen === "settings") {
        await expect(page.getByText("Read only", { exact: true })).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath("english-settings.png"), fullPage: true });
      }
    });
  }
});
