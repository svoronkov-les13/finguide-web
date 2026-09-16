import { expect, test } from "@playwright/test";
import { mockPensionApi } from "./apiMocks";

test("pension required capital refreshes from the selected backend projection", async ({ page }) => {
  const fallbackWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("[FinGuide]")) {
      fallbackWarnings.push(message.text());
    }
  });

  await mockPensionApi(page);
  await page.goto("/pension");

  const requiredCapital = page.getByTestId("required-pension-capital");
  const initialCapital = (await requiredCapital.textContent())?.trim();

  await page.getByRole("textbox", { name: "Желаемые расходы на пенсии (в месяц)" }).fill("200000");
  await page.locator('input[type="range"]').fill("15");
  await page.getByRole("button", { name: "Рассчитать" }).click();

  await expect(requiredCapital).not.toHaveText(initialCapital ?? "");
  await expect(page.getByText(/Чтобы получать 200['\s]000 ₽\/мес на пенсии/)).toBeVisible();

  await page.getByText("Сохранить капитал — жить на проценты + гос. пенсия", { exact: true }).click();
  await page.locator('input[type="range"]').fill("6");
  await page.getByRole("button", { name: "Рассчитать" }).click();

  await expect(page.getByTestId("required-pension-capital-status")).toContainText("доходность должна быть выше инфляции");
  expect(fallbackWarnings).toEqual([]);
});
