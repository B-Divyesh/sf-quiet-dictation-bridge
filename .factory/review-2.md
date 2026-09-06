# Review 2: Verify private phone-to-computer dictation

**Verdict: PASS**

- Work order: `quiet-dictation-bridge-review-2`
- Implementation candidate: `0cc72ed2d108997ac2f722ed592293f0a1159dd5`
- Documentation reviewed: `59e7698ed4ac4b338df6cc78537c1d1da236f113`
- Live URL: <https://quiet-dictation-bridge.sociobot.in/>
- Reviewed: 2026-09-06 UTC
- Findings: 0
- Untested public claims: 0

## Decision

**PASS.** There are zero findings of every severity and zero untested public
claims. This review did not change product code.

## First screen

Fresh desktop (1440 × 900) and phone (393 × 727) contexts began at scroll
position zero. Before scrolling, each clearly showed:

- Job: “Dictate softly from phone to computer.”
- Audience: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**. The adjacent note says that it
  opens three received phrases and keeps saved history separate.

The action was visible in both initial viewports. Both pages had the title
“Quiet Dictation Bridge — private phone-to-desktop dictation”, one H1, one main
landmark, no horizontal overflow, no browser errors, and no cross-origin
requests.

## Clean checkout and declared claims

A new clone at documentation SHA `59e7698` contained implementation
`0cc72ed`. After `npm ci` installed 149 packages:

| Check | Result |
| --- | --- |
| `npm audit --omit=dev` | Passed; 0 vulnerabilities. |
| `npm test` | Passed; 20/20 tests. |
| `npm run build` | Passed and produced `dist/`. Main JS is 26.19 kB and CSS is 16.39 kB uncompressed. |
| `npm run verify:billing` | Passed; the unregistered paid offer is not advertised and no checkout or license flow is present. |
| `npm run test:e2e` | Passed; 32/32 Chromium and Pixel 5 tests. |
| Native quality gate | With JDK 21 and Android SDK platform 35 installed, `./gradlew --no-daemon clean test lint assembleDebug` passed: 185 actionable tasks. |
| Repository | Clean source checkout; `git diff --check` passed. |

Every literal command in `.factory/claims.json` ran independently after the
clean install. All 13 passed:

| Claim | Result |
| --- | --- |
| `private-load` | Pass — initial browser traffic was same-origin only. |
| `local-delivery` | Pass — two pages pair and exchange confirmed text without an HTTP relay. |
| `offline-reload` | Pass — home, Privacy, and Terms open and reload offline. |
| `json-import` / `json-export` | Pass — validation, duplicate rejection, persistence, and complete visible-history export work. |
| `demo-isolation` | Pass — demo reset and clear do not change real history. |
| `free-release` | Pass — no payment/license request; the APK, checksum, labels, and three tones are present. |
| `manual-copy` | Pass — the exact phrase reaches the clipboard only after **Copy**. |
| `press-to-listen` / `confirmation-feedback` | Pass — the instrumented hold/release, selected tone, and haptic paths behave as claimed. |
| `pairing-memory` | Pass — reload clears codes and closes the temporary connection. |
| `on-device-speech` | Pass — native on-device contract plus `LocalSpeechPermissionTest` and `HoldSessionTest` pass. |
| `phrase-limit` | Pass — a real clipboard paste retains 10,005 characters, is refused unchanged, then delivers the edited exact 10,000 characters. |

## Live review

- The factory URL verifier passed: HTTPS 200, title, `lang=en`, one H1, a main
  landmark, image alt handling, labelled buttons, and no console or page
  errors. Evidence is in `/work/.evidence/review-2/`.
- Live Playwright Axe scans at phone width found zero serious or critical
  issues on home, Privacy, Terms, and the designed unknown-route page. The
  unknown route correctly returned HTTP 404 with one H1 and main landmark.
  The standalone Axe CLI could not start its ChromeDriver session in this
  container; the project’s Playwright Axe integration and this live
  Playwright-Axe scan are the accessibility evidence.
- The first Tab focused the skip link. With reduced motion, the recording-ring
  duration was `1e-05s`. Fresh service-worker use opened and reloaded home,
  Privacy, and Terms offline with their own titles and headings. The reviewed
  update path uses a versioned worker, an explicit **Update now** action, and
  `SKIP_WAITING`; its release-contract test passed.
- A live two-page review exercised empty and malformed invitation recovery,
  pairing, local delivery, receiver session label `Review 2`, reload
  persistence, and no cross-origin HTTP request. The empty message was
  “Paste the invitation from your computer first.” The malformed-code message
  was “That is not a valid offer code. Copy the entire code and try again.”
- The live normal clipboard boundary path retained 10,005 characters, showed
  the five-character warning, refused delivery with zero receiver transcripts,
  then delivered exactly 10,000 characters after five deletions.
- One click opened three realistic sample phrases and the persistent
  “Demo — sample data, nothing is saved to your real history” label. **Reset
  demo** restored all three. **Start for real** returned to the pre-existing
  real phrase, proving that the demo storage did not change real history.
- Home, demo, Privacy, Terms, APK, checksum, and source links returned 200.
  Live headers include same-origin CSP with `frame-ancestors 'none'`,
  microphone-only Permissions Policy, HSTS, `nosniff`, and strict-origin
  referrer policy.
- The live APK is a valid ZIP, has a verified Android signature, reports
  application ID `in.sociobot.quietdictationbridge`, min SDK 23 and target SDK
  35. Its live checksum is
  `06a39fb57bc5e79b18355d2af3436524c22ead2086b10a5efdcb9393fc9e4784`.
- All 23 public build payloads byte-match the live responses. The only
  excluded build file is `staticwebapp.config.json`, which is a deployment
  control file rather than public content.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing/stale Android APK; failing native lint | Fixed: live APK is valid and checksum-matched; clean native tests, lint, and assembly pass. |
| First-permission callback and released-hold recording defects | Fixed: annotated callback, permission/hold native tests, and the native claim pass. |
| Unavailable billing checkout | Truthfully closed: this complete free release advertises no payment or license flow. |
| Missing response headers/cache policy | Fixed: CSP, Permissions Policy, HSTS, nosniff, referrer policy, and the reviewed cache policy are live. |
| Automatic clipboard promise | Removed; manual Copy is tested and works. |
| Missing transcript import/export coverage | Fixed: validated import, duplicate recovery, export, and persistence pass. |
| Small touch targets and 390 px/200% clipping | Fixed: Pixel/browser coverage and fresh phone review pass. |
| Flaky pairing gate | Fixed: all independent claim commands and the full 32-test suite pass. |
| Offline legal routes were promised but untested | Fixed: the declared offline claim opens and reloads all three routes. |
| P1 silent normal-paste truncation | Fixed by `0cc72ed`: live paste preserves the over-limit draft, blocks delivery, and recovers at the exact limit. |

## Known external follow-up

No physical Android handset is attached. A later release-device smoke should
cover the Android permission dialog, installed language pack, haptic, back
gesture, and two-device LAN. Factory billing registration is also external.
Neither is a public claim of this free release, so neither is an untested claim
or a review finding.
