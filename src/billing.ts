export const PRODUCTION_BILLING_API = 'https://api.sociobot.in';
export const PRODUCT_SLUG = 'quiet-dictation-bridge';

/**
 * Checkout must be live by default. Preview environments opt into the pilot
 * host explicitly instead of risking a staging purchase link in production.
 */
export function billingApiBase(configuredBase?: string): string {
  return configuredBase?.trim().replace(/\/$/, '') || PRODUCTION_BILLING_API;
}

export function productCheckoutUrl(apiBase: string): string {
  return `${apiBase}/api/v1/products/${PRODUCT_SLUG}/checkout`;
}

/**
 * Only expose checkout after the public catalog confirms that this exact
 * product is enabled. This keeps an unregistered provider product from
 * becoming an unavailable purchase control while preserving license restoration.
 */
export function registeredCheckoutUrl(catalog: unknown, apiBase: string): string | null {
  if (!catalog || typeof catalog !== 'object' || !('data' in catalog) || !Array.isArray(catalog.data)) return null;
  const expected = productCheckoutUrl(apiBase);
  const product = catalog.data.find((item: unknown) => {
    if (!item || typeof item !== 'object') return false;
    return 'slug' in item && item.slug === PRODUCT_SLUG;
  });
  if (!product || !('checkout_url' in product) || product.checkout_url !== expected) return null;
  return expected;
}
