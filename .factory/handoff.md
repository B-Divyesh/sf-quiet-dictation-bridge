# Quiet Dictation Bridge — repair 7 handoff

## Result

The strict-review P1 is fixed in implementation commit
`0cc72ed2d108997ac2f722ed592293f0a1159dd5` and deployed at
<https://quiet-dictation-bridge.sociobot.in/>.

A normal Ctrl+V paste no longer loses text at 10,000 characters. The draft
textarea no longer uses the browser's destructive `maxlength` behavior. A
10,005-character paste remains intact, receives an immediate visible and
screen-reader announcement, is marked invalid, and cannot be sent. After the
user deletes five characters, the exact 10,000-character phrase can be sent.

The tagged `phrase-limit` claim now uses the browser clipboard and keyboard in
two actually paired pages. It proves preservation, warning, rejected delivery,
editing recovery, and exact boundary delivery. The old unit-only tag was
removed; the underlying pure validator still has unit coverage.

The PWA cache was advanced to `quiet-bridge-v6`, and the Android APK was rebuilt
so its embedded web application contains the same repair.

## Verification

Clean checkout: `/tmp/qdb-repair7-clean.Vn1MOy` at the implementation SHA.

- `npm ci`: 149 packages, 0 reported vulnerabilities.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Every one of the 13 literal `.factory/claims.json` commands passed
  independently. The phrase-limit command passed in desktop Chromium and the
  Pixel 5 project using a real 10,005-character clipboard paste.
- `npm test`: 20/20 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 32/32 passed across desktop and Pixel 5 projects.
- `npm run verify:billing`: passed and confirmed no registered offer or
  checkout/license flow is advertised.
- `./gradlew --no-daemon clean test lint assembleDebug`: passed all 185 tasks
  after installing JDK 21 and Android SDK 35.
- An initial native-claim attempt before exporting `ANDROID_HOME` stopped with
  “SDK location not found.” After exporting the installed JDK/SDK paths, the
  exact declared command passed. README now states the required environment.
- `git diff --check`: passed.

The rebuilt debug APK is 10,800,178 bytes. Its SHA-256 is
`06a39fb57bc5e79b18355d2af3436524c22ead2086b10a5efdcb9393fc9e4784`.
`apksigner` verifies v1 and v2 signatures, `unzip -t` reports no archive errors,
and the embedded page has no 10,000-character `maxlength`.

## Deployment and live checks

Azure Static Web Apps deployment
`e8bdf30d-8b55-4552-b604-ae48ed49b47b` succeeded. All 22 public files in the
production build byte-match the live site. The live APK has the committed size
and SHA-256 above.

Fresh Chromium checks against HTTPS showed:

- Desktop 1440×900 and phone 393×727 both start at scroll position zero with
  “Dictate softly from phone to computer,” the intended audience, and visible
  **Try it with sample data** action. Neither viewport overflows horizontally.
- One click opens three realistic sample phrases and the persistent demo label.
  Clear followed by **Reset demo** restores all three. **Start for real** returns
  to empty real history.
- Empty answer, empty invitation, and malformed invitation inputs each show a
  specific recovery message. Correcting the input allows pairing.
- A real Ctrl+V paste retained 10,005 characters. The live warning read “This
  draft has 10,005 characters. Shorten it by 5 before sending.” Confirming was
  refused, the field stayed intact, and the receiver remained empty.
- Removing five characters and confirming delivered exactly 10,000 characters.
  The `Repair 7` session label remained after receiver reload.
- The complete live pairing and boundary flow made no cross-origin request and
  logged no console or page error.
- Home, Privacy, and Terms opened offline in a fresh service-worker context with
  their correct titles and H1s.
- Home, Privacy, Terms, and the styled 404 each have one H1, one main landmark,
  no 390 px overflow, and zero serious or critical axe findings. The unknown
  route returns HTTP 404 as intended.
- Keyboard Tab first focuses the skip link with a 3 px mint outline. Reduced
  motion computes the recording animation to 0.00001 seconds. The 390 px page
  has no horizontal overflow at 200% root text size.
- Security headers include the same-origin CSP, microphone-only Permissions
  Policy, HSTS, `nosniff`, and strict-origin referrer policy.
- The factory URL verifier passed with no console/page errors.
- Live Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 40 ms, 35 KiB total
  transfer. Main JS is 26.19 kB and CSS is 16.39 kB uncompressed.

Evidence is under `/work/.evidence/repair-7/`. The required catalog description
is copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

All earlier findings remain closed: Android artifact/build/lint, native
permission and released-hold behavior, vibration permission, unavailable
checkout advertising, response headers and cache policy, manual copy, import
and export, touch targets, 390 px/200% text, pairing-test stability, offline
legal routes, claims coverage, and the designed HTTP 404.

## Known limits

- No physical Android device is attached. The Android 12+ microphone dialog,
  installed language pack, haptic, back gesture, and two-device LAN still need
  a release-device smoke. Native contract/JVM tests, lint, assembly, package
  contents, and browser-to-browser delivery passed.
- The APK is debug-signed for QA. Release signing must use the factory's
  external keystore; no signing secret is stored here.
- The researched one-time product is not registered by the separate billing
  operator. This repair did not remove a paid deliverable; the existing release
  remains a complete free bridge and makes no checkout or entitlement claim.
- The authoritative copy paths `/work/.evidence/qa-report.md` and
  `/work/.evidence/qa-result.json` were absent in this worker. The complete
  committed `.factory/review-1.md` was read and used as the repair source.
