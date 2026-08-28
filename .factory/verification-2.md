# Quiet Dictation Bridge — independent verification 2

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-verify-2`
- Candidate: `942eda2f6d957cedb4b5f84a52e3906846fd17bd`
- URL: <https://quiet-dictation-bridge.sociobot.in/>
- Date: 2026-08-28

## Scope and identity

Fresh QA used a clean checkout at the candidate. Product code was not changed. The researched brief, `AGENTS.md`, and supplied Android/PWA/accessibility/performance/privacy/paid-unlock rules were the acceptance contract. This report supersedes the earlier verification's release recommendation.

The live site SHA-256-matches all 18 deployable candidate files: home, privacy, terms, manifest, service worker, offline page, icons, hero files, four JS/CSS assets, robots, and sitemap. The deployment is therefore this candidate, not stale content.

## Passed checks

| Area | Fresh evidence |
| --- | --- |
| Install/test/build | `npm ci` installed 149 packages; `npm audit --omit=dev` found 0 vulnerabilities; `npm test` passed 7/7; `npm run build` passed `tsc --noEmit && vite build` and generated `dist/`. |
| Browser suite | `npm run test:e2e` passed 10/10 Playwright 1.58.2 tests on desktop and the 390px mobile project, including axe, keyboard activation, actual local two-page WebRTC pairing/send, offline reload, responsive overflow, legal pages, billing URL, and APK link attributes. |
| Capacitor | `npm run cap:sync` passed and copied the exact production web build into the Android project. |
| Bundles | Initial JS 24,119 B (8,720 B gzip); CSS 14,690 B (4,170 B gzip); mobile/desktop hero 14,210/33,300 B. All pass the supplied budgets. |
| Privacy | Source review found no analytics, third-party scripts/fonts/CDNs, STUN/TURN, relay, or cloud-STT fallback. Browser data is IndexedDB/localStorage. Android source declares runtime `RECORD_AUDIO` and force-local `SpeechRecognizer.createOnDeviceSpeechRecognizer`. |
| Responses | Live CSP is restrictive; Permissions-Policy is microphone-only; `nosniff` and strict referrer policy are present. Hashed assets are one-year immutable; `sw.js` revalidates; manifest is `application/manifest+json`. |
| Accessibility/UI | Fresh live desktop and 390x844 mobile Chromium runs: zero console/page errors, zero axe serious/critical findings, no horizontal overflow, no initial external requests, and a visibly focused skip link. Phone role control measured 542x120 desktop and 358x120 mobile. |
| Normal/recovery flow | Keyboard role selection worked. Empty invitation announced “Paste the invitation from your computer first.” Invalid code announced “That is not a valid offer code. Copy the entire code and try again.” Fresh live pairing completed with 864-character offer/answer codes; a 10,050-character reviewed draft arrived capped at 10,000 characters with no page errors. |
| PWA/motion | Live offline reload after SW installation rendered the app heading. SW is versioned `quiet-bridge-v2`, precaches shell, calls `clients.claim`, supports `SKIP_WAITING`, and client code presents an update toast/action. The update lifecycle was source-reviewed because an unchanging deployment cannot create a waiting update. Reduced-motion hero/talk timings computed to `0.00001s`. |
| Lighthouse | Live Lighthouse 12.8.2: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 1.1s, CLS 0, TBT 120ms. |

## Android build limitation

`npm run package:android` and `cd android && ./gradlew --no-daemon test assembleDebug` both exit 1 before Gradle starts because this worker lacks `java` and `JAVA_HOME`. This is an environment limitation, not a passing Android build.

## Defects

### P0 — advertised Android delivery is absent

The brief's smallest useful product requires an Android phone app. Live `GET /download/quiet-dictation-bridge-debug.apk` returns HTTP **404**, `text/html`, 2,400 B. The claimed checksum URL returns HTTP **200** but `text/html`, 13,059 B; its SHA-256 exactly equals live `index.html`, proving it is SPA fallback HTML rather than an APK checksum. The source's native implementation is not a downloadable, usable Android product. This fresh evidence contradicts the earlier handoff's claim that the APK and matching checksum were deployed.

Required resolution: build in an Android-capable worker; publish the actual APK and SHA-256 at the advertised paths; verify content type and checksum after deployment; physically smoke-test Android 12+ permission, installed language pack, haptic/tone, LAN pairing, and paste.

### P1 — paid checkout is unusable

The candidate correctly renders the production Sociobot checkout URL, but `GET https://api.sociobot.in/api/v1/products/quiet-dictation-bridge/checkout` returns HTTP **404** with `{"error":"enabled factory product","status":404}`. Invalid-license verification does return HTTP 200 with `{"expires_at":null,"reason":"invalid","valid":false}`. The advertised $9 unlock cannot be bought or tested end-to-end.

Required resolution: enable/register the production Sociobot product, then re-run hosted checkout, return-token, restore-license, and verification tests.

## Release recommendation

**Do not accept or release this candidate.** The deployed web bridge is healthy and exactly matches the candidate, but the P0 missing Android artifact violates the core product contract. Correct P1 before advertising the paid unlock.
