import { test, expect } from './helpers/fixtures';
import { login, logout } from './helpers/auth';

for (const scenario of [
  { title: 'both fields empty', email: '', password: '' },
  { title: 'email empty', email: '', password: '12345' },
  { title: 'password empty', email: 'admin@email.com', password: '' },
]) {
  test(`empty-field validation: ${scenario.title}`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(scenario.email);
    await page.getByLabel('Password', { exact: true }).fill(scenario.password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Please enter both email and password');
    await expect(page).toHaveURL(/\/login$/);
  });
}

test('invalid credentials show an error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('admin@email.com');
  await page.getByLabel('Password', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid email or password');
  await expect(page).toHaveURL(/\/login$/);
});

test('successful login returns to the requested protected page', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'AI Intelligence Hub' })).toBeVisible();
});

test('login persists after a full refresh', async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page).toHaveURL(/\/ai-analysis$/);
  await expect(page.getByRole('heading', { name: 'AI Intelligence Hub' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
});

test('logout removes access and survives refresh', async ({ page }) => {
  await login(page);
  await logout(page);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
});

for (const destination of ['/ai-analysis', '/clients', '/client/test-1']) {
  test(`protected page ${destination} redirects after logout`, async ({ page }) => {
    await login(page);
    await logout(page);
    await page.goto(destination);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'User menu' })).toHaveCount(0);
  });
}
