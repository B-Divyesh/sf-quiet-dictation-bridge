const SLUG = 'quiet-dictation-bridge';
const API_BASE = import.meta.env.VITE_BILLING_API_BASE || 'https://pilot-api.sociobot.in';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number; reason?: string };

function cachedVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null; } catch { return null; }
}

export function isQuietKitUnlocked(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY) && cachedVerdict()?.valid);
}

async function verify(token: string, force = false): Promise<Verdict | null> {
  const cached = cachedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`${API_BASE}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: result.valid, reason: result.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch { return null; }
}

export async function setupLicense(onChange: (unlocked: boolean, message: string) => void) {
  const buy = document.querySelector<HTMLAnchorElement>('#buy-link');
  if (buy) buy.href = `${API_BASE}/api/v1/products/${SLUG}/checkout`;

  const url = new URL(location.href);
  const returnedToken = url.searchParams.get('license');
  if (returnedToken) {
    localStorage.setItem(TOKEN_KEY, returnedToken);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const cached = cachedVerdict();
  if (token && cached?.valid) onChange(true, 'Quiet Kit unlocked');
  else onChange(false, cached && !cached.valid ? 'License no longer active · free edition' : 'Free edition');

  if (token) {
    const verdict = await verify(token);
    if (verdict) onChange(verdict.valid, verdict.valid ? 'Quiet Kit unlocked' : 'License no longer active · free edition');
  }

  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const field = document.querySelector<HTMLInputElement>('#license-token');
    const newToken = field?.value.trim();
    if (!newToken) return onChange(false, 'Paste a license token first.');
    localStorage.setItem(TOKEN_KEY, newToken);
    onChange(false, 'Checking license…');
    const verdict = await verify(newToken, true);
    if (!verdict) return onChange(false, 'Could not reach verification. Your free bridge still works.');
    onChange(verdict.valid, verdict.valid ? 'Quiet Kit restored' : 'That license is not active.');
  });
}
