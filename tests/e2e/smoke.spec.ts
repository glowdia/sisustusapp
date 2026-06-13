import { expect, test } from "@playwright/test";

test("opens the moodboard editor", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Sisustusapp/);
  await expect(page.getByText("Testiolohuone")).toBeVisible();
  await expect(page.getByText("Huonekalut ja valaisimet")).toBeVisible();
});
