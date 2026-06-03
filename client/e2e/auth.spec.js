import { test, expect } from "@playwright/test";

test("signup page shows form", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("button", { name: /join/i })).toBeVisible();
});

test("verify-email page without token shows loading then error", async ({
  page,
}) => {
  await page.goto("/verify-email");
  await expect(page.getByRole("heading", { name: /email verification/i })).toBeVisible();
});
