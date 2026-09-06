# Quiet Dictation Bridge — verification 8 handoff

## Result

Independent verification 8 passed with zero findings and zero untested public
claims. The reviewed implementation is
`0cc72ed2d108997ac2f722ed592293f0a1159dd5`; the verification documentation
commit is `b9646b48ae69ff5ece5fa17a67ddd409c7ccf649`.

The live product is <https://quiet-dictation-bridge.sociobot.in/>. Its normal
Ctrl+V boundary path now preserves a 10,005-character draft, warns and blocks
delivery, then sends the edited exact 10,000-character phrase. This closes the
previous strict-review P1 data-integrity finding.

## Verification

Clean checkout: `/tmp/qdb-verify8-clean.O4SlJV` at the documentation SHA,
containing the implementation candidate.

- `npm ci`: 149 packages, 0 reported vulnerabilities.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Every one of the 13 literal `.factory/claims.json` commands passed
  independently. The phrase-limit command passed with a real clipboard paste,
  rejected delivery, recovery editing, and exact boundary delivery.
- `npm test`: 20/20 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 32/32 passed across desktop and Pixel 5 projects.
- `npm run verify:billing`: passed and confirmed no registered offer or
  checkout/license flow is advertised.
- `./gradlew --no-daemon clean test lint assembleDebug`: passed after installing
  JDK 21 and Android SDK 35 and exporting the README environment variables.
- `git diff --check`: passed.

The downloadable debug APK is 10,800,178 bytes. Its SHA-256 is
`06a39fb57bc5e79b18355d2af3436524c22ead2086b10a5efdcb9393fc9e4784`.
The clean Android build and the live APK/checksum verification passed.

## Deployment and live checks

All 23 public payload files in a fresh production build byte-match the live
site. `staticwebapp.config.json` is intentionally excluded because it is a
deployment control file and the server correctly does not expose it. The live
APK has the committed size and SHA-256 above.

Fresh Chromium checks against HTTPS showed:

- Desktop 1440×900 and phone 393×727 both start at scroll position zero with
  “Dictate softly from phone to computer,” the intended audience, and visible
  **Try it with sample data** action. Neither viewport overflows horizontally.
- One click opens three realistic sample phrases and the persistent demo label.
  **Reset demo** restores all three. **Start for real** returns to empty real
  history.
- Empty answer, empty invitation, and malformed invitation inputs each show a
  specific recovery message. Correcting the input allows pairing.
- A real Ctrl+V paste retained 10,005 characters. The live warning read “This
  draft has 10,005 characters. Shorten it by 5 before sending.” Confirming was
  refused, the field stayed intact, and the receiver remained empty.
- Removing five characters and confirming delivered exactly 10,000 characters.
  The `Verification 8` session label remained after receiver reload.
- The complete live pairing and boundary flow made no cross-origin request and
  logged no console or page error.
- Home, Privacy, and Terms opened offline in a fresh service-worker context with
  their correct titles and H1s.
- Home, Privacy, Terms, and the styled 404 each have one H1, one main landmark,
  no 390 px overflow, and zero serious or critical axe findings. The unknown
  route returns HTTP 404 as intended.
- Keyboard Tab first focuses the skip link with a 3 px mint outline. Reduced
  motion computes the recording animation to 0.00001 seconds. The live 393 px
  page has no horizontal overflow; the clean Pixel suite passes the 200% text
  regression.
- Security headers include the same-origin CSP, microphone-only Permissions
  Policy, HSTS, `nosniff`, and strict-origin referrer policy.
- The factory URL verifier passed with no console/page errors.
- The most recent live Lighthouse record remains 100 Performance, 100
  Accessibility, 100 Best Practices, and 100 SEO. The fresh build's main JS is
  26.19 kB and CSS is 16.39 kB uncompressed.

Evidence is under `/work/.evidence/verify-8/`.

## Earlier findings

All earlier findings remain closed: Android artifact/build/lint, native
permission and released-hold behavior, vibration permission, unavailable
checkout advertising, response headers and cache policy, manual copy, import
and export, touch targets, 390 px/200% text, pairing-test stability, offline
legal routes, claims coverage, designed HTTP 404, and normal-input silent
phrase truncation. See `.factory/verification-8.md` for evidence and each
finding's disposition.

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
- The external factory billing registration remains a separate operator task.
