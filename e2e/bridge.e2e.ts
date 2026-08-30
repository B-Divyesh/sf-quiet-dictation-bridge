import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';

async function pairPages(desktop: Page, phone: Page) {
  await desktop.getByRole('button', { name: /This is my computer/ }).click();
  await desktop.getByRole('button', { name: 'Create invitation' }).click();
  await expect(desktop.locator('#invite-code')).not.toHaveValue('', { timeout: 15_000 });
  await phone.getByRole('button', { name: /This is my phone/ }).click();
  await phone.locator('#phone-invite').fill(await desktop.locator('#invite-code').inputValue());
  await phone.getByRole('button', { name: 'Create private answer' }).click();
  await expect(phone.locator('#phone-answer')).not.toHaveValue('', { timeout: 15_000 });
  await desktop.locator('#answer-code').fill(await phone.locator('#phone-answer').inputValue());
  await desktop.getByRole('button', { name: 'Connect phone' }).click();
  await expect(desktop.locator('#desktop-status')).toContainText('Phone connected', { timeout: 15_000 });
  await expect(phone.locator('#phone-status')).toContainText('Computer connected', { timeout: 15_000 });
}

test('@claim:private-load home is accessible, responsive, and makes no third-party request', async ({ page }, testInfo) => {
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dictate softly');
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

test('@claim:free-release unregistered paid offer is not advertised and Android download is real', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('$9 one time')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /checkout/i })).toHaveCount(0);
  await expect(page.locator('#license-token')).toHaveCount(0);
  await expect(page.locator('#auto-copy')).toHaveCount(0);
  await expect(page.locator('#session-label')).toBeEnabled();
  await expect(page.locator('#tone-choice option')).toHaveCount(3);
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

test('@claim:manual-copy received phrases copy only after a user chooses Copy', async ({ browser }) => {
  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  await page.goto('/?demo=1');
  const phrase = await page.locator('.transcript p').first().textContent();

  await page.locator('.copy-transcript').first().click();

  await expect(page.locator('.copy-transcript').first()).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(phrase);
  await context.close();
});

test('@claim:local-delivery two pages pair and send reviewed text locally', async ({ browser }) => {
  const context = await browser.newContext();
  const desktop = await context.newPage();
  const phone = await context.newPage();
  const externalRequests: string[] = [];
  for (const activePage of [desktop, phone]) activePage.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
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
  expect(externalRequests).toEqual([]);
  await context.close();
});

test('@claim:press-to-listen recognition starts on hold and stops on release', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const state = { starts: 0, stops: 0, aborts: 0 };
    class LocalRecognition extends EventTarget {
      lang = '';
      continuous = false;
      interimResults = false;
      onresult = null;
      onerror = null;
      onend = null;
      start() { state.starts += 1; }
      stop() { state.stops += 1; }
      abort() { state.aborts += 1; }
    }
    Object.defineProperty(LocalRecognition.prototype, 'processLocally', { configurable: true, value: true, writable: true });
    Object.assign(window, { SpeechRecognition: LocalRecognition, __speechState: state });
  });
  const desktop = await context.newPage();
  const phone = await context.newPage();
  await Promise.all([desktop.goto('/'), phone.goto('/')]);
  await pairPages(desktop, phone);
  await expect(phone.locator('#talk-button')).toBeEnabled();
  expect(await phone.evaluate(() => (window as unknown as { __speechState: { starts: number } }).__speechState.starts)).toBe(0);

  await phone.locator('#talk-button').focus();
  await phone.keyboard.down('Space');
  await expect(phone.locator('#talk-button')).toHaveClass(/is-listening/);
  expect(await phone.evaluate(() => (window as unknown as { __speechState: { starts: number } }).__speechState.starts)).toBe(1);
  await phone.keyboard.up('Space');

  await expect(phone.locator('#talk-button')).not.toHaveClass(/is-listening/);
  expect(await phone.evaluate(() => (window as unknown as { __speechState: { stops: number } }).__speechState.stops)).toBe(1);
  await context.close();
});

test('@claim:confirmation-feedback selected tone and haptic happen before transmission', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const feedback: string[] = [];
    class TestAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() {
        const oscillator = {
          frequency: { value: 0 },
          connect: (target: unknown) => target,
          start: () => feedback.push(`tone:${oscillator.frequency.value}`),
          stop: () => undefined,
          addEventListener: () => undefined,
        };
        return oscillator;
      }
      createGain() {
        return {
          gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined },
          connect: (target: unknown) => target,
        };
      }
      close() { return Promise.resolve(); }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (duration: number) => { feedback.push(`haptic:${duration}`); return true; } });
    const originalSend = RTCDataChannel.prototype.send;
    RTCDataChannel.prototype.send = function send(data) {
      feedback.push('send');
      return originalSend.call(this, data);
    };
    Object.assign(window, { __feedback: feedback });
  });
  const desktop = await context.newPage();
  const phone = await context.newPage();
  await Promise.all([desktop.goto('/'), phone.goto('/')]);
  await pairPages(desktop, phone);
  await phone.locator('#tone-choice').selectOption('warm');
  await phone.locator('#draft-text').fill('Feedback happens before this phrase leaves.');

  await phone.getByRole('button', { name: 'Confirm & send' }).click();

  await expect(desktop.locator('.transcript').first()).toContainText('Feedback happens before this phrase leaves.');
  expect(await phone.evaluate(() => (window as unknown as { __feedback: string[] }).__feedback)).toEqual(['tone:660', 'haptic:35', 'send']);
  await context.close();
});

test('@claim:pairing-memory reload clears pairing codes and the temporary connection', async ({ browser }) => {
  const context = await browser.newContext();
  const desktop = await context.newPage();
  const phone = await context.newPage();
  await Promise.all([desktop.goto('/'), phone.goto('/')]);
  await pairPages(desktop, phone);

  await Promise.all([desktop.reload(), phone.reload()]);
  await desktop.getByRole('button', { name: /This is my computer/ }).click();
  await phone.getByRole('button', { name: /This is my phone/ }).click();

  await expect(desktop.locator('#invite-code')).toHaveValue('');
  await expect(desktop.locator('#answer-code')).toHaveValue('');
  await expect(phone.locator('#phone-invite')).toHaveValue('');
  await expect(phone.locator('#phone-answer')).toHaveValue('');
  await expect(desktop.locator('#desktop-status')).toHaveText('Ready to create a private invitation');
  await expect(phone.locator('#phone-status')).toHaveText('Waiting for an invitation');
  await context.close();
});

test('a too-long confirmed draft is kept for editing and is never sent truncated', async ({ browser }) => {
  test.setTimeout(45_000);
  const context = await browser.newContext();
  const desktop = await context.newPage();
  const phone = await context.newPage();
  await Promise.all([desktop.goto('/'), phone.goto('/')]);

  await desktop.getByRole('button', { name: /This is my computer/ }).click();
  await desktop.getByRole('button', { name: 'Create invitation' }).click();
  await expect(desktop.locator('#invite-code')).not.toHaveValue('', { timeout: 15_000 });
  await phone.getByRole('button', { name: /This is my phone/ }).click();
  await phone.locator('#phone-invite').fill(await desktop.locator('#invite-code').inputValue());
  await phone.getByRole('button', { name: 'Create private answer' }).click();
  await expect(phone.locator('#phone-answer')).not.toHaveValue('', { timeout: 15_000 });
  await desktop.locator('#answer-code').fill(await phone.locator('#phone-answer').inputValue());
  await desktop.getByRole('button', { name: 'Connect phone' }).click();
  await expect(phone.locator('#dictation-workspace')).toBeVisible({ timeout: 15_000 });

  const tooLong = 'a'.repeat(10_000) + ' tail';
  await phone.locator('#draft-text').evaluate((field, value) => {
    (field as HTMLTextAreaElement).value = value as string;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }, tooLong);
  await phone.getByRole('button', { name: 'Confirm & send' }).click();
  await expect(phone.locator('#bridge-alert')).toContainText('Shorten it to 10,000 characters or fewer');
  await expect(phone.locator('#draft-text')).toHaveValue(tooLong);
  await expect(desktop.locator('.transcript')).toHaveCount(0);
  await context.close();
});

test('@claim:offline-reload app shell reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await expect(page.getByText(/Internet offline/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dictate softly');
});

test('legal and not-found pages are standalone, accessible, and responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} must not overflow`).toBe(true);
  }
});

test('phone navigation and legal links meet the 44px touch-target contract', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const selector of ['.brand', '.site-header nav a:visible', 'footer nav a']) {
    const targets = page.locator(selector);
    for (let index = 0; index < await targets.count(); index++) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.width, selector).toBeGreaterThanOrEqual(44);
      expect(box?.height, selector).toBeGreaterThanOrEqual(44);
    }
  }
});

test('390px layout remains readable with the root text size increased to 200%', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const selector of ['.hero-copy', 'h1', '.hero-actions', '.pricing-section', '.price-panel']) {
    const box = await page.locator(selector).boundingBox();
    expect(box?.x, selector).toBeGreaterThanOrEqual(0);
    expect((box?.x || 0) + (box?.width || 0), selector).toBeLessThanOrEqual(390);
  }
});

test('@claim:json-import transcript import validates files, skips duplicates, and persists restored history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /This is my computer/ }).click();
  const exportData = {
    product: 'Quiet Dictation Bridge',
    exportedAt: '2026-08-30T10:00:00.000Z',
    transcripts: [
      { id: 91, text: 'Restored without changing a word.', receivedAt: '2026-08-30T09:30:00.000Z' },
      { id: 92, text: 'A second restored phrase.', receivedAt: '2026-08-30T09:31:00.000Z', session: 'Morning notes' },
    ],
  };

  await page.locator('#import-history').setInputFiles({
    name: 'quiet-bridge-export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(exportData)),
  });
  await expect(page.locator('#history-status')).toHaveText('Imported 2 phrases.');
  await expect(page.locator('.transcript')).toHaveCount(2);
  await expect(page.locator('.transcript').first()).toContainText('A second restored phrase.');

  await page.locator('#import-history').setInputFiles({
    name: 'quiet-bridge-export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(exportData)),
  });
  await expect(page.locator('#history-status')).toHaveText('Imported 0 phrases. Skipped 2 duplicates.');
  await expect(page.locator('.transcript')).toHaveCount(2);

  await page.locator('#import-history').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"product":"another tool","transcripts":[]}'),
  });
  await expect(page.locator('#bridge-alert')).toContainText('not a Quiet Dictation Bridge export');
  await expect(page.locator('.transcript')).toHaveCount(2);

  await page.reload();
  await page.getByRole('button', { name: /This is my computer/ }).click();
  await expect(page.locator('.transcript')).toHaveCount(2);
  await expect(page.locator('.transcript').first()).toContainText('A second restored phrase.');
});

test('@claim:json-export transcript export downloads every visible sample phrase', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('.transcript')).toHaveCount(3);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  expect(exported.product).toBe('Quiet Dictation Bridge');
  expect(exported.transcripts).toHaveLength(3);
  expect(exported.transcripts.map((item: { text: string }) => item.text)).toContain('Send the revised agenda after lunch.');
});

test('@claim:demo-isolation sample mode resets separately from real history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /This is my computer/ }).click();
  await page.locator('#import-history').setInputFiles({
    name: 'real-history.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      product: 'Quiet Dictation Bridge',
      transcripts: [{ text: 'This belongs to real history.', receivedAt: '2026-08-30T10:00:00.000Z' }],
    })),
  });
  await expect(page.locator('.transcript')).toHaveCount(1);

  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Quiet Dictation Bridge');
  await expect(page.locator('#demo-banner')).toContainText('nothing is saved to your real history');
  await expect(page.locator('.transcript')).toHaveCount(3);
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Clear local history' }).click();
  await expect(page.locator('.transcript')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.transcript')).toHaveCount(3);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('button', { name: /This is my computer/ }).click();
  await expect(page.locator('.transcript')).toHaveCount(1);
  await expect(page.locator('.transcript').first()).toContainText('This belongs to real history.');
});
