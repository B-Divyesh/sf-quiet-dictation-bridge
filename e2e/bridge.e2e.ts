import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';

test('home is accessible and responsive', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/Quiet Dictation Bridge/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Speak softly');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
  if (testInfo.project.name.includes('mobile')) {
    await expect(page.getByRole('button', { name: /This is my phone/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('keyboard focus and reduced-motion treatment remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  const roleButton = page.getByRole('button', { name: /This is my phone/ });
  const size = await roleButton.boundingBox();
  expect(size?.width).toBeGreaterThanOrEqual(44);
  expect(size?.height).toBeGreaterThanOrEqual(44);
  const reducedDuration = await page.locator('.talk-rings').evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(reducedDuration).toBeLessThanOrEqual(0.00001);
});

test('production checkout is gated by the live catalog and Android download is a real asset', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [] }),
  }));
  await page.goto('/');
  await expect(page.locator('#buy-link')).toHaveAttribute('data-checkout-url', 'https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/checkout');
  await page.locator('#buy-link').click();
  await expect(page.locator('#checkout-status')).toContainText('checkout is being prepared');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173/);
  await expect(page.locator('#download-apk')).toHaveAttribute('href', '/download/quiet-dictation-bridge-debug.apk');
  await expect(page.locator('#apk-checksum')).toHaveAttribute('href', /quiet-dictation-bridge-debug\.apk\.sha256$/);
  const apk = await page.request.get('/download/quiet-dictation-bridge-debug.apk');
  const sidecar = await page.request.get('/download/quiet-dictation-bridge-debug.apk.sha256');
  expect(apk.ok()).toBe(true);
  const apkBody = await apk.body();
  expect(apkBody.subarray(0, 4).toString('binary')).toBe('PK\x03\x04');
  expect(apkBody.byteLength).toBeGreaterThan(1_000_000);
  expect(sidecar.ok()).toBe(true);
  expect((await sidecar.text()).trim()).toBe(`${createHash('sha256').update(apkBody).digest('hex')}  quiet-dictation-bridge-debug.apk`);
  await page.getByRole('button', { name: /This is my computer/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Invite your phone' })).toBeVisible();
});

test('catalog-enabled checkout opens only the exact Sociobot product route', async ({ page }) => {
  const checkout = 'https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/checkout';
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [{ slug: 'quiet-dictation-bridge', checkout_url: checkout }] }),
  }));
  await page.route(checkout, (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Hosted checkout</title><h1>Hosted checkout</h1>',
  }));
  await page.goto('/');
  await page.locator('#buy-link').click();
  await expect(page).toHaveURL(checkout);
  await expect(page).toHaveTitle('Hosted checkout');
});

test('returned and restored licenses are verified without exposing tokens in the URL', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/verify?license=returned-token', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }),
  }));
  await page.goto('/?license=returned-token');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.locator('#license-status')).toContainText('License no longer active');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:quiet-dictation-bridge'))).toBe('returned-token');

  await page.route('https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/verify?license=restored-token', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.getByText('Have a license? Restore it').click();
  await page.locator('#license-token').fill('restored-token');
  await page.getByRole('button', { name: 'Verify license token' }).click();
  await expect(page.locator('#license-status')).toContainText('Quiet Kit restored');
  await expect(page.locator('#auto-copy')).toBeEnabled();
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
