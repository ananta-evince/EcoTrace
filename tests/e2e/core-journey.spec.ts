import { test, expect } from '@playwright/test';

test.describe('EcoTrace landing', () => {
  test('landing page loads with hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('reduce');
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  });

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to EcoTrace' })).toBeVisible();
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
  });
});

test.describe('EcoTrace authenticated journey', () => {
  test.skip(!process.env.E2E_DATABASE_URL, 'Requires database with seeded demo user');

  test('demo user can sign in and view dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@ecotrace.app');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
