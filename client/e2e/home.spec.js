import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ffiver/i);
  await expect(page.getByRole("link", { name: /how it works/i })).toBeVisible();
});

test("search page loads", async ({ page }) => {
  await page.goto("/search");
  await expect(page.locator("body")).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("pricing page loads", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();
});
