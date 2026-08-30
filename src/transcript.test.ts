import { describe, expect, it } from 'vitest';
import { MAX_TRANSCRIPT_LENGTH, validateDraftForSend } from './transcript';

describe('confirmed transcript limits', () => {
  it('@claim:phrase-limit rejects an over-limit draft before send without changing its text', () => {
    const tooLong = `${'a'.repeat(MAX_TRANSCRIPT_LENGTH)} tail`;

    expect(validateDraftForSend(tooLong)).toEqual({
      ok: false,
      message: `This phrase is ${tooLong.length.toLocaleString()} characters. Shorten it to ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters or fewer before sending.`,
    });
    expect(tooLong).toHaveLength(MAX_TRANSCRIPT_LENGTH + 5);
  });

  it('returns a complete, trimmed phrase when it is within the limit', () => {
    expect(validateDraftForSend('  Confirm every word.  ')).toEqual({ ok: true, text: 'Confirm every word.' });
  });
});
