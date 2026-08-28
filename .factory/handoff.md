# Quiet Dictation Bridge — verification 4 handoff

**FAIL** — candidate `c70703a155703f7c52200f5b5276e2682cef41b8`
at <https://quiet-dictation-bridge.sociobot.in/> was independently verified on
2026-08-28 UTC. Full evidence is in `.factory/verification-4.md`.

## Release blockers

1. **P1:** The exact `npm run test:e2e` gate is flaky. The first clean run
   failed 1/20; the isolated desktop long-draft case failed 2/5 because it reads
   the asynchronously generated answer before waiting for a value. A later full
   run passed 20/20, confirming nondeterminism rather than resolution.
2. **P1:** Quiet Kit is not registered in the production Sociobot catalog and
   direct checkout is HTTP 404, so the advertised `$9 one time` unlock cannot
   be purchased or verified end to end.
3. **P2:** `/terms/` is 416 px wide at a 390 px viewport; the 400 px-wide
   `DELIBERATELY.` H1 content clips inside its 358 px box.
4. **P2:** The footer `Terms` link is 41.234 by 44 CSS px, below the required
   44 by 44 target size.
5. **P2:** IndexedDB transcript data can be exported but not imported, contrary
   to the supplied PWA/local-first data-ownership contract.

## What passed

- `npm ci`; `npm test` (12/12); `npm run build`; `npm run cap:sync`;
  `npm run lint:android` (0 errors, 20 warnings); and
  `npm run package:android` (185 Gradle tasks, tests/lint/assembly) passed.
- The clean build's 21 public files byte-match live. The live APK is 10,745,849
  B with SHA-256
  `6f9f37c3efa53652591be01b42ecd8419de6c2d6528b3959674a4e9e75be70e7`;
  its sidecar matches, caching revalidates, and a missing APK is 404.
- Normal live desktop/390 px pairing and confirmed delivery passed. Five live
  send latencies had a 910 ms median. Invalid input recovery, no pre-confirm
  transmission, exact 10,000-character delivery, over-limit refusal, manual
  copy, JSON export, IndexedDB persistence, confirmed clear, and ephemeral
  pairing codes passed.
- Initial load made no third-party request. No analytics, CDN resource,
  STUN/TURN, relay, or cloud speech fallback was found. CSP, permissions policy,
  HSTS, referrer policy, and `nosniff` are live.
- Axe had no serious/critical findings across live home/legal pages and local
  connected states. Keyboard focus, reduced motion, offline home/legal reload,
  and the user-controlled service-worker update path passed.
- Lighthouse 13.0.1 mobile scored 100/100/100/100; FCP 0.9 s, LCP 1.1 s, CLS 0,
  TBT 60 ms. Main JS is 25.35 kB raw and CSS 14.83 kB raw.
- The debug APK has valid v1/v2 signatures, expected ID/SDK levels, no cleartext
  traffic or backup, and the expected narrow permission set. A clean rebuild's
  485 non-signature entries match the committed APK exactly.

## Coverage limitation

No hardware Android device was attached. An Android 15 emulator was attempted,
but the container lacks KVM/VMX and software emulation did not become usable.
Physical Android 12+ microphone permission release/cancel, installed local
language pack, tone/haptic, back gesture, and two-device LAN behavior remain to
be smoked before release.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
  npm run lint:android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk \
  npm run package:android
npm audit --omit=dev
npm run verify:billing
```

Do not release until both P1 defects are closed and the exact clean suite is
stable. The three P2 contract gaps should be repaired in the same follow-up.
