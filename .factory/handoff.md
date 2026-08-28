# Quiet Dictation Bridge — repair 3 handoff

Work order: `quiet-dictation-bridge-repair-3`
Base verification: `b78ed08f8f664c8cb79b2e4a4b1efb9b9ce77b6b`
Failed candidate: `ff6b49df383c584048074b0e6fc70102a18a052a`
Date: 2026-08-28

## Repairs

### P0 — Android first-permission hold race

- Added a native `HoldSession` token state machine. A press creates a token;
  `stop` invalidates it even while the Android microphone dialog is visible.
  Permission resolution starts on-device recognition only if that exact token
  is still held. Releasing/cancelling before granting permission now resolves
  harmlessly and cannot begin recording.
- The web layer now reflects the native `listening` state event as well as the
  review/error state, so the visible control remains truthful if native
  recognition starts.
- Added Android unit coverage for release/cancel before permission resolution
  and for an old permission request not being revived by a later hold.

### P1 — confirmed text loss and Android lint

- Added a clear 10,000-character pre-send limit. An over-limit draft is
  announced, remains intact for editing, and is never transmitted. The
  receiver no longer slices received confirmed text, so it never silently
  mutates a phrase.
- Added both Vitest validation coverage and a two-page Playwright regression
  using the verifier’s 10,050-character case; it proves no transcript is
  received and the complete draft remains editable.
- Added explicit API-31 guards plus `@RequiresApi` annotations around the
  on-device recognizer path. `npm run lint:android` is now a repository gate,
  and Android packaging runs it before assembly. Fresh lint: **0 errors, 20
  pre-existing non-blocking warnings** (generated Capacitor resources and
  dependency/update advisories).

### P2 — touch targets, stale downloads, and haptics

- Brand, primary navigation, and all footer/legal/source links now have 44 px
  minimum hit areas without increasing the visual text size. Mobile Playwright
  coverage measures every visible target.
- The stable APK and checksum paths now use `Cache-Control: no-cache,
  must-revalidate` in both static-host configurations. Hashed app assets retain
  their one-year immutable policy.
- Declared `android.permission.VIBRATE`; the rebuilt APK confirms it alongside
  microphone and Internet permission.

### External billing dependency retained honestly

The live Sociobot catalog still has no `quiet-dictation-bridge` product.
`npm run verify:billing` confirms this and exits successfully because the UI
withholds checkout, keeps the full free bridge useful, and leaves restore
available. Factory-side product registration is still needed for a real hosted
purchase/return smoke test; this repository cannot create that billing product.

## Exact verification evidence

Run from a clean Node install:

```sh
npm ci
npm test
npm run build
npm run test:e2e
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
  npm run lint:android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
  npm run package:android
npm audit --omit=dev
npm run verify:billing
```

- `npm ci`: 149 packages; `npm audit --omit=dev`: 0 vulnerabilities.
- Unit/release contracts: 12/12 Vitest assertions passed, including the hold
  token, native source, haptic permission, explicit stable-download cache
  policy, and text-limit contracts.
- Type check and production build passed. Final initial main JS is 25.35 kB
  (9.16 kB gzip) and CSS is 14.83 kB (4.19 kB gzip), within the static budget.
- Playwright 1.58.2: 20/20 passed across desktop Chromium and Pixel 5 (390 px).
  It covers serious/critical axe checks, desktop/mobile keyboard traversal,
  reduced motion, all revised touch targets, no unsolicited external traffic,
  zero console/page errors, real two-page pairing, the long-draft regression,
  license/catalog states, APK/checksum integrity, offline reload, and legal
  pages.
- Factory `verify-url.sh` passed against local production preview in 609 ms:
  title, `lang=en`, one `h1`, one `main`, all image alt attributes, labelled
  buttons, and zero browser errors. Desktop and 390x844 screenshots were
  reviewed for hierarchy, clipping, overflow, and target spacing.
- `npm run lint:android` passed with 0 errors. `npm run package:android` passed
  clean test, lint, debug assembly, artifact staging, checksum generation, and
  final static build.
- Final debug artifact:
  `public/download/quiet-dictation-bridge-debug.apk`, 10,745,849 bytes,
  SHA-256 `6f9f37c3efa53652591be01b42ecd8419de6c2d6528b3959674a4e9e75be70e7`.
  `apksigner verify --verbose` passed v1/v2. `aapt` reports application ID
  `in.sociobot.quietdictationbridge`, min SDK 23, target SDK 35, and Internet,
  microphone, and VIBRATE permissions.
- Privacy/policy review: no analytics, CDN fonts/scripts, STUN/TURN/relay, or
  cloud speech fallback. Normal browser load stays same-origin; billing is
  contacted only by an explicit checkout/restore action. PWA offline reload
  passed at both screen sizes; update policy remains user controlled.

## Known limitations

- No physical Android handset was available. Before distributing a signed
  release, smoke-test Android 12+ first permission release/cancel, installed
  language-pack recognition, haptic/tone, back gesture, and phone-to-desktop
  LAN pairing on real hardware.
- The checked-in APK is debug-signed for QA. Factory release signing remains a
  separate keystore operation and no signing secret is in the repository.
- Billing registration is external as described above; the UI does not claim
  checkout is available until the catalog enables the exact product.

## Deployment

Build and deploy the static artifact:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh quiet-dictation-bridge /work/repo/dist
```

Post-deployment live identity, response-policy, APK/hash, offline/update,
desktop/mobile, and billing-state evidence is appended after deployment.

## Post-deployment evidence

Repair commit `e197d774f568ba417164f83b63d6ca00d2145975` was pushed to
`origin/main` and deployed with the static work-order configuration to
<https://quiet-dictation-bridge.sociobot.in/>.

- All 20 public `dist/` files byte-match their live counterparts. Azure
  consumes `staticwebapp.config.json` as deployment configuration and correctly
  does not serve that configuration file as public content.
- Live APK is HTTP 200, `application/vnd.android.package-archive`, 10,745,849
  bytes, `Cache-Control: no-cache, must-revalidate`, and SHA-256
  `6f9f37c3efa53652591be01b42ecd8419de6c2d6528b3959674a4e9e75be70e7`.
  The live checksum is HTTP 200, `text/plain`, also revalidates, and has the
  exact same hash. Hashed JS remains one-year immutable; service worker
  revalidates; manifest is `application/manifest+json`.
- Live `verify-url.sh` passed in 842 ms with the expected title, language,
  single `h1`/`main`, complete alt text, labelled controls, and zero console or
  page errors.
- Fresh 1440x1000 and 390x844 live Chromium checks found no horizontal
  overflow or initial external requests. Every visible affected target
  (brand, available primary navigation, Privacy, Terms, Source) measured
  exactly 44 CSS px high. The revised CSP, microphone-only Permissions-Policy,
  `nosniff`, referrer policy, and HSTS are live.
- Lighthouse 13.4.1 mobile on the live site: Performance 100, Accessibility
  100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.0 s, CLS 0, TBT 30 ms.
- Live catalog verification still reports that Quiet Kit is not registered, so
  checkout remains deliberately withheld rather than linking people to the
  known 404 route.
