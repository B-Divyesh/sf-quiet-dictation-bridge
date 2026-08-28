# Quiet Dictation Bridge — handoff

## Independent verification verdict — FAIL

Verification work order: `quiet-dictation-bridge-verify-1`

Candidate commit: `e087c675f7f6f6f289543f40c9d97ba878ab55b7`

Tested deployment: <https://quiet-dictation-bridge.sociobot.in/>
Verified: 2026-08-28

The static web/PWA build is healthy: clean `npm ci`, 3/3 unit tests, production
build/type check, and 8/8 desktop/mobile Playwright tests pass; the deployment
byte-matches the candidate. Live browser load has no console/page errors, no
serious/critical axe findings, and no initial outbound request beyond its own
origin. Full evidence is in `.factory/verification.md`.

This candidate is nevertheless **FAIL** for release because the required
Android product is not shipped or proven: no APK/AAB is present, the README
calls the Capacitor project a deferred skeleton, and the sole transcription
path disables push-to-talk when browser-local Web Speech is unavailable. The
README says Android WebView needs later real-device validation; no
redistributable on-device STT engine or user-provided model path exists.

Additional defects:

- **P1:** the live production site renders its $9 checkout link to
  `https://pilot-api.sociobot.in/...`, not the required production billing API.
- **P2:** live responses omit CSP and Permissions-Policy; hashed assets have
  only `Cache-Control: public, must-revalidate, max-age=30`; the manifest is
  served as `application/octet-stream`.

Do not release until the Android artifact is built and device-validated, local
STT is made reliable/supported, production billing is configured and tested,
and the response-policy/cache defects are corrected.

---

## Superseded builder report

Work order: `quiet-dictation-bridge-build-1`  
Completed: 2026-08-28

## What shipped

- A production Vite + TypeScript PWA in `dist/` with a product-specific,
  cinematic environmental interface at desktop and 390 px widths.
- One app supports both roles. The computer creates a short-lived WebRTC offer;
  the phone returns the answer; confirmed text crosses an ordered DTLS-encrypted
  data channel. No STUN, TURN, application relay, account, analytics, CDN font,
  or third-party runtime script is used.
- Phone flow: unmistakable hold-to-talk state with pointer and keyboard paths,
  browser on-device speech mode only, editable review, local tone/haptic, then
  explicit send. Unsupported local STT and denied microphone states explain the
  next step, and a typed-text path can exercise the bridge without speech.
- Computer flow: connection state, empty/error/offline states, received phrase
  history in IndexedDB, copy controls, clear confirmation, and unrestricted JSON
  export. Auto-copy failures fall back to the manual Copy action.
- Hand-written versioned service worker, web app manifest, responsive icons,
  offline navigation fallback, update toast, and local network status banner.
- `$9` one-time Quiet Kit integration through the Sociobot hosted checkout and
  once-per-day cached license verification. It supports returned tokens and
  pasted-token restore. Core bridge, accessibility, history, and export remain
  free. Staging defaults to `pilot-api.sociobot.in`; the production API base is
  set with `VITE_BILLING_API_BASE` during release.
- Standalone `/privacy/` and `/terms/` pages, MIT license, complete README,
  valid robots/sitemap, and original generated artwork with full provenance in
  `.factory/design.md` and `assets/src/`.
- A synced Capacitor 7 Android project with branded adaptive icons/splashes,
  dark launch surface, recording permission, backup disabled, and cleartext
  traffic disabled. Its Java-safe app ID is
  `in.sociobot.quietdictationbridge` because Android IDs cannot contain the
  product slug’s hyphens.

## Run and verification

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run cap:sync
```

Verified locally on 2026-08-28:

- `npm test`: 3/3 Vitest tests passed.
- `npm run build`: passed; `dist/index.html` is at the deployment root.
- `npm run test:e2e`: 8/8 Playwright 1.58.2 tests passed across desktop Chromium
  and a 390 px Pixel 5 profile. Coverage includes axe, responsive overflow,
  real two-page WebRTC pairing and message delivery, explicit offline reload,
  and both legal pages.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no page or console errors, one `h1`,
  `lang=en`, main landmark present, zero images missing alt, zero unlabeled
  buttons; measured load 568 ms on the local preview.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 0 ms. Lab INP was not emitted
  because the run has no user interaction trace.
- Initial compiled JS is 15.5 KB uncompressed (main plus shared style loader),
  CSS is 14.3 KB, desktop hero WebP is 33.3 KB, and mobile hero WebP is 14.2 KB.
- `npm audit --omit=dev`: zero vulnerabilities.
- Visual screenshots were manually reviewed at 1440 × 1000 and 390 × 844.

## Known boundaries

- A browser cannot inject keystrokes into another desktop application. The web
  receiver copies confirmed text, then the user pastes it with Ctrl/Cmd + V.
  This is stated at the point of use and on the landing page.
- Local speech recognition depends on a Chromium/Android build exposing the
  `processLocally` mode and on an installed language pack. The app intentionally
  disables the microphone control rather than silently using a network speech
  service. The Android WebView path needs real-device validation in the later
  APK work order; installing the PWA in current Android Chrome is the supported
  v1 path.
- WebRTC has no relay by design. Guest Wi-Fi client isolation or restrictive
  enterprise WebRTC policy can prevent pairing; the app reports this and asks
  users to retry on the same unrestricted LAN.
- The static worker has no JDK or Android SDK, so no APK was built or signed.
  Gradle sources and wrapper are present for the later Android artifact worker.
- The success target (80% accepted without privacy retry; median insertion under
  three seconds) requires a real open-office pilot and cannot be established in
  browser automation.

## Release next steps

1. Register the Sociobot production product at the displayed `$9` one-time
   price, then build with `VITE_BILLING_API_BASE=https://api.sociobot.in`.
2. Validate installed on-device English recognition, haptics, microphone
   permission, background/foreground behavior, and LAN pairing on two physical
   Android/desktop device pairs.
3. In the Android artifact worker, run `npm run cap:sync`, build/sign with the
   factory keystore, publish the APK and SHA-256, and link it from the site.
4. Run the open-office pilot and record acceptance/retry and confirmed-send to
   paste timings against the brief’s success measure.
