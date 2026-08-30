import type { Transcript } from './db';
import { MAX_TRANSCRIPT_LENGTH } from './transcript';

const PRODUCT_NAME = 'Quiet Dictation Bridge';
const MAX_IMPORT_ITEMS = 10_000;

export type TranscriptImport = {
  items: Array<Omit<Transcript, 'id'>>;
  duplicates: number;
};

function transcriptKey(item: Pick<Transcript, 'text' | 'receivedAt' | 'session'>): string {
  return JSON.stringify([item.text, item.receivedAt, item.session || '']);
}

export function parseTranscriptImport(raw: string, existing: readonly Transcript[]): TranscriptImport {
  let document: unknown;
  try {
    document = JSON.parse(raw);
  } catch {
    throw new Error('This file is not valid JSON. Choose an export from Quiet Dictation Bridge.');
  }

  if (!document || typeof document !== 'object' || !('product' in document) || document.product !== PRODUCT_NAME) {
    throw new Error('This is not a Quiet Dictation Bridge export. Choose an exported JSON file.');
  }
  if (!('transcripts' in document) || !Array.isArray(document.transcripts)) {
    throw new Error('This export has no transcript list. Choose another exported JSON file.');
  }
  if (document.transcripts.length > MAX_IMPORT_ITEMS) {
    throw new Error(`This export has more than ${MAX_IMPORT_ITEMS.toLocaleString()} phrases. Split it into smaller files.`);
  }

  const known = new Set(existing.map(transcriptKey));
  const items: Array<Omit<Transcript, 'id'>> = [];
  let duplicates = 0;

  document.transcripts.forEach((value, index) => {
    const itemNumber = index + 1;
    if (!value || typeof value !== 'object') throw new Error(`Phrase ${itemNumber} is invalid. Export the data again and retry.`);
    if (!('text' in value) || typeof value.text !== 'string' || !value.text.trim()) {
      throw new Error(`Phrase ${itemNumber} has no text. Export the data again and retry.`);
    }
    if (value.text.length > MAX_TRANSCRIPT_LENGTH) {
      throw new Error(`Phrase ${itemNumber} exceeds ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters. Shorten it before importing.`);
    }
    if (!('receivedAt' in value) || typeof value.receivedAt !== 'string' || !Number.isFinite(Date.parse(value.receivedAt))) {
      throw new Error(`Phrase ${itemNumber} has an invalid date. Export the data again and retry.`);
    }
    if ('session' in value && value.session !== undefined && (typeof value.session !== 'string' || value.session.length > 40)) {
      throw new Error(`Phrase ${itemNumber} has an invalid session label. Export the data again and retry.`);
    }

    const item: Omit<Transcript, 'id'> = {
      text: value.text,
      receivedAt: value.receivedAt,
      ...('session' in value && typeof value.session === 'string' && value.session ? { session: value.session } : {}),
    };
    const key = transcriptKey(item);
    if (known.has(key)) {
      duplicates += 1;
      return;
    }
    known.add(key);
    items.push(item);
  });

  return { items, duplicates };
}
