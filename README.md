# Quiet Dictation Bridge

Quiet Dictation Bridge is a private, local-first push-to-talk bridge for people
whose motor access, pain, or fatigue makes sustained typing difficult in shared
workspaces. Open it on an Android phone and a computer, explicitly exchange
one-time pairing codes, dictate close to the phone, review the result, and send
the confirmed text over an encrypted peer-to-peer connection.

Live site: <https://quiet-dictation-bridge.sociobot.in>

## What v1 does

- Creates an explicit WebRTC connection directly between phone and computer.
  No STUN, TURN, application relay, account, or analytics service is used.
- Requests on-device Web Speech recognition only when the browser exposes its
  local-processing mode. It does not silently fall back to cloud transcription.
- Keeps the microphone off until the hold control is pressed and always shows
  a visible listening state.
- Lets the speaker edit the draft, then gives a local confirmation tone and
  haptic before sending.
- Stores received phrases in IndexedDB, with manual copy, clear, and JSON
  export controls. The browser sandbox requires the user to paste into the
  destination app with Ctrl/Cmd + V.
- Works offline after the first successful load, including the legal pages.
- Includes a Capacitor Android project with product-specific icon/splash assets.

The core bridge is free. The optional $9 one-time Quiet Kit license adds
automatic clipboard copy where the browser permits it, session labels in
exports, and alternate confirmation tones. Accessibility, safety, and export
are never paywalled. Checkout and verification use Sociobot’s hosted billing
API; no payment provider code is embedded here.

## Run and test

Requires Node.js 22+ and npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment build command. It creates `dist/`, with
`dist/index.html` at its root. End-to-end tests use Playwright 1.58.2 and a
production preview server. The factory worker image already contains the
matching browser; elsewhere, run `npx playwright install chromium` once.

To exercise the full bridge manually:

1. Serve the production build over HTTPS on two devices on the same Wi-Fi.
2. Choose **This is my computer**, create an invitation, and transfer it to the
   phone (a private message or nearby-share clipboard works).
3. Choose **This is my phone**, paste the invitation, create an answer, and
   return the answer to the computer.
4. Connect, then hold the talk control. If local speech is unavailable, type a
   test phrase in the review field. Confirm and send.
5. On the receiver, choose **Copy** and paste in the intended desktop field.

Local host candidates can be restricted by corporate browser policy or guest
Wi-Fi client isolation. The app reports a failed link and recommends retrying
on the same unrestricted LAN; it never routes around that policy through a
cloud relay.

## Android project

The checked-in `android/` directory is a Capacitor project skeleton for the
later APK work order. Its valid Java application ID is
`in.sociobot.quietdictationbridge` (Android package IDs cannot contain the
hyphens in the product slug).

```sh
npm run cap:sync
cd android && ./gradlew assembleDebug
```

The static-deploy worker is not expected to contain an Android SDK, so APK
production and signing are intentionally deferred. Never commit a signing key.

## Configuration

Staging defaults to `https://pilot-api.sociobot.in`. Set
`VITE_BILLING_API_BASE=https://api.sociobot.in` in the factory release build.
The endpoint is derived from the product slug; there is no hard-coded billing
product ID.

## Privacy and design

See [the privacy policy](https://quiet-dictation-bridge.sociobot.in/privacy/),
[the terms](https://quiet-dictation-bridge.sociobot.in/terms/),
[the researched brief](.factory/brief.json), and
[the visual thesis](.factory/design.md). The hero art is original AI-generated
imagery; its prompt, source, review, and provenance are recorded under
`assets/src/` and in the visual thesis.

## License

MIT — see [LICENSE](LICENSE).
