import { describe, expect, it } from 'vitest';
import { parseTranscriptImport } from './import';

const exportDocument = (transcripts: unknown[]) => JSON.stringify({
  product: 'Quiet Dictation Bridge',
  exportedAt: '2026-08-30T10:00:00.000Z',
  transcripts,
});

describe('transcript import validation', () => {
  it('removes exported IDs, preserves text, and skips existing and in-file duplicates', () => {
    const phrase = { id: 27, text: 'Keep this exact phrase.', receivedAt: '2026-08-30T09:00:00.000Z', session: 'Notes' };
    const parsed = parseTranscriptImport(exportDocument([phrase, phrase, {
      id: 28,
      text: 'Restore this phrase too.',
      receivedAt: '2026-08-30T09:01:00.000Z',
    }]), [{ id: 1, text: phrase.text, receivedAt: phrase.receivedAt, session: phrase.session }]);

    expect(parsed).toEqual({
      items: [{ text: 'Restore this phrase too.', receivedAt: '2026-08-30T09:01:00.000Z' }],
      duplicates: 2,
    });
  });

  it.each([
    ['malformed JSON', '{'],
    ['another product', JSON.stringify({ product: 'Another product', transcripts: [] })],
    ['missing transcript list', JSON.stringify({ product: 'Quiet Dictation Bridge' })],
    ['empty phrase', exportDocument([{ text: ' ', receivedAt: '2026-08-30T09:00:00.000Z' }])],
    ['invalid date', exportDocument([{ text: 'Words', receivedAt: 'not-a-date' }])],
    ['over-limit phrase', exportDocument([{ text: 'a'.repeat(10_001), receivedAt: '2026-08-30T09:00:00.000Z' }])],
    ['over-limit session', exportDocument([{ text: 'Words', receivedAt: '2026-08-30T09:00:00.000Z', session: 's'.repeat(41) }])],
  ])('rejects %s without returning a partial import', (_case, raw) => {
    expect(() => parseTranscriptImport(raw, [])).toThrow();
  });
});
