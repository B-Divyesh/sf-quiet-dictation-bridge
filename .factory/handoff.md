# Quiet Dictation Bridge — repair 4 handoff

- Work order: `quiet-dictation-bridge-repair-4`
- Report commit: `213b103d7ca71d44a70fb5a8df6c92d69bdf534e`
- Failed candidate: `c70703a155703f7c52200f5b5276e2682cef41b8`
- Source report: `.factory/verification-4.md`
- Date: 2026-08-30 UTC

## Repairs

### P1 — deterministic browser quality gate

The unchanged candidate’s long-draft case was reproduced first. It failed 9 of
10 isolated desktop repetitions because the test read asynchronous WebRTC
offer/answer fields before ICE gathering completed. The regression now waits
for both non-empty values and gives this connection-bound case a 45-second
total budget. The exact repaired case passed 10/10 repetitions, and the final
full suite passed 22/22 across desktop Chromium and a 390 px mobile profile.

`npm run test:e2e` now runs the production build first. It is self-contained
from a fresh `npm ci`, including when invoked by an individual claim test.

### P1 — unavailable paid offer

The production Sociobot catalog still has no `quiet-dictation-bridge` product,
and repository policy forbids changing billing infrastructure from this repo.
Repeatedly advertising a `$9 one-time` product therefore could not produce an
honest purchase path. This release applies the repository’s closest-useful-
version rule instead of parking the blocker:

- the unavailable price, checkout button, license form, and runtime billing
  connection are removed;
- automatic copy, session labels, and all confirmation tones are enabled for
  everyone;
- the page, README, privacy policy, and terms state that this release has no
  payment or license requirement;
- the CSP now permits only same-origin runtime connections; and
- `npm run verify:billing` records the external catalog state without claiming
  that a purchase is available.

The researched one-time model remains in `.factory/brief.json`. A later release
may reinstate it only after factory-side product registration and a real hosted
purchase/return verification.

### P2 — Terms overflow and footer target

- The legal H1 now uses a width-aware mobile clamp with safe word wrapping.
  At exactly 390×844, `/terms/` has a 390 px document width and its 358 px H1
  has a 358 px scroll width.
- Every footer link now has both a 44 px minimum width and height. The repaired
  Terms target measures 49.234×44 CSS px at desktop and 390 px.
- Playwright asserts legal-page overflow and both touch-target dimensions.

### P2 — transcript import

- Added free, validated JSON import beside export.
- Import accepts only Quiet Dictation Bridge exports, validates every phrase,
  enforces the 10,000-character and 40-character session limits, ignores old
  database IDs, and commits only after the complete file validates.
- Existing and within-file duplicates are skipped by exact text/date/session
  identity. Clear success counts and actionable errors are announced.
- Unit and browser regressions cover valid restore, ID replacement, invalid
  product/JSON/date/text/session/length cases, duplicate handling, no partial
  mutation, and persistence after reload.

## Additional contract work

- Added a one-click `/?demo=1` sandbox with three realistic phrases, a
  persistent banner, reset, and return-to-real action. Demo data uses IndexedDB
  `demo:quiet-dictation-bridge`; real history remains in
  `quiet-dictation-bridge`. See `.factory/demo.md`.
- Added `.factory/claims.json`; every listed command passed independently.
- Added a plain-language first screen, copy audit, canonical/Open Graph/Twitter
  metadata, apple-touch metadata, and a 1200×630 local crop of the existing
  original hero art. Provenance is recorded in `.factory/design.md`.
- Bumped the service-worker/manifest shell from v3 to v4 so installed clients
  receive the repair through the existing user-controlled update prompt.
- Rebuilt the Android debug APK so its embedded PWA includes import, demo,
  responsive, service-worker, and release-offer repairs.
- The post-deploy response audit found the legacy SPA fallback returned the
  home page with HTTP 200 for unknown URLs. The final release removes that
  unnecessary fallback and uses a styled `/404.html` through a real HTTP 404
  response override. A source contract and 390 px axe/overflow check cover it.

## Exact local verification

Fresh dependency and web gates:

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
npm run test:e2e
npm run cap:sync
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
  npm run lint:android
npm run verify:billing
```

- `npm ci`: 149 packages; audit: 0 vulnerabilities.
- Vitest: 20/20 passed in four files.
- Playwright 1.58.2: 22/22 passed across desktop Chromium and 390 px mobile.
  Coverage includes the 10-run race stress, two-page local delivery, keyboard,
  reduced motion, axe, desktop/mobile overflow, width and height of targets,
  import/export, demo isolation, privacy traffic, offline reload, legal pages,
  APK integrity, and error recovery.
- All nine `.factory/claims.json` commands passed from their declared entry
  points.
- Type check and production build passed. Initial main JS is 25,970 B
  (9.22 kB gzip); CSS is 15,846 B (4.34 kB gzip); mobile hero is 14,210 B.
- Local `verify-url.sh` passed in 578 ms: title, `lang=en`, one H1, main,
  image alt handling, labelled buttons, and zero console/page errors.
- Reviewed 1440×1000 and 390×844 screenshots have no horizontal overflow.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 0 ms.
- Offline reload passed. A forced v4→test-v5 service-worker update displayed
  the prompt, waited for `Update now`, claimed the page, deleted v4 caches, and
  reloaded with only test-v5 shell/runtime caches and zero errors. `dist/` was
  then rebuilt back to the shipping v4 worker.
- `npm run package:android`: 185 Gradle tasks passed native unit tests, lint,
  and debug assembly. Standalone final lint passed 103 tasks with 0 errors and
  20 non-blocking generated/dependency advisories.
- APK: 10,799,276 B; SHA-256
  `fc9b46b8b41c9dbc37310e9ded1894cab1411f16159f667437e6d7a5e87706e3`.
  `apksigner` verifies v1/v2. `aapt` reports app ID
  `in.sociobot.quietdictationbridge`, min SDK 23, target/compile SDK 35, and
  only Internet, microphone, vibration, and scoped AndroidX receiver
  permissions. The APK contains the repaired HTML and v4 worker.
- `git diff --check`, `git fsck --no-dangling`, tracked-secret-name scan, and
  APK/public-to-dist checksum parity passed.

## Deployment

Static deployment target:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh quiet-dictation-bridge /work/repo/dist
```

## Post-deployment evidence

Repair commits `9023abbb230cbec70ffb97007213da339767dba7` and
`594241c21d040b285569adda2e979af5549ca1a3` were pushed to `origin/main`.
The final `dist/` was deployed through the work-order static configuration with
Azure deployment ID `e1f0ed33-75c1-4181-9280-b88609c68c3d` to
<https://quiet-dictation-bridge.sociobot.in/>.

- All 22 public files byte-match local `dist/`; deployment-only `_headers` and
  `staticwebapp.config.json` were correctly excluded from public identity.
- Live `verify-url.sh` passed in 605 ms with the exact title, `lang=en`, one H1,
  one main, complete alt handling, labelled buttons, and zero console errors.
- Live desktop pairing delivered `Live repair identity confirmed.` with no
  third-party request. At 390×844, home, privacy, terms, demo, and 404 had no
  overflow or serious/critical axe finding. Keyboard skip focus, reduced
  motion, 49.234×44 Terms target, three isolated demo phrases, and zero normal-
  route console errors passed.
- Fresh live offline contexts reloaded home, terms, and demo successfully.
- An unknown route returns HTTP 404 with the styled H1; a missing APK is also
  HTTP 404. The root remains HTTP 200.
- Live response headers include the same-origin-only CSP, microphone-only
  Permissions Policy, HSTS, strict-origin referrer policy, and `nosniff`.
  Hashed JS is immutable for one year; `sw.js` and the APK revalidate; the
  manifest and APK use their correct MIME types.
- Live APK is 10,799,276 B and hashes to
  `fc9b46b8b41c9dbc37310e9ded1894cab1411f16159f667437e6d7a5e87706e3`;
  its live checksum sidecar and local artifact match.
- Final live Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 0 ms.

## Known limits

- The APK is debug-signed for QA. A factory release-signing work order must use
  the external keystore; no signing secret is stored here.
- This container has no attached Android device. Native compilation, tests,
  lint, package contents, signature, permissions, and web assets were verified;
  physical Android 12+ recognition, permission UI, haptic/tone, back gesture,
  and two-device LAN behavior still need a release-device smoke test.
