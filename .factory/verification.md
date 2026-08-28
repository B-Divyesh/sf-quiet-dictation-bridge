# Quiet Dictation Bridge — independent verification

**Verdict: FAIL**

**Work order:** `quiet-dictation-bridge-verify-1`

**Candidate commit:** `e087c675f7f6f6f289543f40c9d97ba878ab55b7`

**Verified URL:** <https://quiet-dictation-bridge.sociobot.in/>
**Date:** 2026-08-28

## Scope and method

Verification was run from a new detached, clean Git worktree at the candidate
commit (`/tmp/quiet-dictation-bridge-verify`). Product source was not changed.
The report and handoff are the only changes in the repository checkout.

The acceptance contract was the researched brief, `AGENTS.md`, and the stated
Android/PWA/accessibility/performance requirements. The live deployment was
tested independently and compared byte-for-byte to the production build.

## Passed evidence

| Check | Result / evidence |
| --- | --- |
| Clean install | `npm ci` completed: 149 packages installed; `npm audit` reported 0 vulnerabilities. |
| Unit tests | `npm test` passed: 3/3 Vitest tests. |
| Type check and exact web production build | `npm run build` passed (`tsc --noEmit && vite build`). `dist/` contains the three HTML entry points, PWA assets, and service worker. |
| Bundle budgets | Initial app JS is 14,828 B and CSS is 14,342 B uncompressed; the total initial JS is well below the 200 KB limit. Desktop/mobile hero WebP files are 33,300 B / 14,210 B. |
| Browser end-to-end | `npm run test:e2e` passed: 8/8 Playwright 1.58.2 tests on desktop Chromium and Pixel 5 (390-ish CSS-pixel profile). It covers actual two-page WebRTC offer/answer pairing, typed review/send receipt, offline reload after first visit, responsive overflow, and legal pages. |
| Independent invalid/recovery smoke | On a fresh production-preview page, Tab first focused the visible skip link. An invalid phone invitation produced: “That is not a valid offer code. Copy the entire code and try again.” Empty-answer validation is covered in the app and E2E normal pairing succeeds. |
| Accessibility | Existing Playwright axe checks passed on home (desktop/mobile), privacy, and terms. A separate axe scan against the live home page found zero serious/critical violations. Live has one `h1`, one `main`, title, `lang=en`, visible skip link/focus styling, and no 390px horizontal overflow (`393px` scroll width at `393px` viewport). |
| Browser errors / privacy | Independent live Chromium load had no console errors or page errors. Its initial requests were only to `https://quiet-dictation-bridge.sociobot.in`; source inspection found no analytics, CDN font, STUN/TURN, relay, or third-party runtime script. Transcript storage is local IndexedDB and license storage is localStorage as disclosed. |
| Reduced motion and PWA offline | CSS contains a `prefers-reduced-motion: reduce` override that reduces animations/transitions to an instant state. The passing E2E suite registered the service worker, set the context offline, reloaded, and found the application shell. Source review confirms versioned caches, `skipWaiting`, `clientsClaim`, and an update toast path. |
| Live/candidate identity | The live `/`, `/privacy/`, `/terms/`, manifest, service worker, offline page, icons, both hero images, and all four referenced compiled JS/CSS files byte-match this candidate build. Live home returned HTTP 200 with the expected title and no console errors. |
| Documentation / legal | README, MIT LICENSE, `/privacy/`, and `/terms/` are present and the legal pages pass their E2E/axe checks. |

## Android build evidence

`npm run cap:sync` succeeded from the clean worktree, including the exact
production build and copying it into the Capacitor Android project. The
available `./gradlew test assembleDebug` check could not start because this
verification container has neither `JAVA_HOME` nor a `java` executable. This
is an environment limitation, not counted as a Gradle source failure.

There is no committed `.apk` or `.aab` in the candidate. More importantly,
the README explicitly calls the checked-in Android project a “skeleton” and
says APK production is deferred. This is incompatible with the product's
artifact class and the brief's smallest useful product: an Android phone app
plus desktop receiver.

## Defects

### P0 — Android deliverable and core native dictation are not verified or shipped

No Android APK/AAB is present, and the project's own README says the Android
project is a skeleton whose APK production and signing are deferred. The brief
requires an Android phone app for the close-mic push-to-talk job; a browser
PWA is not a substitute for a shipped Android artifact under this work order.

Additionally, `src/main.ts` implements speech only through
`SpeechRecognition`/`webkitSpeechRecognition` with `processLocally`. When
that API is missing, it disables the hold-to-talk microphone control and tells
the person to type. The README separately acknowledges that the Android
WebView path needs real-device validation. No redistributable on-device STT
engine or user-supplied model path is supplied. Thus the required Android
dictation path is neither delivered nor proven to work end to end. This is a
release blocker, not a deployment-only transient.

**Required resolution:** build and provide the debug/release Android artifact,
validate microphone permission, on-device transcription, haptic/tone, pairing,
and delivery on physical Android plus desktop devices; provide an actual
on-device STT engine or supported user model path when Web Speech local mode is
unavailable.

### P1 — Live production checkout points to the staging billing host

The exact live compiled JS and the rendered `#buy-link` use:

`https://pilot-api.sociobot.in/api/v1/products/quiet-dictation-bridge/checkout`

The production URL must use the production Sociobot billing API. As deployed,
the advertised $9 one-time unlock is wired to the pilot host, contrary to the
paid-unlock release requirement and README release configuration.

**Required resolution:** make the production build with
`VITE_BILLING_API_BASE=https://api.sociobot.in`, deploy it, and run a hosted
checkout/return/verification smoke test with the production product.

### P2 — Deployment response policy and asset caching are below the stated web quality bar

All tested live HTML documents omit both `Content-Security-Policy` and
`Permissions-Policy`. The static app handles sensitive microphone and local
text data, so a restrictive policy should be deployed (at least script/style/
connect/media origins and an explicit microphone policy).

The deployment gives hashed JS, CSS, images, and the service worker only:

`Cache-Control: public, must-revalidate, max-age=30`

This does not meet the stated long-lived immutable caching expectation for
hashed assets and adds avoidable repeat-load traffic. `manifest.webmanifest`
is also served as `application/octet-stream` rather than a manifest/JSON media
type.

**Required resolution:** add a CSP and Permissions-Policy at the static host;
serve hashed assets with a long immutable lifetime, service worker/HTML with
short revalidation, and the manifest as `application/manifest+json` (or
`application/json`).

## Release recommendation

Do **not** accept or release this candidate as the Android product. The web
PWA portion is healthy and the live deployment exactly reflects the candidate,
but the P0 Android delivery gap and P1 production billing misconfiguration
prevent it from satisfying the agreed product contract.
