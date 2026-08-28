export const MAX_TRANSCRIPT_LENGTH = 10_000;

export type DraftValidation =
  | { ok: true; text: string }
  | { ok: false; message: string };

/**
 * Keep the transport and local history bounded without ever mutating a phrase
 * after its sender has confirmed it. The same limit is communicated before
 * send, where the speaker can edit their own draft.
 */
export function validateDraftForSend(raw: string): DraftValidation {
  const text = raw.trim();
  if (!text) return { ok: false, message: 'Dictate or type a phrase before sending.' };
  if (text.length > MAX_TRANSCRIPT_LENGTH) {
    return {
      ok: false,
      message: `This phrase is ${text.length.toLocaleString()} characters. Shorten it to ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters or fewer before sending.`,
    };
  }
  return { ok: true, text };
}
