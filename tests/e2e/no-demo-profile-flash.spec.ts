import { expect, test } from "@playwright/test";

test("dashboard does not render demo owner fallback while current plan is loading", async ({ page }) => {
  let releasePlan!: () => void;
  const planPending = new Promise<void>((resolve) => {
    releasePlan = resolve;
  });

  await page.route("**/finguide-api/api/v1/plans/current", async (route) => {
    await planPending;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "22222222-2222-4222-8222-222222222222",
          profile: { name: "Александр Петров", email: "alex.petrov@email.com", age: 35 },
          pension: { currentAge: 35, retirementAge: 60 },
          modelAssumptions: { startYear: 2026, birthYear: 1991 },
          incomes: [],
          expenses: [],
          goals: [],
        },
      }),
    });
  });

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Финансовый дашборд" })).toBeVisible();
  await expect(page.getByText("Александр Петров")).toHaveCount(0);
  await expect(page.getByText("alex.petrov@email.com")).toHaveCount(0);
  await expect(page.getByText("Основной план")).toHaveCount(0);
  await expect(page.getByText("Pro")).toHaveCount(0);

  releasePlan();
});
