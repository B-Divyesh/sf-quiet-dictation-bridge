import { describe, expect, it } from 'vitest';
import { decodeSignal, encodeSignal, formatDuration, transcriptFilename } from './core';

describe('pairing code helpers', () => {
  it('round-trips a valid SDP offer', () => {
    const encoded = encodeSignal({ type: 'offer', sdp: 'v=0\r\na=ice-ufrag:test\r\n' });
    expect(decodeSignal(encoded, 'offer')).toEqual({ type: 'offer', sdp: 'v=0\r\na=ice-ufrag:test\r\n' });
  });

  it('rejects malformed and wrong-direction codes', () => {
    expect(() => decodeSignal('not a code', 'offer')).toThrow('valid offer code');
    const answer = encodeSignal({ type: 'answer', sdp: 'v=0\r\n' });
    expect(() => decodeSignal(answer, 'offer')).toThrow('valid offer code');
  });
});

describe('small UI formatters', () => {
  it('formats bridge latency and export dates', () => {
    expect(formatDuration(842)).toBe('842 ms');
    expect(formatDuration(1450)).toBe('1.4 s');
    expect(transcriptFilename(new Date('2026-08-28T12:00:00Z'))).toBe('quiet-bridge-2026-08-28.json');
  });
});
