import { expect, test } from "@playwright/test";
import { mockDashboardApi } from "./apiMocks";

test("dashboard renders core planning controls", async ({ page }) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Финансовый дашборд" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Сценарии прогноза" }).getByRole("button", { name: "Основной план" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Что если\?/ })).toBeVisible();
  await expect(page.getByText("Прогноз финансов по годам")).toBeVisible();
});

test("what-if scenario modal applies a client-side scenario", async ({ page }) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: /Что если\?/ }).click();
  const dialog = page.getByRole("dialog", { name: "Моделирование сценариев" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Оптимистичный" }).click();
  await dialog.getByRole("button", { name: /Применить и закрыть/ }).click();

  const scenarioButton = page.getByRole("button", { name: /Что если\?/ });
  await expect(scenarioButton).toBeVisible();
  await expect(scenarioButton).toHaveClass(/bg-\[var\(--fp-color-accent-gold-soft\)\]/);
});

test("sidebar counters come from the current persisted plan state", async ({ page }) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: /^(Доходы|Income): 2$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^(Расходы|Expenses): 3$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^(Цели|Goals): 4$/ })).toBeVisible();
});
