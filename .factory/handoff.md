# Quiet Dictation Bridge — review 1 handoff

## Strict review result — 2026-09-06 UTC

Review 1 examined implementation candidate
`221d7f9be4bf71d9e6fb45d64fffab1addbefe10` and documentation candidate
`85720591bdf5b28bd306011fcd31fa2ed4a6f113` without changing product code.
The report is `.factory/review-1.md`.

The verdict is **FAIL** with one P1 finding and zero untested public claims.
In the normal live input path, pasting 10,005 characters into the phone review
field silently yields a 10,000-character phrase which **Confirm & send**
delivers without a warning. This falsifies the public promise that over-limit
phrases are never silently trimmed and remain available for editing. The
existing tagged test bypasses the textarea's browser `maxlength`, so it misses
the user path. Repair the input and replace that test with a normal paste/input
boundary test before re-review.

From a clean checkout, all 13 declared claim commands passed independently,
as did `npm audit --omit=dev`, 20/20 unit tests, production build, billing
probe, and 32/32 browser tests. With JDK 21 and Android SDK 35 installed,
`./gradlew --no-daemon clean test lint assembleDebug` also passed. These gates
do not override the observed false phrase-limit claim.

Fresh live desktop/phone checks covered the initial job/audience/action,
one-click sample/isolation/reset, invalid-code recovery, paired delivery,
reload persistence, cleared pairing codes, headers, legal routes, and designed
404. Evidence is in `/work/.evidence/review-1/`.

## Previous verification 7 handoff

## Independent result — 2026-09-06 UTC

Verification 7 reviewed implementation candidate
`221d7f9be4bf71d9e6fb45d64fffab1addbefe10` and documentation candidate
`c108386455c8da3d38063f23c61f8f8221446700` without changing product code.
The report is `.factory/verification-7.md`.

The verdict is **PASS** with zero findings and zero untested public claims. All
13 declared claim commands passed from the clean setup. The repaired
`offline-reload` command independently opened and reloaded home, Privacy, and
Terms offline in both Playwright projects. Baseline checks passed: `npm ci`,
`npm audit --omit=dev`, 20/20 unit tests, production build, 32/32 browser tests,
the billing-state probe, and Android clean test/lint/debug assembly with 185
executed Gradle tasks.

Fresh live desktop and phone checks covered the cold first screen, one-click
sample, persistent sample label, reset, real-data isolation, two-page pairing,
invalid-code recovery, reviewed delivery, manual copy, reload persistence,
10,005-character rejection, keyboard/focus, 200% text, reduced motion, axe,
privacy requests, legal routes, designed HTTP 404, offline legal reloads, and
the user-controlled update path. All 22 public payload files byte-match the
live deployment. Lighthouse mobile scored 100 in all four categories with
LCP 1.1 s and CLS 0.

Evidence is in `/work/.evidence/verify-7/`. The report is also copied to
`/work/.evidence/qa-report.md`, and `/work/.evidence/qa-result.json` records the
machine-readable PASS.

The only remaining operational follow-ups are a physical Android hardware
smoke and factory billing registration. Neither is an untested claim in this
free release: native behavior is covered by the shipped contract/JVM/build
checks, and the release explicitly makes no paid offer.

## Previous repair 6 handoff

## Result — 2026-09-06 UTC

The P2 claim-coverage finding from verification 6 is fixed in implementation
candidate `221d7f9be4bf71d9e6fb45d64fffab1addbefe10`.

README already promises that the app and legal pages work offline after a
successful first visit. Its one tagged `offline-reload` command now proves that
public promise in its own fresh browser context: it loads home, waits for the
service worker to control it, disables the network, reloads home, then opens
and reloads `/privacy/` and `/terms/` offline while checking each title and H1.
This is an outcome check against the installed service worker, not a
source-string assertion. The corresponding claim inventory now names the app
and legal pages and documents the three-route sandbox.

No shipped runtime code, visual system, user-data behaviour, APK, or public
offer changed. `.factory/catalog-description.txt` and
`/work/.evidence/catalog-description.txt` contain the required verb-first
description: “Dictate quietly from an Android phone to your computer over a
local, confirmed connection.”

## Verification

From the documented clean setup, `npm ci` installed 149 packages without
reported vulnerabilities. `npm audit --omit=dev`, `npm test` (20/20),
`npm run build`, `npm run test:e2e` (32/32), and `npm run verify:billing` all
passed. All 13 literal commands in `.factory/claims.json` passed independently,
including `offline-reload` for home, Privacy, and Terms.

The worker initially lacked native prerequisites, so JDK 21 and Android SDK 35
were installed in the disposable worker. `npm run test:claim:on-device-speech`
passed. `./gradlew --no-daemon clean test lint assembleDebug` passed, followed
by a passing `test lint assembleDebug` rerun with 181 actionable tasks. The
committed/downloadable APK was not replaced because artifact source did not
change.

## Deployment and live check

The static deployment helper ran from fresh `dist/`. All 22 publicly served
build files byte-match `https://quiet-dictation-bridge.sociobot.in/`. Live
`verify-url.sh` passed: HTTPS 200, expected title, `lang=en`, one H1, one main,
complete image alt handling, labelled buttons, and no console/page errors.

Fresh desktop and Pixel 5 contexts showed the job “Dictate softly from phone to
computer,” the intended audience, and **Try it with sample data** before
scrolling. One click loaded three sample phrases, kept its persistent label,
Reset demo restored all three phrases, and Start for real returned to empty
real history. Both contexts had no horizontal overflow or console errors.

In a separate fresh live service-worker context, home displayed the offline
state and reloaded after network loss. Privacy and Terms then each opened and
reloaded offline with their correct title and H1. `/`, `/privacy/`, and
`/terms/` return HTTP 200; the designed unknown route returns HTTP 404 as
expected.

## Remaining limits

- No physical Android device is attached. The Android 12+ microphone dialog,
  installed language-pack recognition, haptic, back gesture, and two-device
  LAN smoke still need a release device.
- The researched one-time Quiet Kit still depends on factory billing
  registration. The current release deliberately remains a fully useful free
  bridge with no checkout or license request; no paid deliverable was removed.

## Previous repair 5 handoff

## Verification 6 update — 2026-09-05 UTC

Independent QA reviewed implementation candidate
`ba961f7e5bf274086a0526705c31da4139c04cc5` without changing product code.
The accompanying report is `.factory/verification-6.md`.

The live PWA passed fresh desktop and phone flows, demo isolation/reset,
manual two-page pairing and Copy, recovery paths, offline home/Privacy/Terms,
reduced motion, legal pages, designed HTTP 404, factory URL verification, and
candidate/live byte identity (22 files). Clean web checks passed: 20 unit
tests, build, 32 browser tests, billing probe, and all 13 declared claim
commands. After provisioning the documented JDK 21 and Android SDK 35 in the
verifier container, the Android clean test/lint/debug-assembly command passed
185 actionable Gradle tasks. The live and committed APK match SHA-256
`e7dfbb7ef7858c1e983429d996c7ad23fceafe5d687ae998a5da8e3d2e1c6254`.

Verification 6 is **FAIL**, not a product-runtime failure: README promises
that offline support includes legal pages, but the declared tagged
`offline-reload` claim test checks only `/`. Live Privacy and Terms did reload
offline, but the public promise remains incompletely covered. Add those routes
to the tagged test or narrow the README claim, then re-verify.

The only hardware limitation remains unchanged: no physical Android device was
available for microphone/language-pack, haptic, back-gesture, and two-device
LAN smoke testing.

- Work order: `quiet-dictation-bridge-repair-5`
- Report commit: `797683fee1c2d4cc703d67efef86872b66906539`
- Failed candidate: `73ca58980547fc65bb4f820f4ff1ce09e5a4b1c8`
- Source report: `.factory/verification-5.md`
- Date: 2026-08-30 UTC

## Result

All four verifier findings are repaired with direct regression coverage. The
PWA remains a static Vite/TypeScript deployment and the shipped Android
artifact remains a Capacitor debug APK with app ID
`in.sociobot.quietdictationbridge`.

## Repairs

### P0 — fresh Android microphone permission

- Imported Capacitor's `PermissionCallback` annotation and applied it to
  `startAfterPermission(PluginCall)`, so Capacitor registers the named launcher
  used by `requestPermissionForAlias`.
- Moved permission-result decisions into `HoldSession.afterPermission`.
  Permission approval starts recognition only for the still-active hold;
  denial releases the hold; approval after release resolves without recording.
- Added JVM tests for all three results and a reflection test against the
  compiled plugin method. `javap -v` confirms
  `com.getcapacitor.annotation.PermissionCallback` under
  `RuntimeVisibleAnnotations` on the callback.
- The on-device claim now runs both the offline-source contract and native JVM
  tests instead of relying on source substrings alone.

### P1 — automatic clipboard copy

Remote WebRTC delivery is not a browser user gesture, so automatic clipboard
write cannot be made reliable in a fresh profile. The failed control and every
automatic-copy promise were removed. Received phrases now always remain saved
and explicitly instruct the user to choose **Copy**. The replacement claim
grants clipboard permission in an isolated demo context, chooses **Copy**, and
compares the clipboard with the exact phrase.

### P2 — 390 px layout at 200% text

- Grid and flex children now permit shrinking, headings wrap safely, and the
  mobile display clamp is width-aware.
- The final word and punctuation of the H1 stay together without clipping.
- At 390 px with a 200% root text size, the document and tested hero/pricing
  bounds remain within 390 px. At normal 390 px, the H1 has equal 358 px client
  and scroll widths.

### P2 — claims inventory

- Removed the untestable future-update promise.
- Added distinct claims and tagged browser tests for user-initiated copy,
  press/release recognition, tone+haptic ordering, and reload-cleared pairing.
- Tightened the free-release claim to the actual APK, label, tone, checkout,
  and license behavior.
- `.factory/claims.json` now contains 13 claims. Every literal command passed
  independently from its declared entry point.
- Updated `.factory/copy-audit.md`; no landing sentence exceeds 22 words or
  contains a banned marketing term.

## Regression coverage

- `LocalSpeechPermissionTest` reflects the runtime callback annotation.
- `HoldSessionTest` covers grant, denial, pointer release before approval, and
  stale-request behavior.
- Playwright instruments local recognition to prove zero starts before a held
  key, one start while held, and one stop on release.
- Playwright instruments `AudioContext`, `navigator.vibrate`, and
  `RTCDataChannel.send`; the observed order is `tone:660`, `haptic:35`, `send`.
- A paired two-page test reloads both pages and verifies every code is empty and
  both roles return to the unpaired state.
- A 390 px / 200% text test checks the document, H1, hero actions, pricing grid,
  and price panel bounds.
- Release-contract tests prohibit the removed control, automatic-copy wording,
  and the future-update promise.

## Exact verification

Clean web gates:

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
npm run test:e2e
npm run verify:billing
```

- Clean install: 149 packages from the lockfile.
- Production audit: 0 vulnerabilities.
- Vitest: 20/20 passed in four files.
- TypeScript and Vite production build passed and produced `dist/`.
- Playwright: 32/32 passed across desktop Chromium and the 390 px mobile
  project. This includes axe, keyboard, real two-page WebRTC, privacy traffic,
  demo isolation, import/export, offline reload, 200% text, legal/404 routes,
  and every browser claim.
- All 13 claim commands passed independently.
- Billing probe passed and confirmed no registered product; the release has no
  checkout or license flow.
- `verify-url.sh` passed locally in 575 ms: title, `lang=en`, one H1, one main,
  complete image alt handling, labelled buttons, and zero console/page errors.
- Local Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 50 ms, 63 KiB total.
- Initial main JS is 25.77 kB (9.16 kB gzip), shared JS is 0.71 kB, CSS is
  16.14 kB (4.42 kB gzip), there are no web fonts, and the mobile hero is
  14,210 bytes.

Android package gate:

```sh
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
npm run package:android
```

- Gradle ran 185 tasks: debug/release JVM tests, lint, debug assembly, artifact
  staging, and final web rebuild. Native permission tests passed in both build
  types. Lint has 0 errors and 21 non-blocking dependency/generated-order
  warnings.
- APK: 10,799,975 bytes; SHA-256
  `e7dfbb7ef7858c1e983429d996c7ad23fceafe5d687ae998a5da8e3d2e1c6254`.
- `apksigner` verifies v1/v2; `unzip -t` reports no errors. `aapt` reports
  min SDK 23, target/compile SDK 35, and only Internet, microphone, vibration,
  and the scoped AndroidX receiver permission.
- The staged `public/` and final `dist/` APK/checksum pairs match exactly.

PWA/update and repository checks:

- Offline reload passed in independent service-worker contexts.
- A forced `quiet-bridge-v5` to `quiet-bridge-test-v6` update displayed the
  user-controlled prompt, waited for **Update now**, reloaded, removed both v5
  caches, retained only test-v6 shell/runtime caches, and logged no errors.
- `git diff --check` and `git fsck --no-dangling` passed.

## Deployment

Static deployment target:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh quiet-dictation-bridge /work/repo/dist
```

## Post-deployment evidence

Repair commits `ed4fd5310261d0b4258fd81dfc6e454976e07449` and
`13b197c96a22db65047635b993e92131a3afdc74`, plus the initial handoff commit
`1f9d258`, were pushed to `origin/main`. The exact work-order build
(`npm ci && npm test && npm run build`) was deployed through the static helper
with Azure deployment ID `0ab8d049-774c-438c-88bd-8428f6b84a76` to
<https://quiet-dictation-bridge.sociobot.in/>.

- All 22 publicly served files byte-match local `dist/`, including home,
  privacy, terms, 404, hashed JS/CSS, art, manifest, service worker, APK, and
  checksum. Deployment-only `_headers` and `staticwebapp.config.json` are not
  public files.
- Live `verify-url.sh` passed in 797 ms with the exact title, `lang=en`, one H1,
  one main, complete alt handling, labelled buttons, and zero errors.
- Home, demo, privacy, terms, and 404 were independently checked at 1440 px and
  390 px: each has one H1/main, no horizontal overflow, zero serious/critical
  axe findings, and zero console/page errors.
- At live 390 px with a constructed 200% root font (`32px`), the document stays
  390 px wide; H1 client/scroll width is 358 px and hero/pricing bounds end at
  374 px. Normal mobile H1 client and scroll widths also both equal 358 px.
- Tab first focuses the skip link. Reduced motion computes the recording-ring
  animation to `0.00001s`.
- A fresh live two-page WebRTC pair delivered `Live repair 5 identity
  confirmed.`; choosing **Copy** returned that exact text. The complete flow
  made no cross-origin request and logged no error.
- A fresh service-worker context reloaded live offline with the app H1 and
  offline banner intact.
- An unknown route returns HTTP 404 and a body byte-equal to `404.html`.
  Security headers include same-origin CSP, microphone-only Permissions Policy,
  HSTS, `nosniff`, and strict-origin referrer policy. Hashed assets are immutable
  for one year; a conditional request returned 304. `sw.js` and APK revalidate;
  manifest and APK MIME types are correct.
- Live APK length is 10,799,975 bytes and SHA-256 is
  `e7dfbb7ef7858c1e983429d996c7ad23fceafe5d687ae998a5da8e3d2e1c6254`;
  its sidecar, committed artifact, and `dist/` artifact agree.
- Final live Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 0 ms, 35 KiB
  transfer.

## Known limits

- This worker has no attached Android device, emulator, or `/dev/kvm`. Native
  compilation, callback registration, grant/deny/release decisions, package
  contents, permissions, signature, and embedded PWA were verified. A physical
  Android 12+ microphone dialog, installed language pack, recognition, haptic,
  back gesture, and two-device LAN smoke still require a release device.
- The downloadable APK is debug-signed for QA. Release signing must use the
  factory's external keystore; no signing secret is stored in this repository.
