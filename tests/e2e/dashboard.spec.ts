import { expect, test } from "@playwright/test";

test("dashboard renders core planning controls", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Финансовый дашборд" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Базовый" })).toBeVisible();
  await expect(page.getByText("Прогноз финансов по годам")).toBeVisible();
});
