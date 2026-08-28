import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_BILLING_API, billingApiBase } from './billing';
import { chooseSpeechPath } from './speech';

const root = resolve(import.meta.dirname, '..');
const readProjectFile = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('release regression contracts', () => {
  it('uses the live Sociobot API unless a preview build explicitly overrides it', () => {
    expect(billingApiBase()).toBe(PRODUCTION_BILLING_API);
    expect(billingApiBase('https://pilot-api.sociobot.in/')).toBe('https://pilot-api.sociobot.in');
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
    expect(swa).toContain('max-age=31536000, immutable');
    expect(swa).toContain('"route": "/download/*"');
  });
});
