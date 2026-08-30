# Quiet Dictation Bridge — independent verification 5

**Verdict: FAIL**

- Work order: `quiet-dictation-bridge-verify-5`
- Candidate: `73ca58980547fc65bb4f820f4ff1ce09e5a4b1c8`
- URL: <https://quiet-dictation-bridge.sociobot.in/>
- Verified: 2026-08-30 UTC

## Acceptance decision

The deployed web app and APK match the candidate, every declared claim command
passes after the locked install, and the browser bridge works well. The Android
artifact still fails the real first-run job, however. Its native microphone
permission callback is not registered with Capacitor, so a fresh install cannot
complete the permission request needed to start on-device speech. This is a
deterministic P0 in the shipped APK, not the deployment-only failure reported in
earlier work.

No product code was changed. QA began at the exact clean candidate. The only
repository changes are this report and the updated handoff.

## Mandatory first-read and claims gate

The cold live first screen passes the plain-words gate:

- What it does: “Dictate softly from phone to computer.”
- For whom: people whose pain, fatigue, or motor access makes typing difficult
  in shared workspaces.
- First action: **Try it with sample data**, followed by a sentence explaining
  that three received phrases open and saved history stays separate.
- One click opens `/?demo=1`, showing three realistic phrases and the persistent
  “Demo — sample data, nothing is saved to your real history” banner with
  **Reset demo** and **Start for real**.

`.factory/claims.json` exists. On the untouched clean clone, the literal claim
commands initially stopped before test discovery because dependencies had not
yet been installed (`tsc`/`vitest` not found). After the required `npm ci`, all
nine declared commands passed exactly as written:

| Claim | Fresh result |
| --- | --- |
| `private-load` | 2/2 Playwright projects passed |
| `local-delivery` | 2/2 passed |
| `offline-reload` | 2/2 passed |
| `json-import` | 2/2 passed |
| `json-export` | 2/2 passed |
| `demo-isolation` | 2/2 passed |
| `free-release` | 2/2 passed |
| `on-device-speech` | 1 tagged Vitest passed; see P0 because this is only a source-substring test and misses the broken permission callback |
| `phrase-limit` | 1 tagged Vitest passed |

## Clean quality gates

| Check | Fresh result |
| --- | --- |
| Candidate identity | Clean `main` checkout at exact SHA `73ca58980547fc65bb4f820f4ff1ce09e5a4b1c8`; initially equal to `origin/main` |
| Install/security | `npm ci`: 149 packages; `npm audit --omit=dev`: 0 vulnerabilities |
| Unit/integration | `npm test`: 20/20 passed in four files |
| Type/production build | `npm run build`: passed `tsc --noEmit && vite build`; `dist/` produced |
| Full browser suite | `npm run test:e2e`: 22/22 passed across desktop Chromium and the 390 px mobile project |
| Android package | In a separate detached worktree at the candidate, `npm run package:android` passed 185 Gradle tasks: Java unit tests, lint, debug assembly, staging, and final web rebuild |
| Android lint | 0 errors and 20 non-blocking dependency/generated-resource warnings |
| Billing probe | `npm run verify:billing` passed and confirmed the product is not registered; the shipped free release contains no checkout or license flow |
| Repository check | `git diff --check` passed before report changes |

The native toolchain was absent initially, so JDK 21 and Android SDK platform/
build tools 35 were provisioned in the disposable verifier container. The exact
package workflow then passed rather than being waived as an environment limit.

## Independent live product exercise

Fresh Chromium contexts were used rather than relying only on repository tests.

- Desktop and phone pages recovered from empty invitation, malformed invitation,
  empty answer, and malformed answer inputs with actionable messages.
- A corrected WebRTC offer/answer connected in 267 ms. No transcript appeared
  before confirmation. A reviewed phrase arrived in 283 ms and was normalized
  only by trimming outer whitespace.
- An exact 10,000-character phrase arrived intact. A 10,005-character injected
  draft was rejected, retained at full length for editing, and never delivered.
- Two received phrases survived receiver reload. JSON export contained both and
  retained the `Verification 5` session label.
- On a separate 390 px live run, valid import restored two phrases and skipped a
  within-file duplicate; reimport skipped all three duplicates. An invalid
  10,001-character item added nothing. Canceling clear retained both records;
  confirming clear removed them durably.
- Demo mode opened three specific phrases, rejected invalid import, reset to the
  same three phrases, and returned to an empty real-history namespace.
- Manual copy returned the exact 10,000-character phrase. The optional automatic
  copy path has a defect described below.

The container has no attached Android device. Native compilation, tests, lint,
signature, packaged contents, permissions, and framework behavior were checked,
but no claim is made for a physical microphone/language-pack smoke. The static
P0 is sufficient to show that the fresh-install path cannot work as shipped.

## Deployment identity, privacy, and response policy

- All 22 publicly served files from a fresh `dist/` byte-match live, including
  home, legal and 404 documents, all JS/CSS, service worker, manifest, art,
  icons, APK, and checksum. The unknown-route body matches `404.html` and returns
  HTTP 404. This is the candidate deployment.
- The live APK is 10,799,276 bytes and matches the committed SHA-256
  `fc9b46b8b41c9dbc37310e9ded1894cab1411f16159f667437e6d7a5e87706e3`.
  Its sidecar agrees. `apksigner` verifies v1/v2 with an Android debug
  certificate; `unzip -t` passes.
- A clean rebuild is 10,799,273 bytes with the expected different debug-signing
  hash. Its 447 non-`META-INF` entries and complete entry list byte-match the
  committed APK. Embedded `index.html` and `sw.js` match the current build.
- `aapt` reports app ID `in.sociobot.quietdictationbridge`, min SDK 23,
  target/compile SDK 35, and only Internet, microphone, vibration, and the
  scoped AndroidX receiver permission.
- The complete first-load, demo, pairing/send, import, export, persistence, and
  error-recovery request logs contained only
  `https://quiet-dictation-bridge.sociobot.in`. There are no analytics, CDN,
  speech-cloud, billing, STUN/TURN, or application-relay requests.
- Live headers include a same-origin-only CSP, microphone-only Permissions
  Policy, HSTS, `nosniff`, and strict-origin referrer policy. Hashed JS/CSS and
  art use one-year immutable caching; `sw.js` and the APK revalidate; the
  manifest has the correct MIME type and five-minute revalidation. A conditional
  hashed-asset request returned 304.
- This static release exposes no product server endpoint and makes no unlock
  call, so the API 429/`Retry-After` requirement is not applicable. It has no
  sign-in flow.

## Accessibility, responsive behavior, PWA, and performance

- At 1440 px and 390×844, home, demo, privacy, terms, and the styled 404 each
  have `lang=en`, one H1, one main landmark, no normal-size horizontal overflow,
  and zero axe serious/critical findings.
- Normal routes produced zero console/page errors. Chromium logs the expected
  failed-document diagnostic when deliberately navigating to the HTTP 404.
- Keyboard Tab first reaches the visible skip link. Its normal focused style is
  a 3 px mint outline, and Enter opens the selected device role. Effective touch
  targets are at least 44 px; the 19×22 checkbox is contained by its 320×96
  clickable label.
- Reduced motion computes animations and transitions to 0.01 ms.
- Offline reload in a fresh service-worker context retained the app H1 and
  displayed the offline state. In an ephemeral candidate-build copy, a forced
  v4→test-v5 service-worker change displayed the update prompt, waited for
  **Update now**, claimed and reloaded the page, and deleted v4 caches without
  console errors.
- Initial main JS is 25,970 bytes (9.22 kB gzip), shared JS is 711 bytes, CSS is
  15,846 bytes (4.34 kB gzip), there are no web fonts, and the mobile hero is
  14,210 bytes.
- Live Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, CLS 0, TBT 40 ms, 63 KiB total
  transfer.

## Defects

### P0 — a fresh Android install cannot complete microphone permission

`LocalSpeechPlugin.start()` calls:

```java
requestPermissionForAlias("microphone", call, "startAfterPermission");
```

but `startAfterPermission(PluginCall)` has no `@PermissionCallback` annotation
and the class does not import that annotation. `javap -v` of the freshly built
class confirms the method has no runtime-visible annotation.

Capacitor 7 registers permission launchers only for methods annotated with
`PermissionCallback` (`Plugin.java` lines 121–128). When the named launcher is
absent, its own implementation rejects the call with “There is no
PermissionCallback method registered…” (`Plugin.java` lines 548–560). Every
fresh install begins without `RECORD_AUDIO`; pressing and holding therefore
cannot complete the permission flow or reach
`createOnDeviceSpeechRecognizer`. A person could only bypass this by manually
granting microphone access in Android settings.

The declared `@claim:on-device-speech` test is a false positive: it checks for
source substrings such as `requestPermissionForAlias` but never verifies that
the callback is annotated/registered or executes the fresh-permission path.

Required fix: import `com.getcapacitor.annotation.PermissionCallback`, annotate
the callback, add a native regression that asserts callback registration and
grant/deny/release behavior, rebuild the APK, and run a fresh-install Android
12+ permission/on-device-recognition smoke.

### P1 — advertised automatic clipboard copy fails in a fresh browser

With a fresh live Chromium profile, enabling **Auto-copy new phrases** and
receiving a phrase left `clipboard-write` at `prompt` and produced “Phrase
received · choose Copy to use it,” even while the receiver document had focus.
The remote message is not a user gesture, so `navigator.clipboard.writeText`
is rejected under default permissions. Manual **Copy** works, but the included
feature list still promises “Automatic clipboard copy” and gives no setup or
permission recovery path.

Required fix: either provide and test a viable permission/setup flow with a
clear fallback, or remove the automatic-copy promise and control.

### P2 — 200% text sizing clips the 390 px home page

At 390 px with the root text size increased to 200%, the home document expands
to 423 px and the overflow-hidden hero contains a roughly 549 px-wide heading.
The screenshot visibly cuts off the headline and action text. Privacy and Terms
remain at 390 px under the same test.

Required fix: give grid children `min-width: 0`, make hero/pricing widths and
type clamps robust to enlarged text, then add a 390 px / 200% regression.

### P2 — the claims inventory does not cover all published promises

The live page/README make testable or reliance-bearing statements not listed as
their own claims, including “Nothing listens until you press,” local tone and
haptic feedback, pairing-code clearing on reload, and automatic clipboard copy.
“All future Quiet Kit updates” is an untestable future promise. The supplied
claims contract requires each such statement to have an observable tagged test,
or to be removed. The automatic-copy and native-permission misses demonstrate
why source-presence assertions are insufficient.

## Recommendation

**Do not accept or release candidate
`73ca58980547fc65bb4f820f4ff1ce09e5a4b1c8`.** The deployment is healthy and
the typed browser bridge is strong, but the advertised Android first-run
dictation path—the core job in the researched brief—is broken in the shipped
APK.
