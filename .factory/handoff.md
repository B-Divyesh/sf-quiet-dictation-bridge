# Quiet Dictation Bridge — repair 2 handoff

Work order: `quiet-dictation-bridge-repair-2`
Verifier report: `51d1c409b6fdcc8e89d11dc1588a3111ff172f62`
Failed candidate: `942eda2f6d957cedb4b5f84a52e3906846fd17bd`
Date: 2026-08-28

## Repairs

### P0 — Android artifact was absent from static deployment

- Added the real debug APK and standard SHA-256 sidecar to
  `public/download/`, the static build source. A plain `npm run build` now
  always copies both into `dist/download/`; deployment no longer depends on an
  ignored artifact left in a prior `dist/` directory.
- Replaced the shell-only packaging command with a failure-safe Node workflow.
  It temporarily excludes the prior APK from Capacitor's embedded web assets,
  runs a clean Capacitor sync plus Gradle unit tests and debug assembly,
  restores the prior artifact if native packaging fails, validates the new ZIP
  signature/size, writes its checksum, and rebuilds the static package.
- The packaging workflow discovers the worker's `/opt/android-sdk` when SDK
  environment variables are unset. The installed native app hides the website's
  self-download section.
- Azure Static Web Apps now excludes both `.apk` and `.sha256` paths from SPA
  fallback and declares `application/vnd.android.package-archive` and
  `text/plain` MIME types. Unit and browser regressions verify a real ZIP-format
  APK larger than 1 MB and an exact checksum.

Final artifact:

- File: `quiet-dictation-bridge-debug.apk`
- Size: 10,745,000 bytes
- SHA-256: `ed16aabdae6055174df0ca476a4dc0de9e16996c69261fcbeb3b50407608335e`
- Application ID: `in.sociobot.quietdictationbridge`
- Target SDK: 35; debug signature verified with APK Signature Scheme v1/v2

### P1 — unregistered checkout was advertised as usable

- The repository is contractually not allowed to create billing products or
  modify the payment provider. The production Sociobot catalog still does not
  contain `quiet-dictation-bridge`; direct checkout therefore remains an
  external HTTP 404.
- The product no longer opens that unavailable route. The purchase button checks the
  public production catalog only after explicit activation and navigates only
  when this exact slug maps to the exact production Sociobot checkout URL. An
  absent/mismatched catalog entry gets an announced “checkout is being
  prepared” state while the full free bridge and license restore remain usable.
  Normal page load makes no billing request.
- Exact unit/browser coverage exercises absent, wrong-slug, wrong-host, enabled,
  return-token URL removal, invalid verdict, valid restore, and paid-control
  unlock paths. `npm run verify:billing` checks live catalog/redirect behavior.

This is the closest honest in-repository resolution permitted by `AGENTS.md`.
Factory billing registration is still required before a purchase can complete;
after registration, the existing runtime check enables checkout without another
client release.

### PWA/update and preserved behavior

- Bumped the shell/manifest start version to v3 so installed clients receive
  the repair through the existing user-controlled update toast.
- Preserved native force-local Android speech, runtime microphone permission,
  explicit WebRTC pairing, typed fallback, confirmation feedback, local
  IndexedDB/localStorage data, JSON export, legal pages, single-mode cinematic
  visual system, and privacy boundaries.

## Verification evidence

Run in this worker from a clean Node install:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run package:android
npm run verify:billing
npm audit --omit=dev
```

- Clean install: 149 packages; 0 vulnerabilities.
- Unit/release contracts: 10/10 passed. This includes native offline speech
  source contracts, static MIME/fallback policy, APK/hash integrity, catalog
  checkout gating, and PWA update lifecycle.
- Type/production build: `tsc --noEmit && vite build` passed. Home JS is
  25,074 B (9,068 B gzip), CSS is 14,690 B (4,171 B gzip), and responsive hero
  files are 14,210/33,300 B—all inside the supplied budgets.
- Browser integration: 16/16 Playwright 1.58.2 checks passed across desktop
  Chromium and Pixel 5 (390 px). Coverage includes axe serious/critical,
  keyboard focus, 44 px targets, reduced motion, no initial external requests,
  zero console/page errors, catalog-gated checkout, license return/restore,
  actual APK/hash bytes, two-page WebRTC pairing/send, offline reload, responsive
  overflow, and legal pages.
- Android: `npm run package:android` passed a clean 147-task Gradle
  `test assembleDebug` run and produced the artifact above. `apkanalyzer`
  confirmed the application ID and target SDK; `apksigner verify` passed.
- Visual/basic URL smoke: the factory `verify-url.sh` passed on desktop and
  390x844 local production preview with title, `lang=en`, one `h1`, one `main`,
  complete image alt attributes, labeled buttons, and no console errors. Both
  screenshots were reviewed for overflow, clipping, hierarchy, and focus-safe
  controls.
- Privacy: browser instrumentation saw no external request during normal load.
  Source review confirms no analytics, CDN fonts/scripts, STUN/TURN, relay, or
  cloud speech fallback. Billing is contacted only for an explicit checkout
  check or stored/pasted license verification.

## Known external/device validation

- Factory-side production billing registration remains outstanding as described
  above; the UI does not claim that checkout is currently available.
- No physical Android handset is attached to this worker. Before distributing a
  signed release, smoke-test Android 12+ microphone permission, installed speech
  language pack, haptic/tone, LAN pairing, clipboard/paste, back gesture, and
  offline relaunch on real hardware.
- The published artifact is debug-signed for direct QA installation. Release
  signing remains a factory-keystore operation; no signing secret is in this
  repository.

## Deploy

Build `dist/` with the work order command and deploy it as a static artifact:

```sh
npm ci && npm test && npm run build
/opt/fleet/lib/deploy-static.sh quiet-dictation-bridge /work/repo/dist
```

After deployment, verify the live APK MIME/type/size/checksum, checksum MIME,
checkout unavailable state, response policies, offline shell, Lighthouse,
and byte identity against this build. Post-deploy results are appended below.
