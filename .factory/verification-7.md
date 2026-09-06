# Verify private phone-to-computer dictation

**Verdict: PASS**

- Work order: `quiet-dictation-bridge-verify-7`
- Implementation candidate: `221d7f9be4bf71d9e6fb45d64fffab1addbefe10`
- Documentation reviewed: `c108386455c8da3d38063f23c61f8f8221446700`
- Live URL: <https://quiet-dictation-bridge.sociobot.in/>
- Verified: 2026-09-06 UTC
- Findings: 0
- Untested public claims: 0

## Acceptance decision

The implementation candidate passes independent verification. All 13 declared
claim commands pass from the clean setup, including offline home, Privacy, and
Terms opening and reloading in fresh service-worker contexts. The full web
suite passes 32/32, the Android clean test/lint/debug build passes, and all 22
public payload files byte-match the live site.

No product code was changed. This work order adds only verification and handoff
documentation.

## What the first screen says

Before scrolling, fresh desktop and 390 px phone browsers both showed:

- Job: “Dictate softly from phone to computer.”
- Audience: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**. The adjacent text says it opens
  three received phrases and keeps saved history separate.

The action was inside the initial viewport on both sizes. The page title was
“Quiet Dictation Bridge — private phone-to-desktop dictation”. Each page had
one H1 and one main landmark.

## Candidate and live identity

Implementation `221d7f9` changes only the offline claim inventory, catalog
description, and tagged browser test from the last implementation. Documentation
commit `c108386` records that repair. The later documentation commit does not
change the product image.

A fresh production build produced 22 public payload files plus two deployment
control files. Every public payload byte-matched the live response. The Azure
Static Web Apps control file correctly returns the designed 404 rather than
being exposed as product content.

The live and committed APK match SHA-256
`e7dfbb7ef7858c1e983429d996c7ad23fceafe5d687ae998a5da8e3d2e1c6254`.
`apksigner` verifies v1 and v2 signatures. `aapt` reports application ID
`in.sociobot.quietdictationbridge`, min SDK 23, target SDK 35, and only Internet,
microphone, vibration, and AndroidX's scoped receiver permission.

## Declared claims

After `npm ci`, each literal command from `.factory/claims.json` ran
independently. All passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `private-load` | Pass | Both browser projects; same-origin requests only. |
| `local-delivery` | Pass | Both projects paired two pages and delivered the exact confirmed phrase without an HTTP relay. |
| `offline-reload` | Pass | Both projects opened and reloaded home, Privacy, and Terms offline in their own fresh contexts. |
| `json-import` | Pass | Valid restore persisted; duplicates and invalid files were rejected as specified. |
| `json-export` | Pass | The downloaded JSON contained all three visible sample phrases. |
| `demo-isolation` | Pass | Real history survived demo clear/reset unchanged in both projects. |
| `free-release` | Pass | No payment/license flow; APK checksum, session label, and three tones present. |
| `manual-copy` | Pass | Clipboard matched the exact selected phrase only after **Copy**. |
| `press-to-listen` | Pass | Instrumented recognition started on keyboard hold and stopped on release. |
| `confirmation-feedback` | Pass | Selected tone and haptic occurred before data-channel send. |
| `pairing-memory` | Pass | Reload cleared codes and restored both roles to unpaired state. |
| `on-device-speech` | Pass | Native contract and permission/hold JVM tests passed. |
| `phrase-limit` | Pass | A 10,005-character draft was retained and rejected without delivery. |

The verifier image initially had no Java or Android SDK. JDK 21 and Android SDK
35 were installed as README prerequisites. The first native attempt after
installation, but before exporting the standard SDK path, reported “SDK
location not found”. With `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT`
set to the installed tools, the declared npm script passed. The failed setup
attempt is not hidden or counted as product evidence.

## Clean quality gates

| Check | Result |
| --- | --- |
| `npm ci` | 149 packages installed; 0 reported vulnerabilities. |
| `npm audit --omit=dev` | 0 vulnerabilities. |
| `npm test` | 20/20 passed in four files. |
| `npm run build` | Type check and Vite production build passed; `dist/` produced. |
| `npm run test:e2e` | 32/32 passed across desktop Chromium and Pixel 5 projects. |
| `npm run verify:billing` | Passed; product is unregistered and the release advertises no checkout/license flow. |
| Android | `./gradlew --no-daemon clean test lint assembleDebug` passed 185 executed tasks. |
| Repository | Clean after tests; `git diff --check` passed. |

## Independent live exercise

Fresh desktop and phone contexts used the one-click sample. Both showed three
realistic phrases and the persistent “Demo — sample data, nothing is saved to
your real history” banner. Clearing the sample produced an empty state, **Reset
demo** restored all three phrases, and **Start for real** returned to empty real
history. Demo data used `demo:quiet-dictation-bridge`; no real transcript was
changed.

Two fresh live pages recovered from empty and malformed invitation and answer
codes with specific next-step messages. They then paired successfully. The
phrase “Verification 7: send the revised access note after the 2:30 review.”
did not appear before confirmation, arrived with the persistent `Verification
7` session label, copied exactly after **Copy**, and survived receiver reload.
Reload also cleared the temporary pairing codes. A 10,005-character draft was
kept for editing, produced the 10,000-character limit message, and was not sent.
The complete flow made no cross-origin request and logged no browser error.

The static product has no backend, account, tenant, health endpoint, or product
API, so tenant isolation, server restart persistence, and 429/`Retry-After`
checks do not apply. Transcript persistence is local IndexedDB and was checked
across reloads.

## Accessibility, privacy, offline, links, and performance

- The factory URL verifier passed HTTPS 200, title, `lang=en`, one H1, one main,
  complete image alt handling, labelled buttons, and zero console/page errors.
- Live Playwright axe checks found zero serious or critical issues on home,
  Privacy, and Terms. The passing project suite also covers legal and 404 pages.
- Tab first focused the skip link. Its live focus ring was a 3 px mint outline.
  Keyboard role activation and hold-to-listen behavior passed in the suite.
- At 390 px, the home and legal pages had no horizontal overflow. A live 200%
  root-text check kept the H1 within the 390 px viewport. Touch-target checks
  passed in the full suite.
- Reduced motion computed the recording animation to `0.00001s` and scrolling
  to `auto`.
- Fresh live service-worker use reloaded home, Privacy, and Terms offline with
  their correct titles and H1s. An isolated version change showed **Update
  now**, reloaded only after that action, and removed the old caches.
- Every link from home, Privacy, and Terms returned 200, including the APK,
  checksum, demo, manifest, and source repository.
- Privacy and Terms return 200 with route-specific titles. An unknown route
  returns the designed page with HTTP 404, one main landmark, and links home.
  Chromium's failed-resource message for that deliberate 404 is expected, not
  a product error.
- Live headers include a same-origin CSP, microphone-only Permissions Policy,
  HSTS, `nosniff`, and strict-origin referrer policy. Hashed assets are immutable;
  the service worker and APK revalidate.
- Lighthouse 13 mobile scored 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. FCP was 1.0 s, LCP 1.1 s, CLS 0, TBT 0 ms, and total
  transfer 63 KiB. Main JS is 25,767 bytes and CSS is 16,136 bytes.

Evidence is under `/work/.evidence/verify-7/`, including desktop/phone sample
screenshots, factory URL-verifier output, and Lighthouse JSON.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing/stale Android artifact and failed Android lint | Fixed: the committed/live APK is valid and clean native test, lint, and assembly pass. |
| Android permission callback and released-idle recording defects | Fixed: callback reflection, permission outcomes, hold session, and clean native tests pass. |
| Staging or unavailable paid checkout | Fixed honestly: the free release has no checkout or license request while factory registration is unavailable. |
| Missing response headers and wrong cache policy | Fixed: live security and cache headers match the stated policy. |
| Silent phrase truncation | Fixed: over-limit text is retained, explained, and not sent. |
| Small touch targets and 390 px/200% text clipping | Fixed: live checks and browser regressions pass. |
| Missing vibration permission | Fixed: APK manifest includes `android.permission.VIBRATE`. |
| Flaky browser pairing gate | Fixed: full suite and repeated independent claim/pairing runs pass. |
| Missing JSON import | Fixed: restore, duplicate, invalid-file, and persistence paths pass. |
| Automatic clipboard promise failed without a gesture | Fixed: the promise/control were removed; manual copy is tested and works. |
| Public claims were missing from the inventory | Fixed: 13 claims cover the current reliance-bearing copy. |
| Offline legal pages were promised but not tested | Fixed: `@claim:offline-reload` now opens and reloads home, Privacy, and Terms offline in fresh contexts. |

## Remaining external checks

No physical Android device is attached to this worker. A release-device smoke
for the Android permission dialog, installed language pack, haptic, back
gesture, and two-device LAN remains useful operational follow-up. The native
claim itself is covered by build, contract, reflection, permission, and hold
tests, so this is not an untested declared claim.

Factory billing registration also remains external. The current release makes
and tests the narrower truthful claim that it is free and requests no payment.

## Decision

**PASS.** There are zero findings of every severity and zero untested public
claims for implementation candidate `221d7f9be4bf71d9e6fb45d64fffab1addbefe10`.
