# Quiet Dictation Bridge — repair handoff

Work order: `quiet-dictation-bridge-repair-1`
Base verified failure: `e087c675f7f6f6f289543f40c9d97ba878ab55b7`

## Repairs

- **P0 Android delivery and local dictation:** added a registered Capacitor
  `LocalSpeech` Android plugin. On Android 12+ it uses
  `SpeechRecognizer.createOnDeviceSpeechRecognizer`, checks that the
  on-device engine is installed, requests `RECORD_AUDIO` at the moment of use,
  streams partial/final results to the review field, and never selects a cloud
  recognizer. The existing browser `processLocally` path is unchanged. Missing
  language packs and denied permission get an actionable message and the typed
  review path remains available.
- Built a debug Android artifact and uploaded it to the internal
  `factory-artifacts/quiet-dictation-bridge/` location. The static landing page
  links to the deployed APK and its checksum at `/download/`.
- **P1 billing:** production now defaults to `https://api.sociobot.in`; only an
  explicit `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in` makes a preview
  build use the test host. Regression E2E asserts the rendered checkout URL.
- **P2 response policy/cache:** added Azure Static Web Apps configuration with
  a restrictive CSP, microphone-only Permissions-Policy, nosniff and referrer
  policies; immutable one-year caching for hashed assets/art/downloads; short
  revalidation for the service worker and manifest; and a manifest media type.
  A portable `_headers` equivalent ships too. The service-worker/manifest cache
  version is now `v2` so installed clients receive the repair.

## Artifact

- Debug APK: `quiet-dictation-bridge-debug.apk`
- Size: 10,769,539 bytes
- SHA-256: `7d7ea254b884ac3b6dec6b40916783e10fa38bfca59684555118b3cdc4450c07`
- Reproduce/package: `npm run package:android` (requires Android SDK 35 and
  JDK 21); it stages `dist/download/quiet-dictation-bridge-debug.apk` and its
  standard SHA-256 sidecar for static deployment.

## Verification

All commands below were run in this clean worker on 2026-08-28.

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run package:android
cd android && ./gradlew --no-daemon test assembleDebug
npm audit --omit=dev
```

- Clean install: 149 packages installed; audit: **0 vulnerabilities**.
- Unit/regression: **7/7** Vitest tests passed. The new release-contract tests
  assert the production billing default/preview override, Android force-local
  recognizer and runtime permission registration, and every static-host policy
  requirement.
- Production type/build: passed. Initial JS is 24.12 KB uncompressed; CSS is
  14.69 KB; both remain below the static budgets.
- Browser integration: **10/10** Playwright 1.58.2 tests passed on desktop
  Chromium and Pixel 5 (390 px). This includes axe serious/critical checks,
  keyboard activation, live billing and APK/checksum links, two-page encrypted
  WebRTC pairing/send, offline reload after service-worker install, responsive
  overflow, and legal pages.
- Android: Capacitor sync, Android unit tests, and debug APK assembly passed
  with compile/target SDK 35 and JDK 21. The final package was copied into
  `dist/download/` and its displayed checksum matches the APK.
- Privacy: no analytics/CDN/STUN/TURN/relay was added. The native path invokes
  Android’s explicit on-device API; CSP permits only the product origin and
  Sociobot billing hosts for browser connections.

## Deployment / remaining validation

The static deployment and live response-policy/identity evidence will be
recorded after this repair commit is pushed. No physical Android device is
attached to this disposable worker, so microphone permission, installed
language-pack recognition, haptic/tone, and LAN pairing must still be smoke
tested on an Android 12+ handset before a signed release is distributed. The
APK is an unsigned debug artifact; release signing remains a factory-keystore
operation and no key is stored in this repository.
