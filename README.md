# Quiet Dictation Bridge

Quiet Dictation Bridge is a private, local-first push-to-talk bridge for people
whose motor access, pain, or fatigue makes sustained typing difficult in shared
workspaces. Open it on an Android phone and a computer, explicitly exchange
one-time pairing codes, dictate close to the phone, review the result, and send
the confirmed text over an encrypted peer-to-peer connection.

Live site: <https://quiet-dictation-bridge.sociobot.in>

Try the isolated sample at
<https://quiet-dictation-bridge.sociobot.in/?demo=1>. Its three phrases use a
separate IndexedDB database and never mix with real transcript history.

## What v1 does

- Creates an explicit WebRTC connection directly between phone and computer.
  No STUN, TURN, application relay, account, or analytics service is used.
- In the installed Android app, uses Android 12+’s native on-device speech
  recognizer and an installed Android Speech Services language pack. In a
  browser, it uses Web Speech only when the browser exposes local-processing
  mode. Neither path silently falls back to cloud transcription.
- Keeps the microphone off until the hold control is pressed and always shows
  a visible listening state.
- Lets the speaker edit the draft, then gives a local confirmation tone and
  haptic before sending.
- Stores received phrases in IndexedDB, with manual copy, clear, and validated
  JSON import and export controls. The browser sandbox requires the user to
  paste into the destination app with Ctrl/Cmd + V.
- Works offline after the first successful load, including the legal pages.
- Includes a Capacitor Android app with product-specific icon/splash assets,
  runtime microphone permission, and a native local-speech bridge.

The researched plan calls for a one-time Quiet Kit purchase. That product is
not registered in the factory billing catalog, so this release advertises no
purchase. Automatic copy, session labels, and all confirmation tones are
included without payment or a license. This keeps the shipped offer honest and
the complete bridge useful while factory registration remains unavailable.

## Run and test

Requires Node.js 22+ and npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run test:e2e
npm run lint:android
```

`npm run build` is the deployment build command. It creates `dist/`, with
`dist/index.html` at its root. End-to-end tests use Playwright 1.58.2 and a
production preview server. The factory worker image already contains the
matching browser; elsewhere, run `npx playwright install chromium` once.
`npm run lint:android` checks the native bridge; it requires JDK 21 and Android
SDK platform 35. `npm run package:android` runs that lint gate, native tests,
and debug assembly before it stages the downloadable APK and checksum.

To exercise the full bridge manually:

1. Serve the production build over HTTPS on two devices on the same Wi-Fi.
2. Choose **This is my computer**, create an invitation, and transfer it to the
   phone (a private message or nearby-share clipboard works).
3. Choose **This is my phone**, paste the invitation, create an answer, and
   return the answer to the computer.
4. Connect, then hold the talk control. If local speech is unavailable, type a
   test phrase in the review field. Confirm and send.
5. On the receiver, choose **Copy** and paste in the intended desktop field.

Each confirmed phrase is limited to 10,000 characters. The app refuses an
over-limit draft before sending and leaves it in place for editing; it never
silently trims confirmed words.

Local host candidates can be restricted by corporate browser policy or guest
Wi-Fi client isolation. The app reports a failed link and recommends retrying
on the same unrestricted LAN; it never routes around that policy through a
cloud relay.

## Android app

The checked-in `android/` directory is the buildable Android app. Its valid Java application ID is
`in.sociobot.quietdictationbridge` (Android package IDs cannot contain the
hyphens in the product slug).

```sh
npm run cap:sync
cd android && ./gradlew assembleDebug
```

The debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`; the release worker uploads
it to the factory artifact location with a SHA-256. `npm run package:android`
also stages the APK and checksum under `dist/download/` for static deployment.
The checked-in debug artifact under `public/download/` makes the work order's
clean static build reproducibly include the Android download; packaging
replaces it only after a successful native build. Never commit a signing key.
On Android 12 or newer, install the language you use in Android Speech Services
before dictating. The app deliberately reports an actionable setup message if a
device has no on-device recognizer instead of sending audio to a cloud service.

## Billing status

Run `npm run verify:billing` to record whether the researched product is in the
public catalog. The shipped page contains no checkout or license request while
that external registration is unavailable.

## Privacy and design

See [the privacy policy](https://quiet-dictation-bridge.sociobot.in/privacy/),
[the terms](https://quiet-dictation-bridge.sociobot.in/terms/),
[the demo contract](.factory/demo.md), [the tested claims](.factory/claims.json),
[the researched brief](.factory/brief.json), and
[the visual thesis](.factory/design.md). The hero art is original AI-generated
imagery; its prompt, source, review, and provenance are recorded under
`assets/src/` and in the visual thesis.

## License

MIT — see [LICENSE](LICENSE).
