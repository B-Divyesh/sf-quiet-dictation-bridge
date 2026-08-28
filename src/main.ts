import './style.css';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { transcriptFilename } from './core';
import { addTranscript, clearTranscripts, getTranscripts, type Transcript } from './db';
import { isQuietKitUnlocked, setupLicense } from './license';
import { LocalPeer } from './peer';
import { chooseSpeechPath, type SpeechPath } from './speech';

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector);
const show = (selector: string, visible: boolean) => { $(selector)?.toggleAttribute('hidden', !visible); };

let peer: LocalPeer | null = null;
let role: 'desktop' | 'phone' | null = null;
let historyItems: Transcript[] = [];
let quietKit = isQuietKitUnlocked();

function announce(message: string) {
  const alert = $('#bridge-alert');
  if (!alert) return;
  alert.textContent = message;
  alert.removeAttribute('hidden');
}

function clearAlert() { show('#bridge-alert', false); }

function setConnectionStatus(target: 'desktop' | 'phone', text: string, state: 'idle' | 'working' | 'connected' = 'idle') {
  const label = $(`#${target}-status`);
  const dot = $(`#${target}-status-dot`);
  if (label) label.textContent = text;
  dot?.classList.toggle('working', state === 'working');
  dot?.classList.toggle('connected', state === 'connected');
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard access was blocked. Select and copy the text manually.');
}

function setRole(nextRole: 'desktop' | 'phone' | null) {
  peer?.close();
  peer = null;
  role = nextRole;
  clearAlert();
  show('.role-switch', nextRole === null);
  show('#desktop-panel', nextRole === 'desktop');
  show('#phone-panel', nextRole === 'phone');
  show('#desktop-setup', nextRole === 'desktop');
  show('#receiver-workspace', nextRole === 'desktop');
  show('#phone-setup', nextRole === 'phone');
  show('#dictation-workspace', false);
  setConnectionStatus('desktop', 'Ready to create a private invitation');
  setConnectionStatus('phone', 'Waiting for an invitation');
}

function newPeer() {
  peer?.close();
  peer = new LocalPeer({
    onState(state) {
      const connected = state === 'connected';
      if (role === 'desktop') {
        setConnectionStatus('desktop', connected ? 'Phone connected · encrypted local link' : state === 'failed' ? 'Connection failed' : 'Connecting…', connected ? 'connected' : 'working');
        if (connected) show('#desktop-setup', false);
      } else if (role === 'phone') {
        setConnectionStatus('phone', connected ? 'Computer connected · ready when you are' : state === 'failed' ? 'Connection failed' : 'Waiting for computer…', connected ? 'connected' : 'working');
        if (connected) {
          show('#phone-setup', false);
          show('#dictation-workspace', true);
          setupSpeechRecognition();
        }
      }
      if (state === 'failed' || state === 'disconnected') announce('The local link was interrupted. Check that both devices are on the same Wi-Fi, then pair again.');
    },
    onMessage(text) { void receiveTranscript(text).catch(() => announce('The phrase arrived, but local browser storage is unavailable. Ask the phone to send it again after enabling site storage.')); },
  });
}

async function createInvitation() {
  const button = $('#create-invite') as HTMLButtonElement;
  button.disabled = true;
  clearAlert();
  setConnectionStatus('desktop', 'Creating one-time invitation…', 'working');
  try {
    newPeer();
    const code = await peer!.createInvitation();
    ($('#invite-code') as HTMLTextAreaElement).value = code;
    show('#invite-block', true);
    setConnectionStatus('desktop', 'Invitation ready · waiting for phone answer', 'working');
    $<HTMLTextAreaElement>('#invite-code')?.focus();
  } catch (error) {
    announce(error instanceof Error ? error.message : 'Could not create an invitation.');
    setConnectionStatus('desktop', 'Invitation failed');
  } finally { button.disabled = false; }
}

async function createAnswer() {
  const button = $('#make-answer') as HTMLButtonElement;
  const invitation = ($('#phone-invite') as HTMLTextAreaElement).value.trim();
  if (!invitation) return announce('Paste the invitation from your computer first.');
  button.disabled = true;
  clearAlert();
  setConnectionStatus('phone', 'Creating a private answer…', 'working');
  try {
    newPeer();
    const answer = await peer!.answerInvitation(invitation);
    ($('#phone-answer') as HTMLTextAreaElement).value = answer;
    show('#phone-answer-block', true);
    setConnectionStatus('phone', 'Answer ready · return it to your computer', 'working');
    $<HTMLTextAreaElement>('#phone-answer')?.focus();
  } catch (error) {
    announce(error instanceof Error ? error.message : 'Could not read that invitation.');
    setConnectionStatus('phone', 'Answer failed');
  } finally { button.disabled = false; }
}

async function acceptAnswer() {
  const answer = ($('#answer-code') as HTMLTextAreaElement).value.trim();
  if (!answer) return announce('Paste the answer from your phone first.');
  clearAlert();
  setConnectionStatus('desktop', 'Opening encrypted local link…', 'working');
  try { await peer?.acceptAnswer(answer); }
  catch (error) {
    announce(error instanceof Error ? error.message : 'Could not use that answer.');
    setConnectionStatus('desktop', 'Connection failed');
  }
}

function renderHistory() {
  const list = $('#transcript-list') as HTMLOListElement | null;
  if (!list) return;
  list.replaceChildren();
  show('#receiver-empty', historyItems.length === 0);
  for (const item of historyItems) {
    const li = document.createElement('li');
    li.className = 'transcript';
    const phrase = document.createElement('p');
    phrase.textContent = item.text;
    const time = document.createElement('time');
    time.dateTime = item.receivedAt;
    time.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(item.receivedAt));
    if (item.session) time.textContent += ` · ${item.session}`;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy-transcript';
    copy.textContent = 'Copy';
    copy.setAttribute('aria-label', `Copy phrase: ${item.text.slice(0, 50)}`);
    copy.addEventListener('click', async () => {
      try { await copyText(item.text); copy.textContent = 'Copied'; window.setTimeout(() => { copy.textContent = 'Copy'; }, 1800); }
      catch (error) { announce(error instanceof Error ? error.message : 'Could not copy the phrase.'); }
    });
    li.append(phrase, time, copy);
    list.append(li);
  }
}

async function receiveTranscript(text: string) {
  const clean = text.trim().slice(0, 10_000);
  if (!clean) return;
  const sessionField = $('#session-label') as HTMLInputElement | null;
  const item = await addTranscript({ text: clean, receivedAt: new Date().toISOString(), session: quietKit ? sessionField?.value.trim() || undefined : undefined });
  historyItems.unshift(item);
  renderHistory();
  const autoCopy = $('#auto-copy') as HTMLInputElement | null;
  if (quietKit && autoCopy?.checked) {
    try { await copyText(clean); setConnectionStatus('desktop', 'Phrase received and copied · paste with Ctrl/Cmd + V', 'connected'); }
    catch { setConnectionStatus('desktop', 'Phrase received · choose Copy to use it', 'connected'); }
  } else setConnectionStatus('desktop', 'Phrase received · choose Copy, then paste', 'connected');
}

type RecognitionResultEvent = Event & { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> };
type RecognitionErrorEvent = Event & { error: string };
type RecognitionLike = EventTarget & {
  lang: string; continuous: boolean; interimResults: boolean; processLocally?: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => RecognitionLike;
type ListenerHandle = { remove: () => Promise<void> };
type NativeSpeech = {
  available(): Promise<{ available: boolean; permissionGranted: boolean }>;
  start(options: { language: string }): Promise<void>;
  stop(): Promise<void>;
  addListener(eventName: 'partial' | 'result' | 'error' | 'state', listenerFunc: (event: { text: string }) => void): Promise<ListenerHandle>;
};

const NativeLocalSpeech = registerPlugin<NativeSpeech>('LocalSpeech');

let recognition: RecognitionLike | null = null;
let listening = false;
let speechPath: SpeechPath = 'unavailable';
let nativeListeners: ListenerHandle[] = [];

function setTalkState(active: boolean) {
  listening = active;
  $('#talk-button')?.classList.toggle('is-listening', active);
  const label = $('#talk-button')?.querySelector('strong');
  if (label) label.textContent = active ? 'Listening' : 'Hold to talk';
}

async function setupNativeSpeech() {
  const talk = $('#talk-button') as HTMLButtonElement;
  const support = $('#speech-support');
  try {
    const status = await NativeLocalSpeech.available();
    if (!status.available) throw new Error('Offline speech recognition is not installed. Install a language pack in Android Speech Services, then retry.');
    talk.disabled = false;
    if (support) support.textContent = status.permissionGranted
      ? 'Android offline recognition is ready. Your draft stays on this phone until you confirm.'
      : 'Android will ask for microphone permission when you hold to talk. Recognition is requested on-device only.';
    nativeListeners = await Promise.all([
      NativeLocalSpeech.addListener('partial', ({ text }) => { ($('#draft-text') as HTMLTextAreaElement).value = text.trim(); }),
      NativeLocalSpeech.addListener('result', ({ text }) => { ($('#draft-text') as HTMLTextAreaElement).value = text.trim(); }),
      NativeLocalSpeech.addListener('state', ({ text }) => { if (text === 'review') setTalkState(false); }),
      NativeLocalSpeech.addListener('error', ({ text }) => { setTalkState(false); announce(text); }),
    ]);
  } catch (error) {
    speechPath = 'unavailable';
    talk.disabled = true;
    if (support) support.textContent = error instanceof Error ? `${error.message} You can type below to test the bridge.` : 'Android offline speech is unavailable. You can type below to test the bridge.';
  }
}

function setupSpeechRecognition() {
  const win = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  const Constructor = win.SpeechRecognition || win.webkitSpeechRecognition;
  const talk = $('#talk-button') as HTMLButtonElement;
  const support = $('#speech-support');
  for (const listener of nativeListeners) void listener.remove();
  nativeListeners = [];
  recognition = null;
  speechPath = chooseSpeechPath(Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform(), Boolean(Constructor && 'processLocally' in Constructor.prototype));
  if (speechPath === 'android-offline') {
    talk.disabled = true;
    if (support) support.textContent = 'Checking Android offline recognition…';
    void setupNativeSpeech();
    return;
  }
  if (speechPath === 'unavailable' || !Constructor) {
    talk.disabled = true;
    if (support) support.textContent = 'Local speech recognition is unavailable here. Install an offline language pack in Chrome/Android, or type below to test the bridge. No cloud fallback is used.';
    return;
  }
  talk.disabled = false;
  if (support) support.textContent = 'On-device recognition requested. Your draft stays on this phone until you confirm.';
  recognition = new Constructor();
  recognition.lang = navigator.language || 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.processLocally = true;
  recognition.onresult = (event) => {
    let text = '';
    for (let index = 0; index < event.results.length; index++) text += event.results[index][0].transcript;
    ($('#draft-text') as HTMLTextAreaElement).value = text.trim();
  };
  recognition.onerror = (event) => {
    stopListening();
    const message = event.error === 'not-allowed' ? 'Microphone access was not allowed. Enable it in site settings, then retry.' : `Speech recognition stopped: ${event.error}. You can type the phrase below.`;
    announce(message);
  };
  recognition.onend = stopListening;
}

function startListening() {
  if (listening || speechPath === 'unavailable') return;
  clearAlert();
  if (speechPath === 'android-offline') {
    setTalkState(true);
    void NativeLocalSpeech.start({ language: navigator.language || 'en-US' }).catch((error: unknown) => {
      setTalkState(false);
      announce(error instanceof Error ? error.message : 'Android offline speech could not start. You can type the phrase below.');
    });
    return;
  }
  if (!recognition) return;
  try {
    recognition.start();
    setTalkState(true);
  } catch { /* Repeated starts are ignored by browser implementations. */ }
}

function stopListening() {
  if (speechPath === 'android-offline' && listening) void NativeLocalSpeech.stop().catch(() => { /* Error event provides an actionable message. */ });
  else if (listening) recognition?.stop();
  setTalkState(false);
}

function confirmationFeedback() {
  const selected = ($('#tone-choice') as HTMLSelectElement | null)?.value || 'soft';
  const frequencies: Record<string, number> = { soft: 520, warm: 660, clear: 880 };
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequencies[selected];
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.13);
    oscillator.addEventListener('ended', () => void context.close());
  } catch { /* Haptic and visible confirmation remain available. */ }
  navigator.vibrate?.(35);
}

function sendDraft() {
  const draft = $('#draft-text') as HTMLTextAreaElement;
  const text = draft.value.trim();
  if (!text) return announce('Dictate or type a phrase before sending.');
  try {
    confirmationFeedback();
    peer?.sendTranscript(text);
    draft.value = '';
    const support = $('#speech-support');
    if (support) support.textContent = 'Confirmed and sent over the encrypted local link.';
  } catch (error) { announce(error instanceof Error ? error.message : 'Could not send the phrase.'); }
}

function updatePaidControls(unlocked: boolean, message: string) {
  quietKit = unlocked;
  const status = $('#license-status');
  if (status) status.textContent = message;
  const autoCopy = $('#auto-copy') as HTMLInputElement | null;
  const session = $('#session-label') as HTMLInputElement | null;
  if (autoCopy) { autoCopy.disabled = !unlocked; if (!unlocked) autoCopy.checked = false; }
  if (session) session.disabled = !unlocked;
  document.querySelectorAll<HTMLOptionElement>('#tone-choice option:not(:first-child)').forEach((option) => { option.disabled = !unlocked; });
}

async function exportHistory() {
  const content = JSON.stringify({ product: 'Quiet Dictation Bridge', exportedAt: new Date().toISOString(), transcripts: historyItems }, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = transcriptFilename();
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  $('#choose-desktop')?.addEventListener('click', () => setRole('desktop'));
  $('#choose-phone')?.addEventListener('click', () => setRole('phone'));
  document.querySelectorAll('.change-role').forEach((button) => button.addEventListener('click', () => setRole(null)));
  $('#create-invite')?.addEventListener('click', () => void createInvitation());
  $('#make-answer')?.addEventListener('click', () => void createAnswer());
  $('#accept-answer')?.addEventListener('click', () => void acceptAnswer());
  document.querySelectorAll<HTMLButtonElement>('.copy-code').forEach((button) => button.addEventListener('click', async () => {
    const field = document.getElementById(button.dataset.copy || '') as HTMLTextAreaElement | null;
    try { await copyText(field?.value || ''); button.textContent = 'Copied'; window.setTimeout(() => { button.textContent = button.dataset.copy === 'invite-code' ? 'Copy invitation' : 'Copy answer'; }, 1800); }
    catch (error) { announce(error instanceof Error ? error.message : 'Could not copy the code.'); }
  }));
  const talk = $('#talk-button');
  talk?.addEventListener('pointerdown', (event) => { event.preventDefault(); (talk as HTMLElement).setPointerCapture((event as PointerEvent).pointerId); startListening(); });
  talk?.addEventListener('pointerup', stopListening);
  talk?.addEventListener('pointercancel', stopListening);
  talk?.addEventListener('keydown', (event) => { const keyEvent = event as KeyboardEvent; if (keyEvent.repeat) return; if (keyEvent.key === ' ' || keyEvent.key === 'Enter') { keyEvent.preventDefault(); startListening(); } });
  talk?.addEventListener('keyup', (event) => { const keyEvent = event as KeyboardEvent; if (keyEvent.key === ' ' || keyEvent.key === 'Enter') { keyEvent.preventDefault(); stopListening(); } });
  $('#send-draft')?.addEventListener('click', sendDraft);
  $('#discard-draft')?.addEventListener('click', () => { ($('#draft-text') as HTMLTextAreaElement).value = ''; });
  $('#export-history')?.addEventListener('click', () => void exportHistory());
  $('#clear-history')?.addEventListener('click', async () => {
    if (!confirm(`Clear ${historyItems.length} saved phrase${historyItems.length === 1 ? '' : 's'} from this device? This cannot be undone.`)) return;
    await clearTranscripts(); historyItems = []; renderHistory();
  });
}

function setupNetworkState() {
  const update = async () => {
    if (!navigator.onLine) return show('#offline-banner', true);
    try {
      const response = await fetch(`/manifest.webmanifest?network-check=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      show('#offline-banner', !response.ok);
    } catch { show('#offline-banner', true); }
  };
  window.addEventListener('online', () => void update());
  window.addEventListener('offline', () => void update());
  void update();
}

async function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  let applyingUpdate = false;
  if (registration.waiting) show('#update-toast', true);
  registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => {
    if (registration.waiting && navigator.serviceWorker.controller) show('#update-toast', true);
  }));
  $('#apply-update')?.addEventListener('click', () => {
    applyingUpdate = true;
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (applyingUpdate) location.reload(); });
}

async function init() {
  bindEvents();
  setupNetworkState();
  historyItems = await getTranscripts().catch(() => []);
  renderHistory();
  updatePaidControls(quietKit, quietKit ? 'Quiet Kit unlocked' : 'Free edition');
  void setupLicense(updatePaidControls);
  void setupServiceWorker().catch(() => { /* The online app remains usable if SW registration is blocked. */ });
}

void init();
