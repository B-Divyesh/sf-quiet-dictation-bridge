# Quiet Dictation Bridge — independent verification 3

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-verify-3`
- Candidate: `ff6b49df383c584048074b0e6fc70102a18a052a`
- URL: <https://quiet-dictation-bridge.sociobot.in/>
- Date: 2026-08-28

## Scope and identity

QA began from the clean `main` checkout at the exact candidate. The exact
Android packaging workflow was repeated in a second clean detached worktree at
the same commit so its generated artifact could not overwrite the candidate
artifact under verification. Product code was not changed.

The researched brief, `AGENTS.md`, visual thesis, and supplied Android, PWA,
accessibility, performance, privacy, and paid-unlock requirements were treated
as the acceptance contract. The previously reported deployment failure was
not assumed: the live deployment and downloadable APK were fetched and checked
again.

## Quality gates

| Check | Fresh result |
| --- | --- |
| Install/security | `npm ci` installed 149 packages. `npm audit --omit=dev` found 0 vulnerabilities. |
| Unit/release tests | `npm test` passed 10/10 tests across two Vitest files. |
| Type/production build | `npm run build` passed `tsc --noEmit && vite build` and produced `dist/`. Main JS is 25,074 B (9.04 kB gzip), shared JS 711 B (0.40 kB gzip), CSS 14,690 B (4.17 kB gzip), and mobile/desktop hero files 14,210/33,300 B. |
| Browser integration | `npm run test:e2e` passed 16/16 tests on desktop Chromium and Pixel 5, including axe, keyboard, two-page WebRTC, billing/license cases, APK/hash, offline reload, responsive overflow, and legal pages. |
| Capacitor | `npm run cap:sync` passed. |
| Exact Android package | After provisioning JDK 21 and Android SDK/build tools 35 outside the repository, `npm run package:android` passed in the clean detached worktree: 147 Gradle tasks, unit tests, debug assembly, artifact staging, checksum, and final static build. |
| Android lint | **Failed.** `./gradlew --no-daemon lint` aborted with 1 error and 20 warnings. The error is `NewApi` at `LocalSpeechPlugin.java:66`: `createOnDeviceSpeechRecognizer` requires API 31 while min SDK is 23. |

The new clean package is 10,745,004 B versus the committed 10,745,000 B. Both
contain the same 485 entry names and every non-`META-INF` entry is byte-identical;
the expected debug-signature metadata is the only difference. Both verify with
APK Signature Schemes v1 and v2.

## Live deployment and Android artifact

- All 20 public candidate files (home, legal pages, manifest, service worker,
  offline page, icons, art, compiled JS/CSS, APK, and checksum) byte-match live.
- Live APK: HTTP 200, `application/vnd.android.package-archive`, 10,745,000 B,
  SHA-256 `ed16aabdae6055174df0ca476a4dc0de9e16996c69261fcbeb3b50407608335e`.
  The live `text/plain` sidecar contains the same hash. A nonexistent APK is a
  real HTTP 404, not SPA fallback HTML.
- Independent `apksigner`, `aapt`, and `apkanalyzer` checks found a valid v1/v2
  debug signature, application ID `in.sociobot.quietdictationbridge`, min SDK
  23, target/compile SDK 35, and only Internet, microphone, and AndroidX's
  scoped dynamic-receiver permissions. `allowBackup=false` and
  `usesCleartextTraffic=false` are present.
- The APK's embedded app shell and compiled assets match the candidate build.
  Source uses `createOnDeviceSpeechRecognizer` plus
  `EXTRA_PREFER_OFFLINE=true`; there is no cloud-STT fallback.

The prior P0 missing-APK deployment defect is therefore fixed.

## Functional and recovery evidence

An independent live two-page run created 864-character offer and answer codes,
recovered from invalid offer and answer submissions, connected the pages, sent
reviewed text, persisted the receiver history through reload, exported valid
JSON, copied the phrase, preserved history when Clear was cancelled, and removed
it when Clear was confirmed. Empty invitation and draft submissions produced
specific announced recovery messages. No console or page errors occurred.

A 10,050-character confirmed draft exposed a defect: the sender cleared the
draft and reported success, but the receiver silently stored/exported only
10,000 characters.

The live production catalog is HTTP 200 in `live` mode with 22 products but no
`quiet-dictation-bridge` entry. Direct checkout remains HTTP 404 with
`{"error":"enabled factory product","status":404}`. The client now handles this
honestly by staying on-page and announcing that checkout is being prepared.
Invalid-license verification is healthy (HTTP 200, `valid:false`), and a return
token was removed from the URL and reconciled to the locked state.

## Browser, accessibility, PWA, privacy, and performance

- Factory `verify-url.sh` passed in 680 ms: correct title and `lang`, one `h1`,
  one `main`, complete image alt attributes, labeled buttons, and no console
  errors.
- Fresh 1440x1000 desktop and 390x844 mobile runs had no horizontal overflow,
  console errors, or page errors. Screenshots were visually reviewed; content
  remains legible and unclipped. The primary role targets measured 542x120 and
  358x120 CSS px.
- Keyboard traversal reached all 16 desktop and 14 mobile interactive controls
  without a trap. Each focused control had the designed 3 px mint ring; Enter
  activated role selection. The skip link is first and visible on focus.
- Live axe scans of home, privacy, and terms at both viewports found zero
  violations of any impact, including zero serious/critical findings. Manual
  geometry testing did find smaller-than-contract hit areas listed below.
- Under reduced motion, animation and transition duration compute to 0.00001 s.
- The active service worker is `quiet-bridge-v3`; the shell cache contains home,
  privacy, terms, offline fallback, manifest, icons, both hero images, and all
  compiled assets. `registration.update()` completed cleanly. Home, privacy,
  and terms all reloaded offline on desktop and mobile with no errors. Source
  and regression coverage confirm the waiting-worker toast and user-triggered
  `SKIP_WAITING` path; an unchanged live deployment cannot create a waiting
  worker for a real update transition.
- Initial browser traffic stayed entirely on the product origin. Source review
  found no analytics, advertising, third-party font/script, STUN, TURN, relay,
  cloud transcription, beacon, or WebSocket. The only external browser traffic
  observed followed explicit checkout/license actions and went to
  `api.sociobot.in`. Transcripts use IndexedDB; licenses use localStorage.
- Live responses have restrictive CSP, microphone-only Permissions-Policy,
  strict referrer policy, `nosniff`, HSTS, correct manifest/APK/checksum MIME
  types, immutable hashed assets, and revalidated service worker/manifest.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.1 s, CLS 0, TBT 110 ms, Speed Index 1.3 s.
  Initial transfer was 35 KiB. All supplied bundle and image budgets pass.
- README, MIT LICENSE, `/privacy/`, `/terms/`, the product-specific design
  thesis, generated-image prompt/provenance, correct 192/512/maskable manifest
  icons, and responsive WebP art are present.

## Defects

### P0 — first-run Android permission flow can start recording after release with an idle visual state

On native Android, pointer-down immediately sets the UI to `Listening` and
calls `NativeLocalSpeech.start`. If microphone permission is not yet granted,
the plugin opens the system permission dialog and does not create a recognizer.
A pointer-up/cancel while that dialog is open calls native `stop`, which is a
no-op because `recognizer` is still null, and changes the visible label back to
`Hold to talk`. If the user then grants permission, `startAfterPermission`
unconditionally calls `begin` and starts on-device recognition. The native
`state: listening` event is emitted, but the JS listener handles only `review`,
so the UI stays idle while recognition is active.

This reachable first-run sequence violates the defining privacy contract:
recording must occur only while held and must always have an unmistakable
recording state. Request permission before accepting the hold gesture, or carry
a cancellable hold token through permission resolution and synchronize the
native `listening` event back into UI state. Add an Android interaction test for
release/cancel during the permission dialog.

### P1 — confirmed text is silently truncated

The sender accepts and clears a 10,050-character draft and reports it sent, but
`receiveTranscript` silently applies `.slice(0, 10_000)`. The final 50 confirmed
characters are lost with no warning on either device. Enforce the limit before
send with an announced error/counter, or preserve the complete message; never
silently mutate confirmed text.

### P1 — available Android lint gate fails

`./gradlew --no-daemon lint` fails with one `NewApi` error at the API-31
on-device recognizer call (and reports 20 warnings). Runtime entry currently has
an SDK check, but lint cannot prove it across the helper/callback boundary. Add
an appropriate API annotation/direct guard and make Android lint a repository
script/CI gate.

### P1 — advertised one-time purchase remains unavailable

The production Sociobot catalog still has no matching product and direct
checkout is HTTP 404, so the advertised $9 Quiet Kit cannot be purchased or
tested through checkout, return, and restore. The new guarded UI is an honest
and useful recovery state, but it does not complete the paid-unlock acceptance
contract. Factory-side registration is required; then repeat the live purchase
and return-token path.

### P2 — several touch targets are below the required 44x44 CSS px

At 390 px, the brand link is 38 px high and the visible `Open bridge`, `Privacy`,
`Terms`, and `Source` links are about 21.7 px high. Desktop additionally exposes
the two other undersized header navigation links. Axe does not flag these, but
they fail the explicit 44 px touch/click target requirement. Increase clickable
padding/min-height without changing the visual text size.

### P2 — stable download URL is cached immutable for one year

The live non-content-versioned
`/download/quiet-dictation-bridge-debug.apk` and checksum both return
`Cache-Control: public, max-age=31536000, immutable`. A future APK published at
the same documented URL can remain stale for a year. Use a versioned/hash-bearing
artifact URL or require revalidation for the stable alias.

### P2 — native haptic promise lacks the Android vibration permission

The UI and README promise a haptic on confirmation and call
`navigator.vibrate(35)`, but the merged APK declares no
`android.permission.VIBRATE`. The tone remains as confirmation, yet the shipped
native app cannot reliably deliver the separately advertised haptic. Declare
the normal permission or remove the claim.

## Device limitation and release recommendation

No physical Android handset was attached, so microphone permission UI,
installed language-pack recognition, haptic/tone, back gesture, and cross-device
LAN behavior could not be physically smoked. Native compilation, unit tests,
lint, APK structure/signature, permissions, embedded assets, and source control
flow were all checked independently.

**Do not accept or release this candidate.** The earlier missing-APK deployment
failure is fixed and the web/PWA is otherwise strong, but the privacy-critical
first-permission race, silent confirmed-text loss, failing Android lint gate,
and unavailable paid flow keep the candidate from the acceptance contract.
