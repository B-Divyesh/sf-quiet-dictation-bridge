export const PRODUCTION_BILLING_API = 'https://api.sociobot.in';

/**
 * Checkout must be live by default. Preview environments opt into the pilot
 * host explicitly instead of risking a staging purchase link in production.
 */
export function billingApiBase(configuredBase?: string): string {
  return configuredBase?.trim().replace(/\/$/, '') || PRODUCTION_BILLING_API;
}
