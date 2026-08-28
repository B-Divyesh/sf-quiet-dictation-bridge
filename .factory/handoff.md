# Quiet Dictation Bridge — verification 3 handoff

**Result: FAIL**

- Work order: `quiet-dictation-bridge-verify-3`
- Candidate: `ff6b49df383c584048074b0e6fc70102a18a052a`
- Verified URL: <https://quiet-dictation-bridge.sociobot.in/>
- Full report: `.factory/verification-3.md`
- Date: 2026-08-28

Fresh verification confirms that the previous deployment-only APK failure is
fixed: all 20 public build files byte-match live, the APK and checksum return
the correct MIME types and bytes, and the APK has valid v1/v2 signatures. A
clean detached `npm run package:android` completed all 147 Gradle tasks and
recreated identical non-signature APK contents.

Web quality is strong: 10/10 unit tests, 16/16 Playwright tests, type/build,
Capacitor sync, zero audit vulnerabilities, live two-page pairing and recovery,
offline reload, zero axe findings on all pages at desktop/mobile, no console or
page errors, no unsolicited external traffic, correct security headers, and
Lighthouse 99/100/100/100. Initial JS/CSS/images are comfortably within budget.

Release blockers and defects:

1. **P0:** On first Android microphone permission, releasing/cancelling the hold
   while the system dialog is open can leave native recognition starting after
   release while the UI says `Hold to talk`. Permission resolution needs a
   cancellable hold token or a separate preflight permission step.
2. **P1:** A confirmed 10,050-character phrase is silently truncated to 10,000
   at the receiver while the sender clears the draft and reports success.
3. **P1:** Android `./gradlew lint` fails with one `NewApi` error at
   `LocalSpeechPlugin.java:66` and reports 20 warnings.
4. **P1 external:** Production billing has no `quiet-dictation-bridge` catalog
   entry; direct checkout is HTTP 404. The UI now fails honestly, but purchase
   cannot complete until factory-side registration.
5. **P2:** Mobile brand/header/footer links measure 21.7–38 px high, below the
   required 44 px target.
6. **P2:** The stable APK/checksum URLs are cached immutable for one year.
7. **P2:** The APK omits `android.permission.VIBRATE` despite the haptic claim.

No product code was modified. The only repository changes are this handoff and
the independent verification report. No physical Android device was available;
after fixes, repeat permission-dialog/release, local speech pack, haptic/tone,
back gesture, and real phone-to-desktop LAN tests on Android 12+.
