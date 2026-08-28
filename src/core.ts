export type SignalPayload = { type: 'offer' | 'answer'; sdp: string };

export function encodeSignal(description: RTCSessionDescriptionInit): string {
  if (!description.type || !description.sdp) throw new Error('Connection details are incomplete.');
  const payload: SignalPayload = { type: description.type as 'offer' | 'answer', sdp: description.sdp };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function decodeSignal(code: string, expected: SignalPayload['type']): SignalPayload {
  try {
    const clean = code.replace(/\s/g, '');
    const binary = atob(clean);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SignalPayload>;
    if (parsed.type !== expected || typeof parsed.sdp !== 'string' || !parsed.sdp.startsWith('v=0')) throw new Error();
    return parsed as SignalPayload;
  } catch {
    throw new Error(`That is not a valid ${expected} code. Copy the entire code and try again.`);
  }
}

export function transcriptFilename(date = new Date()): string {
  return `quiet-bridge-${date.toISOString().slice(0, 10)}.json`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}
