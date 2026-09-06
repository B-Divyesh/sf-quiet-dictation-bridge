# Verify private phone-to-computer dictation

**Verdict: PASS**

- Work order: `quiet-dictation-bridge-verify-8`
- Implementation candidate: `0cc72ed2d108997ac2f722ed592293f0a1159dd5`
- Documentation reviewed: `b9646b48ae69ff5ece5fa17a67ddd409c7ccf649`
- Live URL: <https://quiet-dictation-bridge.sociobot.in/>
- Verified: 2026-09-06 UTC
- Findings: 0
- Untested public claims: 0

## Decision

**PASS.** The candidate passes independent clean-checkout and live verification.
There are zero findings of every severity and zero untested public claims.
No product code was changed by this work order.

## First screen

Fresh desktop (1440 x 900) and phone (393 x 727) contexts started at scroll
position zero. Before scrolling, each clearly showed:

- Job: “Dictate softly from phone to computer.”
- Audience: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**. The adjacent text says it opens
  three received phrases and keeps saved history separate.

The action was in the initial viewport at both sizes. The home title was
“Quiet Dictation Bridge — private phone-to-desktop dictation”; it had one H1
and one main landmark. The uppercase display treatment is visual CSS only; the
same plain words are available as text.

## Clean checkout quality gates

Fresh checkout: `/tmp/qdb-verify8-clean.O4SlJV` at documentation SHA `b9646b4`,
which contains implementation `0cc72ed`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 149 packages installed. |
| `npm audit --omit=dev` | Passed; 0 vulnerabilities. |
| `npm test` | Passed; 20/20 tests. |
| `npm run build` | Passed and produced `dist/`. |
| `npm run test:e2e` | Passed; 32/32 desktop Chromium and Pixel 5 tests. |
| `npm run verify:billing` | Passed; no registered paid offer is advertised. |
| Native quality gate | With the documented JDK 21 and Android SDK 35 installed, `./gradlew --no-daemon clean test lint assembleDebug` passed. |
| Repository | `git diff --check` passed; clean checkout had no source changes. |

The Android claim command also passed: its tagged Vitest contract and the
native `LocalSpeechPermissionTest` and `HoldSessionTest` completed successfully.

## Declared claims

Each of the 13 literal commands in `.factory/claims.json` ran independently
after `npm ci`. Every command passed. The final Playwright result records a
passed run with no failed tests.

| Claim | Result | Evidence |
| --- | --- | --- |
| `private-load` | Pass | Same-origin initial browser traffic only. |
| `local-delivery` | Pass | Two pages pair and deliver reviewed text without an HTTP relay. |
| `offline-reload` | Pass | Home, Privacy, and Terms open and reload offline after first visit. |
| `json-import` | Pass | Valid import persists; duplicates and invalid files are rejected. |
| `json-export` | Pass | Download contains every visible sample transcript. |
| `demo-isolation` | Pass | Demo reset and clear do not change real history. |
| `free-release` | Pass | No checkout/license flow; APK, checksum, session labels, and three tones exist. |
| `manual-copy` | Pass | Clipboard receives the exact phrase only after **Copy**. |
| `press-to-listen` | Pass | Instrumented recognition starts on hold and stops on release. |
| `confirmation-feedback` | Pass | Selected tone and haptic occur before send. |
| `pairing-memory` | Pass | Reload clears pairing codes and returns both pages to unpaired state. |
| `on-device-speech` | Pass | Native contract, permission, and released-hold JVM tests pass. |
| `phrase-limit` | Pass | Real clipboard paste retains 10,005 characters, blocks delivery, then delivers the edited exact 10,000 characters. |

## Live verification

- Factory `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one H1, one
  main, complete image alt handling, labelled buttons, and no console/page
  errors. Its evidence is in `/work/.evidence/verify-8/`.
- Live desktop axe found no serious or critical violations. Fresh live Privacy,
  Terms, and designed unknown-route pages also had one H1/main each and no
  serious or critical axe violations. The unknown route deliberately returned
  HTTP 404; this is expected behavior, not a defect.
- Tab first focused the skip link. Reduced motion computed the recording
  animation to no more than `0.00001s`. The 393 px phone layout had no
  horizontal overflow. The clean Pixel browser suite also passed its 200%
  text-size regression. An attempted live inline-style injection for that
  artificial measurement was correctly refused by the live `style-src 'self'`
  CSP, so it was not used as runtime evidence.
- One click opened three realistic sample phrases and displayed the persistent
  “Demo — sample data, nothing is saved to your real history” label. **Reset
  demo** restored the three phrases. **Start for real** returned to empty real
  history.
- Live invalid invitation inputs gave the specific empty and malformed-code
  recovery messages. A live two-page local pairing flow was exercised. A real
  Ctrl+V paste of 10,005 characters remained intact, showed the exact
  five-character warning, and was refused without a receiver transcript.
  Removing five characters delivered exactly 10,000 characters. The receiver
  retained the `Verification 8` session label, copied only after **Copy**,
  persisted across reload, and cleared temporary pairing state on reload.
  The flow made no cross-origin HTTP request.
- In a fresh service-worker context, home, Privacy, and Terms loaded and
  reloaded offline with their route-specific titles and headings.
- Home, demo, Privacy, Terms, APK, checksum, and source links all returned
  HTTP 200. Live headers include the same-origin CSP with `frame-ancestors
  'none'`, microphone-only Permissions Policy, HSTS, `nosniff`, and strict
  origin referrer policy.
- The live APK is a valid ZIP-sized Android artifact and its live checksum
  matches SHA-256 `06a39fb57bc5e79b18355d2af3436524c22ead2086b10a5efdcb9393fc9e4784`.
- A fresh build's 23 public payload files byte-match the live response. The
  only excluded build file is `staticwebapp.config.json`, a deployment control
  file intentionally not exposed as public content.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing/stale Android artifact and failed Android lint | Fixed: clean native test, lint, and debug assembly pass; live APK checksum matches. |
| Android permission callback and released-idle hold defects | Fixed: native contract, permission, and hold-session tests pass. |
| Unavailable billing checkout | Truthfully closed: this free release advertises and requests no payment or license. |
| Missing security headers/cache policy | Fixed: live CSP, Permissions Policy, HSTS, nosniff, referrer policy, and cache behavior are present. |
| Automatic clipboard promise without a user gesture | Fixed: automatic copy was removed; manual Copy is tested and works. |
| Missing JSON import | Fixed: import, duplicate rejection, invalid-file recovery, export, and persistence are covered. |
| Small targets and 390 px/200% clipping | Fixed: mobile and clean browser regressions pass. |
| Flaky pairing browser gate | Fixed: declared commands and complete 32-test suite pass. |
| Offline legal-page promise untested | Fixed: declared offline claim covers all three routes in separate offline contexts. |
| P1 silent truncation on normal paste | Fixed by `0cc72ed`: the live normal Ctrl+V path preserves 10,005 characters, warns, blocks sending, and recovers to exact 10,000-character delivery. |

## Remaining external follow-up

No physical Android hardware is attached. A future release-device smoke should
cover the Android permission dialog, installed language pack, haptic, back
gesture, and two-device LAN. Factory billing registration is also external.
Neither is a missing or untested public claim for this complete free release.
