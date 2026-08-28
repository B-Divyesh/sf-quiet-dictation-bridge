import { billingApiBase, PRODUCT_SLUG, productCheckoutUrl, registeredCheckoutUrl } from './billing';

const API_BASE = billingApiBase(import.meta.env.VITE_BILLING_API_BASE);
const TOKEN_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number; token: string; reason?: string };

function cachedVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null; } catch { return null; }
}

export function isQuietKitUnlocked(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  const cached = cachedVerdict();
  return Boolean(token && cached?.valid && cached.token === token);
}

async function verify(token: string, force = false): Promise<Verdict | null> {
  const cached = cachedVerdict();
  if (!force && cached && cached.token === token && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`${API_BASE}/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: result.valid, reason: result.reason, checkedAt: Date.now(), token };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch { return null; }
}

export async function setupLicense(onChange: (unlocked: boolean, message: string) => void) {
  const buy = document.querySelector<HTMLButtonElement>('#buy-link');
  const checkoutStatus = document.querySelector<HTMLElement>('#checkout-status');
  const expectedCheckout = productCheckoutUrl(API_BASE);
  if (buy) {
    buy.dataset.checkoutUrl = expectedCheckout;
    buy.addEventListener('click', async () => {
      buy.disabled = true;
      if (checkoutStatus) checkoutStatus.textContent = 'Checking secure checkout availability…';
      try {
        const response = await fetch(`${API_BASE}/api/v1/products`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Catalog unavailable');
        const checkout = registeredCheckoutUrl(await response.json(), API_BASE);
        if (!checkout) {
          if (checkoutStatus) checkoutStatus.textContent = 'Quiet Kit checkout is being prepared. The full free bridge stays available; existing licenses can still be restored.';
          return;
        }
        location.assign(checkout);
      } catch {
        if (checkoutStatus) checkoutStatus.textContent = 'Could not confirm checkout availability. The free bridge still works; try again later.';
      } finally {
        buy.disabled = false;
      }
    });
  }

  const url = new URL(location.href);
  const returnedToken = url.searchParams.get('license');
  if (returnedToken) {
    localStorage.setItem(TOKEN_KEY, returnedToken);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const cached = cachedVerdict();
  if (token && cached?.valid && cached.token === token) onChange(true, 'Quiet Kit unlocked');
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
