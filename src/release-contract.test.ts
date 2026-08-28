import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_BILLING_API, billingApiBase, productCheckoutUrl, registeredCheckoutUrl } from './billing';
import { chooseSpeechPath } from './speech';

const root = resolve(import.meta.dirname, '..');
const readProjectFile = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('release regression contracts', () => {
  it('uses the live Sociobot API unless a preview build explicitly overrides it', () => {
    expect(billingApiBase()).toBe(PRODUCTION_BILLING_API);
    expect(billingApiBase('https://pilot-api.sociobot.in/')).toBe('https://pilot-api.sociobot.in');
  });

  it('exposes checkout only when the public catalog enables this exact product', () => {
    const expected = productCheckoutUrl(PRODUCTION_BILLING_API);
    expect(registeredCheckoutUrl({ data: [] }, PRODUCTION_BILLING_API)).toBeNull();
    expect(registeredCheckoutUrl({ data: [{ slug: 'another-product', checkout_url: expected }] }, PRODUCTION_BILLING_API)).toBeNull();
    expect(registeredCheckoutUrl({ data: [{ slug: 'quiet-dictation-bridge', checkout_url: 'https://example.com/checkout' }] }, PRODUCTION_BILLING_API)).toBeNull();
    expect(registeredCheckoutUrl({ data: [{ slug: 'quiet-dictation-bridge', checkout_url: expected }] }, PRODUCTION_BILLING_API)).toBe(expected);
  });

  it('prefers Android’s native offline recognizer when running in the installed app', () => {
    expect(chooseSpeechPath(true, true)).toBe('android-offline');
    expect(chooseSpeechPath(false, true)).toBe('web-offline');
    expect(chooseSpeechPath(false, false)).toBe('unavailable');
  });

  it('keeps the Android speech bridge native, permission-gated, and offline-only', () => {
    const plugin = readProjectFile('android/app/src/main/java/in/sociobot/quietdictationbridge/LocalSpeechPlugin.java');
    const activity = readProjectFile('android/app/src/main/java/in/sociobot/quietdictationbridge/MainActivity.java');
    expect(plugin).toContain('SpeechRecognizer');
    expect(plugin).toContain('createOnDeviceSpeechRecognizer');
    expect(plugin).toContain('RecognizerIntent.EXTRA_PREFER_OFFLINE, true');
    expect(plugin).toContain('Manifest.permission.RECORD_AUDIO');
    expect(plugin).toContain('requestPermissionForAlias');
    expect(activity).toContain('registerPlugin(LocalSpeechPlugin.class)');
  });

  it('ships restrictive static-host headers and immutable asset caching', () => {
    const headers = readProjectFile('public/_headers');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('Permissions-Policy: microphone=(self)');
    expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
    expect(headers).toContain('Content-Type: application/manifest+json; charset=utf-8');
    expect(headers).toContain('/sw.js\n  Cache-Control: no-cache, must-revalidate');
    const swa = readProjectFile('public/staticwebapp.config.json');
    expect(swa).toContain('Content-Security-Policy');
    expect(swa).toContain('Permissions-Policy');
    expect(swa).toContain('".webmanifest": "application/manifest+json"');
    expect(swa).toContain('".apk": "application/vnd.android.package-archive"');
    expect(swa).toContain('".sha256": "text/plain"');
    expect(swa).toContain('max-age=31536000, immutable');
    expect(swa).toContain('"route": "/download/*"');
    expect(swa).toContain('wasm,apk,sha256');
  });

  it('keeps the installable Android artifact and its exact checksum in static source', () => {
    const apkPath = resolve(root, 'public/download/quiet-dictation-bridge-debug.apk');
    const checksumPath = resolve(root, 'public/download/quiet-dictation-bridge-debug.apk.sha256');
    const apk = readFileSync(apkPath);
    const checksum = readFileSync(checksumPath, 'utf8').trim();

    expect(statSync(apkPath).size).toBeGreaterThan(1_000_000);
    expect(apk.subarray(0, 4).toString('binary')).toBe('PK\x03\x04');
    expect(checksum).toBe(`${createHash('sha256').update(apk).digest('hex')}  quiet-dictation-bridge-debug.apk`);
  });

  it('ships a versioned offline shell and an explicit user-controlled update path', () => {
    const serviceWorker = readProjectFile('public/sw.js');
    const manifest = readProjectFile('public/manifest.webmanifest');
    const client = readProjectFile('src/main.ts');

    expect(serviceWorker).toContain("const VERSION = 'quiet-bridge-v3'");
    expect(serviceWorker).toContain('await self.clients.claim()');
    expect(serviceWorker).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(client).toContain("postMessage({ type: 'SKIP_WAITING' })");
    expect(client).toContain("show('#update-toast', true)");
    expect(manifest).toContain('"start_url": "/?v=3&source=pwa"');
  });
});
