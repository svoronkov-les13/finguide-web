import { expect, test } from "@playwright/test";
import { mockDashboardApi } from "./apiMocks";

test("dashboard renders core planning controls", async ({ page }) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Финансовый дашборд" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Базовый" })).toBeVisible();
  await expect(page.getByText("Прогноз финансов по годам")).toBeVisible();
});

test("sidebar counters come from the current persisted plan state", async ({ page }) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: /^(Доходы|Income): 2$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^(Расходы|Expenses): 3$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^(Цели|Goals): 4$/ })).toBeVisible();
});
