# Quiet Dictation Bridge — independent verification 4

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-verify-4`
- Candidate: `c70703a155703f7c52200f5b5276e2682cef41b8`
- Product revision in candidate: `e197d774f568ba417164f83b63d6ca00d2145975`
- URL: <https://quiet-dictation-bridge.sociobot.in/>
- Verified: 2026-08-28 UTC

## Acceptance decision

The deployed free bridge and Android package are substantially functional and
the prior privacy-critical permission race and silent transcript truncation are
repaired. The candidate is nevertheless not releasable under the supplied
contract: the exact browser test gate is nondeterministic and failed from the
clean checkout, and the advertised one-time purchase is still unavailable in
the production billing engine. Three lower-severity PWA/responsive/accessibility
requirements also remain unmet.

No product code was changed during verification. Tests began in a clean,
detached checkout at the exact candidate. Only this report and the handoff were
changed in the primary checkout.

## Fresh quality-gate evidence

| Check | Result |
| --- | --- |
| Candidate/install | Clean detached checkout at the exact SHA. Node `22.23.2`, npm `10.9.8`; `npm ci` installed 149 packages and reported 0 vulnerabilities. `npm audit --omit=dev` also found 0 vulnerabilities. |
| Unit tests | `npm test`: **12/12 passed** in 3 files. |
| Type and production build | `npm run build`: **passed** (`tsc --noEmit && vite build`) and produced `dist/`. |
| Browser integration | First exact `npm run test:e2e`: **failed, 19/20 passed**. A second exact run passed 20/20. Isolated repetition of the failing desktop case failed **2/5**. See P1 below. |
| Capacitor sync | `npm run cap:sync`: **passed**. |
| Android lint | `npm run lint:android`: **passed**, 0 errors and 20 warnings. Warnings are manifest ordering/dependency, data-extraction recommendation, generated/unused resources, and icon advisories. |
| Exact Android package | `npm run package:android`: **passed** all Java unit tests, lint, debug assembly, artifact staging, checksum generation, and final web build; Gradle completed 185 tasks. |
| Billing probe | `npm run verify:billing`: completed and reported that Quiet Kit is not registered. Direct production checkout is HTTP 404. |
| Repository hygiene | `git diff --check` and `git fsck --no-dangling` passed. No keystore, environment file, or obvious secret is tracked. |

The production bundle is comfortably within budget: main JS 25,354 B (9.16
kB gzip), shared JS 711 B (0.40 kB gzip), CSS 14,829 B (4.19 kB gzip), no web
font payload, mobile hero 14,210 B, desktop hero 33,300 B. Lighthouse observed
63 KiB total transfer.

## End-to-end product evidence

Fresh automated interaction on the production build and live deployment
covered the normal, boundary, invalid-input, and recovery paths:

- A desktop and 390 px phone page exchanged a complete WebRTC offer/answer,
  reached the encrypted local data channel, and delivered reviewed text. The
  fresh live pairing took 1,495 ms. Five live confirm-to-receive samples were
  946, 259, 910, 256, and 910 ms (median 910 ms).
- Empty invitation, malformed invitation, empty answer, and malformed answer
  each produced actionable errors. Correcting the fields recovered without a
  reload.
- No text arrived while it was merely in the review field. Empty text was
  refused. Leading/trailing whitespace was normalized only before send. An
  exact 10,000-character phrase arrived intact. A 10,005-character injected
  boundary case was refused, retained for editing, and not delivered.
- Manual clipboard copy returned the exact phrase. Export produced valid JSON
  with both complete phrases. IndexedDB history survived reload; pairing codes
  did not. Canceling clear preserved both records, while confirming clear
  removed them durably.
- The browser used no external request on initial load. Explicitly pressing
  the purchase control made one request to the approved Sociobot catalog and
  stayed on the product when that catalog lacked the product. Source review
  found no analytics, CDN script/font, STUN/TURN, application relay, or general
  cloud speech path.

The local Chromium environment does not expose a qualifying local Web Speech
implementation, so the product correctly disabled microphone dictation and
left typed review available. The native implementation uses API 31+
`createOnDeviceSpeechRecognizer`, requests microphone permission in context,
and includes the repaired hold token that invalidates permission completion
after pointer release/cancel.

## Live deployment and response policy

- A fresh production build from the candidate had 21 publicly served files;
  every file byte-matched the live URL. The deployment-only
  `staticwebapp.config.json` is correctly not public. This independently
  confirms the live deployment matches the candidate.
- The live APK is HTTP 200,
  `application/vnd.android.package-archive`, 10,745,849 B, SHA-256
  `6f9f37c3efa53652591be01b42ecd8419de6c2d6528b3959674a4e9e75be70e7`.
  The text sidecar matches. Both use `Cache-Control: no-cache,
  must-revalidate`; a missing APK returns a real 404. Hashed assets use a
  one-year immutable policy, while `sw.js` revalidates and the manifest has the
  correct MIME type.
- The live CSP restricts scripts/styles to self and connections to self plus
  the two approved Sociobot API origins. `Permissions-Policy` allows only the
  same-origin microphone and disables camera, geolocation, payment, USB, and
  interest-cohort. HSTS, `nosniff`, and strict-origin referrer policy are live.
- Factory `verify-url.sh` passed locally (787 ms) and live (1,199 ms): correct
  title, `lang=en`, one H1, one main landmark, complete image alt handling,
  labelled buttons, and no console/page errors.
- Axe reported no serious or critical findings (in fact no findings) on live
  home, privacy, and terms pages at 1440 px and 390 px. Connected sender and
  receiver states likewise had no serious/critical findings. Keyboard traversal
  reached the skip link and all controls with a 3 px visible focus ring. Reduced
  motion removed all measurable transitions and animation.
- Live offline reload passed for home, privacy, and terms at both desktop and
  390 px. A simulated service-worker upgrade created an update toast, waited
  for the user, accepted `Update now`, reloaded, removed v3 caches, and left the
  app controlled by the v4 worker with no errors.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 60 ms.

## Android artifact evidence

The committed APK verifies with APK Signature Schemes v1 and v2 and an Android
debug certificate. `aapt`/`apkanalyzer` report application ID
`in.sociobot.quietdictationbridge`, min SDK 23, target/compile SDK 35, version
1.0, and only Internet, microphone, vibration, and AndroidX's scoped dynamic
receiver permissions. `allowBackup=false` and `usesCleartextTraffic=false` are
present.

A clean rebuild produced a 10,745,848 B APK with the expected different debug
signature/hash. Both archives contain 485 entries, and every non-`META-INF`
entry is byte-identical. This demonstrates reproducible application content.

An Android 15 emulator image was provisioned for a runtime install smoke, but
this container has no KVM/VMX support. Software emulation remained offline and
could not boot in useful time, so no claim is made for physical microphone,
permission-dialog, haptic, language-pack, back-gesture, or real two-device LAN
behavior. Native compilation, unit tests, lint, signature, manifest,
permissions, and embedded assets were all checked independently.

## Defects

### P1 — exact browser quality gate is nondeterministic

The first clean `npm run test:e2e` failed 1 of 20 tests. The desktop
`a too-long confirmed draft...` case waited 15 seconds for
`#dictation-workspace`, which remained hidden. Repeating that case five times
with one worker failed twice and passed three times; a later full run happened
to pass 20/20.

Trace/snapshot evidence identifies a test race, not a WebRTC product failure:
the failing test clicks `Create private answer` and immediately reads
`#phone-answer` without waiting for the asynchronous ICE answer. On slow runs
it pastes an empty answer, and the desktop correctly reports `Paste the answer
from your phone first.` The neighboring normal-flow test already waits for a
non-empty value. Add the same wait to this regression test. Until then the
required exact test command cannot be relied upon to pass from a clean build.

### P1 — advertised one-time Quiet Kit cannot be purchased

The production catalog returns HTTP 200 but contains no
`quiet-dictation-bridge` entry; its direct checkout endpoint returns HTTP 404
with `{"error":"enabled factory product","status":404}`. The UI honestly
withholds navigation and keeps the free bridge available, but the page still
advertises a `$9 one time` product and the supplied paid-unlock acceptance
contract requires a functioning checkout, return, verification, and restore
path. Factory-side product registration and a real live purchase/return smoke
are still required.

### P2 — 390 px Terms page clips its H1 and scrolls horizontally

At 390 px, `/terms/` has a 416 px document width. The 358 px-wide H1 has a 400
px scroll width because `DELIBERATELY.` cannot wrap at the fixed mobile 3.6 rem
size. The final letters are visibly clipped; `/` and `/privacy/` remain at 390
px. Make the legal H1 responsive or permit safe word breaking, and add legal
page overflow coverage.

### P2 — one footer touch target is narrower than 44 CSS px

The visible `Terms` footer link measures 41.234 by 44 CSS px at both desktop
and 390 px. The test added by the repair checks only height, so it misses the
explicit 44 by 44 target contract. Add horizontal padding/min-width and assert
both dimensions.

### P2 — local transcript data has export but no import

Transcripts are stored locally in IndexedDB and export correctly as JSON, but
there is no import control or implementation. The supplied PWA/local-first
contract requires explicit export and import so users can restore data they
own. Add validated JSON import with duplicate/error handling; do not gate it
behind Quiet Kit.

## Recommendation

**Do not accept this candidate.** Register the production billing product, fix
the flaky regression test, repair the mobile Terms heading and footer target,
and add transcript import. Then repeat the exact clean suite, live purchase
round trip, byte-identity check, and a physical Android 12+ permission/
recognition/haptic/LAN smoke.
