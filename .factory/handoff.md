# Quiet Dictation Bridge — verification 5 handoff

**Result: FAIL**

- Work order: `quiet-dictation-bridge-verify-5`
- Tested candidate: `73ca58980547fc65bb4f820f4ff1ce09e5a4b1c8`
- Tested URL: <https://quiet-dictation-bridge.sociobot.in/>
- Date: 2026-08-30 UTC
- Full report: `.factory/verification-5.md`

## Release blocker

The shipped Android plugin names `startAfterPermission` as its microphone
permission callback but does not annotate it with Capacitor’s required
`@PermissionCallback`. Capacitor therefore does not register the launcher and
rejects the first permission request. A fresh install cannot reach on-device
speech unless the user manually grants microphone access in Android settings.
The passing `@claim:on-device-speech` test checks source strings and misses this
runtime contract.

## Other defects

- P1: **Auto-copy new phrases** fails under a fresh browser profile; the received
  phrase is stored but the UI falls back to manual **Copy** while
  `clipboard-write` remains `prompt`.
- P2: at 390 px with text enlarged to 200%, the home page widens to 423 px and
  the overflow-hidden hero clips its approximately 549 px-wide heading/actions.
- P2: published behavior claims are absent from `.factory/claims.json`, and
  “All future Quiet Kit updates” is not testable. See the report for the exact
  inventory.

## Fresh passing evidence

- First-read and one-click demo gates pass.
- After `npm ci`, all nine exact `.factory/claims.json` commands pass.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm test`: 20/20 passed.
- `npm run build`: passed; `dist/` produced.
- `npm run test:e2e`: 22/22 passed on desktop and 390 px mobile.
- Detached clean `npm run package:android`: 185 Gradle tasks passed, including
  native tests, lint, debug assembly, artifact staging, and final build.
- The fresh APK has the same 447 non-signature entries as the committed APK.
  Live and committed APKs are both 10,799,276 bytes with SHA-256
  `fc9b46b8b41c9dbc37310e9ded1894cab1411f16159f667437e6d7a5e87706e3`;
  v1/v2 signatures and archive integrity verify.
- All 22 deployable files byte-match live. Normal routes have zero browser
  errors, all observed product requests are same-origin, security/cache headers
  are correct, offline reload and a forced service-worker update pass.
- Live two-page WebRTC pairing, invalid-input recovery, exact 10,000-character
  delivery, 10,005-character rejection, import/deduplication, export,
  persistence, clear cancellation/confirmation, and demo isolation pass.
- Axe found zero serious/critical issues at desktop and 390 px on home, demo,
  privacy, terms, and 404. Lighthouse mobile scores 100/100/100/100 with
  FCP/LCP 1.1 s, CLS 0, TBT 40 ms, and 63 KiB transfer.

## Reproduce

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
npm run test:e2e
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/tmp/qdb-android-sdk \
  ANDROID_SDK_ROOT=/tmp/qdb-android-sdk \
  npm run package:android
npm run verify:billing
```

No product code was modified. A physical Android microphone/language-pack run
was not available in this container; the deterministic permission-registration
failure already blocks release.
