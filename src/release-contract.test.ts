import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chooseSpeechPath } from './speech';

const root = resolve(import.meta.dirname, '..');
const readProjectFile = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('release regression contracts', () => {
  it('does not advertise the unavailable paid offer or request a license', () => {
    const page = readProjectFile('index.html');
    expect(page).not.toContain('$9');
    expect(page).not.toContain('id="buy-link"');
    expect(page).not.toContain('id="license-token"');
    expect(page).toContain('<option value="warm">Warm chime</option>');
  });

  it('prefers Android’s native offline recognizer when running in the installed app', () => {
    expect(chooseSpeechPath(true, true)).toBe('android-offline');
    expect(chooseSpeechPath(false, true)).toBe('web-offline');
    expect(chooseSpeechPath(false, false)).toBe('unavailable');
  });

  it('@claim:on-device-speech keeps the Android speech bridge native, permission-gated, and offline-only', () => {
    const plugin = readProjectFile('android/app/src/main/java/in/sociobot/quietdictationbridge/LocalSpeechPlugin.java');
    const activity = readProjectFile('android/app/src/main/java/in/sociobot/quietdictationbridge/MainActivity.java');
    expect(plugin).toContain('SpeechRecognizer');
    expect(plugin).toContain('createOnDeviceSpeechRecognizer');
    expect(plugin).toContain('RecognizerIntent.EXTRA_PREFER_OFFLINE, true');
    expect(plugin).toContain('Manifest.permission.RECORD_AUDIO');
    expect(plugin).toContain('requestPermissionForAlias');
    expect(plugin).toContain('private final HoldSession holdSession');
    expect(plugin).toContain('if (!holdSession.isActive(holdToken))');
    expect(plugin).toContain('@RequiresApi(Build.VERSION_CODES.S)');
    expect(activity).toContain('registerPlugin(LocalSpeechPlugin.class)');
    expect(readProjectFile('android/app/src/main/AndroidManifest.xml')).toContain('android.permission.VIBRATE');
  });

  it('ships restrictive static-host headers and immutable asset caching', () => {
    const headers = readProjectFile('public/_headers');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('Permissions-Policy: microphone=(self)');
    expect(headers).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable');
    expect(headers).toContain('/download/*\n  Cache-Control: no-cache, must-revalidate');
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
    expect(swa).toContain('"Cache-Control": "no-cache, must-revalidate"');
    expect(swa).toContain('"responseOverrides"');
    expect(swa).toContain('"rewrite": "/404.html"');
    expect(swa).not.toContain('"navigationFallback"');
  });

  it('ships a real styled not-found page', () => {
    const page = readProjectFile('404.html');
    expect(page).toContain('<title>Not found — Quiet Dictation Bridge</title>');
    expect(page).toContain('<main id="main"');
    expect(page.match(/<h1[ >]/g)).toHaveLength(1);
    expect(page).toContain('href="/"');
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

    expect(serviceWorker).toContain("const VERSION = 'quiet-bridge-v4'");
    expect(serviceWorker).toContain('await self.clients.claim()');
    expect(serviceWorker).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(client).toContain("postMessage({ type: 'SKIP_WAITING' })");
    expect(client).toContain("show('#update-toast', true)");
    expect(manifest).toContain('"start_url": "/?v=4&source=pwa"');
  });
});
