# Verify private phone-to-computer dictation

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-verify-6`
- Implementation candidate: `ba961f7e5bf274086a0526705c31da4139c04cc5`
- Live URL: <https://quiet-dictation-bridge.sociobot.in/>
- Verified: 2026-09-05 UTC
- Findings: 1
- Untested public claims: 1

## What the first screen says

Before scrolling, fresh desktop and phone browser contexts both showed:

- Job: “Dictate softly from phone to computer.”
- Audience: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**. It says that three received
  phrases will open and saved history remains separate.

The title is “Quiet Dictation Bridge — private phone-to-desktop dictation”.
Both contexts had a visible first-tab skip link, one H1, one main landmark, no
horizontal overflow, no console/page errors, and no cross-origin requests.

## Independent live exercise

Fresh Chromium desktop and Pixel 5 contexts were used against the live URL.

- One click on **Try it with sample data** opened `?demo=1` with three
  realistic phrases, the persistent “Demo — sample data, nothing is saved to
  your real history” label, **Reset demo**, and **Start for real**. Reset
  restored the three phrases. Leaving demo returned to empty real history.
  IndexedDB showed the separate `demo:quiet-dictation-bridge` namespace.
- Empty and malformed invitation paths gave actionable recovery messages.
- Two fresh live pages completed offer/answer pairing. A reviewed phrase,
  `Independent live QA: review before sharing a short meeting note.`, arrived
  only after confirmation. Choosing **Copy** returned that exact phrase from
  the clipboard. The pairing/send flow made no cross-origin request and had no
  browser errors.
- Fresh service-worker contexts reloaded home, Privacy, and Terms offline.
  The home offline banner appeared. Reduced motion computed the talk-ring
  animation to `1e-05s`.
- At 390 px, Privacy and Terms each returned 200 with their own titles and H1s
  and no overflow. An unknown route returned the designed page with HTTP 404;
  this is expected behavior, not a defect.
- The factory `verify-url.sh` check passed: title, `lang=en`, H1, main,
  complete image alt handling, labelled buttons, and zero browser errors.
  The standalone axe CLI could not create a Chrome session in this container;
  the project's Playwright axe integration ran in the passing 32-test suite.

## Candidate, deployment, and artifact identity

`npm run build` produced 22 deployable files. All 22 byte-matched the live
deployment. The live response has a same-origin CSP, microphone-only
Permissions Policy, HSTS, `nosniff`, strict-origin referrer policy, immutable
hashed assets, and a real HTTP 404 response.

The committed and live Android APK SHA-256 is
`e7dfbb7ef7858c1e983429d996c7ad23fceafe5d687ae998a5da8e3d2e1c6254`.
The sidecar matched it. `apksigner` verified v1/v2 signatures and `unzip -t`
reported no archive errors. `aapt` reports application ID
`in.sociobot.quietdictationbridge`, min SDK 23, target/compile SDK 35, and only
Internet, microphone, vibration, and AndroidX's scoped receiver permission.

## Clean commands and declared claims

After `npm ci`, production audit reported zero vulnerabilities. `npm test`
passed 20/20, `npm run build` passed, `npm run test:e2e` passed 32/32, and
`npm run verify:billing` passed while correctly reporting no registered paid
product and no checkout/license flow.

All 13 literal commands declared by `.factory/claims.json` were run from the
clean setup and passed. The Android claim was repeated after installing JDK 21
and Android SDK 35: its Vitest contract passed and the two native permission/
hold test classes passed. The remaining twelve browser/unit claim commands
passed in their isolated declared test runs.

| Claim | Result |
| --- | --- |
| `private-load` | Pass |
| `local-delivery` | Pass |
| `offline-reload` | Pass, but incomplete for the README wording below |
| `json-import` | Pass |
| `json-export` | Pass |
| `demo-isolation` | Pass |
| `free-release` | Pass |
| `manual-copy` | Pass |
| `press-to-listen` | Pass |
| `confirmation-feedback` | Pass |
| `pairing-memory` | Pass |
| `on-device-speech` | Pass |
| `phrase-limit` | Pass |

With documented Android prerequisites installed, direct
`./gradlew --no-daemon clean test lint assembleDebug` completed successfully:
185 actionable tasks, 149 executed and 36 up-to-date. This includes native
unit tests, lint, and debug assembly.

## Earlier findings and their current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing Android artifact, stale APK deployment, and Android lint failure | Fixed: live APK exists, matches the candidate/hash, package metadata is valid, and clean Gradle lint/build pass. |
| Android fresh-permission callback missing | Fixed: compiled `LocalSpeechPlugin.startAfterPermission` has the runtime `@PermissionCallback`; native reflection and hold-session tests pass. |
| Automatic clipboard copy could fail without a user gesture | Fixed: the control and promise are removed; the tested manual Copy action works. |
| 390 px 200% text overflow and undersized footer target | Fixed: browser suite covers the enlarged-text layout and 44 px target dimensions; live 390 px checks passed. |
| Missing transcript import, phrase truncation, and flaky pairing test | Fixed: import/export and 10,000-character rejection tests pass; the full suite passed 32/32. |
| Advertised unavailable paid checkout | Fixed honestly: this free release advertises no paid option, checkout, or license request; the billing probe confirms the product is not registered. |
| Earlier broad claims inventory gap | Partially fixed by the 13 declared claims, but the finding below remains. |

## Finding

### P2 — README’s offline legal-page promise is not covered by its declared claim test

`README.md` promises: “Works offline after the first successful load,
including the legal pages.” The declared `offline-reload` claim is instead
“The app shell works offline after the first successful visit,” and its tagged
test only reloads `/`. It never navigates to `/privacy/` or `/terms/` offline.

My independent live test shows both legal pages do work offline. This is not a
runtime failure. It is still an incomplete claim test for a public,
reliance-bearing promise, which the claims contract requires to be covered by
the declared command. Add the legal routes to the tagged offline claim test or
narrow the README sentence. Until then this is one untested public claim.

## Remaining hardware limit

No physical Android device was attached. Native compilation, permissions,
callback registration, package contents, signature, and JVM behavior were
verified. A physical Android 12+ microphone/language-pack, haptic, back
gesture, and two-device LAN smoke remains outside this container.

## Decision

**FAIL.** The live product and artifact are healthy in the checks above, but
acceptance requires zero findings and zero untested public claims. This report
has one P2 claim-coverage finding and one untested public claim.
