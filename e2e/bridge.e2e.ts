import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is accessible and responsive', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Quiet Dictation Bridge/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Speak softly');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  if (testInfo.project.name.includes('mobile')) {
    await expect(page.getByRole('button', { name: /This is my phone/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('production purchase link uses the live billing host and keyboard starts the bridge', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#buy-link')).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/checkout');
  await expect(page.locator('#download-apk')).toHaveAttribute('href', '/download/quiet-dictation-bridge-debug.apk');
  await expect(page.locator('#apk-checksum')).toHaveAttribute('href', /quiet-dictation-bridge-debug\.apk\.sha256$/);
  await page.getByRole('button', { name: /This is my computer/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Invite your phone' })).toBeVisible();
});

test('two pages pair and send reviewed text locally', async ({ browser }) => {
  const context = await browser.newContext();
  const desktop = await context.newPage();
  const phone = await context.newPage();
  await Promise.all([desktop.goto('/'), phone.goto('/')]);

  await desktop.getByRole('button', { name: /This is my computer/ }).click();
  await desktop.getByRole('button', { name: 'Create invitation' }).click();
  await expect(desktop.locator('#invite-code')).not.toHaveValue('');
  const invitation = await desktop.locator('#invite-code').inputValue();

  await phone.getByRole('button', { name: /This is my phone/ }).click();
  await phone.locator('#phone-invite').fill(invitation);
  await phone.getByRole('button', { name: 'Create private answer' }).click();
  await expect(phone.locator('#phone-answer')).not.toHaveValue('');
  const answer = await phone.locator('#phone-answer').inputValue();

  await desktop.locator('#answer-code').fill(answer);
  await desktop.getByRole('button', { name: 'Connect phone' }).click();
  await expect(desktop.locator('#desktop-status')).toContainText('Phone connected', { timeout: 15_000 });
  await expect(phone.locator('#phone-status')).toContainText('Computer connected', { timeout: 15_000 });

  await phone.locator('#draft-text').fill('Quiet words arrive only after confirmation.');
  await phone.getByRole('button', { name: 'Confirm & send' }).click();
  await expect(desktop.locator('.transcript').first()).toContainText('Quiet words arrive only after confirmation.');
  await context.close();
});

test('app shell reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await expect(page.getByText(/Internet offline/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Speak softly');
});

test('privacy and terms are standalone accessible pages', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
});
