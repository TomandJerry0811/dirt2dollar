import { expect, type Page } from '@playwright/test';

export async function login(page: Page, destination = '/ai-analysis') {
  await page.goto(destination);
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email Address').fill('admin@email.com');
  await page.getByLabel('Password', { exact: true }).fill('12345');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // Fail at the login boundary instead of silently injecting authenticated state.
  await expect(page).toHaveURL(url => url.pathname === destination);
  await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Email Address')).toBeVisible();
}
