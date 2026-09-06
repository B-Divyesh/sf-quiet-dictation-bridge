# Review: Verify private phone-to-computer dictation

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-review-1`
- Implementation candidate: `221d7f9be4bf71d9e6fb45d64fffab1addbefe10`
- Documentation reviewed: `85720591bdf5b28bd306011fcd31fa2ed4a6f113`
- Live URL: <https://quiet-dictation-bridge.sociobot.in/>
- Reviewed: 2026-09-06 UTC
- Findings: 1
- Untested public claims: 0

## Decision

**FAIL.** The 10,000-character phrase claim is false on the normal live input
path. Pasting 10,005 characters into the phone review field silently leaves
10,000 characters and **Confirm & send** delivers that shortened phrase. The
user receives neither the promised limit message nor a chance to edit the
missing characters. This is a P1 data-integrity defect in the core dictation
job.

All declared command tests pass, but the tagged boundary test bypasses the
browser's normal input behavior. A passing command cannot make this observed
public claim true.

## First screen before scrolling

Fresh desktop (1440×900) and phone (393×727) browser contexts opened the live
home page at scroll position zero.

- Job: “Dictate softly from phone to computer.”
- Audience: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**. It was in the initial viewport;
  the adjacent text says the sample opens three received phrases and keeps
  saved history separate.

The title was “Quiet Dictation Bridge — private phone-to-desktop dictation”.
The page had one H1 and one main landmark in both contexts.

## Finding

### P1 — a pasted over-limit phrase is silently shortened and sent

The public `phrase-limit` claim says: “A confirmed phrase is limited to 10,000
characters and is never silently trimmed.” README makes the same promise: an
over-limit draft is refused and left in place for editing.

On the live paired phone and desktop flow, normal Playwright `fill()` input of
10,005 `a` characters into `#draft-text` resulted in a 10,000-character field.
Choosing **Confirm & send** then cleared the field, delivered one transcript,
and left `#bridge-alert` empty. This is the normal paste/input path a visitor
uses, not a source-level probe.

`index.html` gives the textarea `maxlength="10000"`. The tagged test avoids
that browser path by assigning a 10,005-character value directly through
`locator.evaluate()` and dispatching `input`; validation then sees the larger
value and passes. It therefore proves only the programmatic invalid-state
branch, not the normal user paste boundary.

Repair the input behavior so an over-limit paste remains available for editing
and produces the limit message without delivery (or otherwise give an explicit
pre-send warning that preserves the original text). Replace the claim test
with a genuine user paste/input test that proves the repaired outcome.

## What passed

- A fresh clone at `221d7f9` completed `npm ci` (149 packages, 0 reported
  vulnerabilities), `npm audit --omit=dev`, `npm test` (20/20), `npm run
  build`, and `npm run verify:billing`.
- All 13 literal commands in `.factory/claims.json` passed independently in
  the clean checkout, including both browser projects and the native
  on-device-speech claim. This means there are zero *untested* claims; the
  phrase-limit command is inadequate evidence for the false public promise.
- `npm run test:e2e` passed 32/32 across desktop Chromium and Pixel 5.
- After installing the README prerequisites (JDK 21 and Android SDK platform
  35), `./gradlew --no-daemon clean test lint assembleDebug` passed.
- Live two-page pairing recovered from an empty invitation with “Paste the
  invitation from your computer first.” and an invalid code with “That is not
  a valid offer code. Copy the entire code and try again.” A valid exchange
  created 864-character offer/answer codes and reached “Phone connected ·
  encrypted local link”.
- A live phrase reached the desktop only after confirmation, retained the
  `Review 1` session label, and persisted across receiver reload. Reload
  cleared both pairing codes and returned to “Ready to create a private
  invitation”. The live flow recorded no console/page errors and no
  cross-origin requests.
- In fresh live desktop and phone contexts, the one-click sample showed three
  realistic phrases and the persistent “Demo — sample data, nothing is saved
  to your real history” label. **Reset demo** restored all three phrases;
  **Start for real** returned to empty real history.
- Home, Privacy, and Terms returned 200 with the expected CSP, HSTS,
  microphone-only Permissions Policy, nosniff, and strict-origin referrer
  policy. An unknown route returned the designed page with HTTP 404.
- The production build has 24 files. Twenty-two public payloads and the
  deployment `_headers` file byte-match live. `staticwebapp.config.json`
  correctly returns the designed 404 rather than being served as a file.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing/stale Android artifact and Android lint failure | Fixed: clean native test, lint, and debug assembly pass. |
| Android permission callback and released-idle recording defects | Fixed by native contract/JVM coverage; the native claim command passes. |
| Paid checkout was unavailable | Fixed honestly: this free release requests no payment or license. |
| Missing response headers and cache policy | Fixed: required response headers are live. |
| Automatic clipboard promise failed without a gesture | Fixed: the promise/control was removed; manual copy is tested. |
| Missing JSON import | Fixed: import validation, duplicates, and persistence are covered. |
| Small touch targets and 390 px/200% clipping | Fixed by the browser suite. |
| Flaky pairing browser gate | Fixed: all independent claim commands and 32/32 suite pass. |
| Offline legal-page promise was untested | Fixed: the `offline-reload` claim covers home, Privacy, and Terms. |
| Silent phrase truncation | **Regressed/not fixed on normal input:** this review's P1 finding shows an over-limit paste is silently shortened and sent. |

## External follow-ups

No physical Android device is attached, so a release-device smoke for the
Android permission dialog, installed language pack, haptic, back gesture, and
two-device LAN remains operational follow-up. It is not counted as an untested
declared claim because the native command and clean build passed. Factory
billing registration also remains external; the current release truthfully
makes no paid offer.
