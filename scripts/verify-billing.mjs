const apiBase = 'https://api.sociobot.in';
const slug = 'quiet-dictation-bridge';
const checkout = `${apiBase}/api/v1/products/${slug}/checkout`;
const catalogResponse = await fetch(`${apiBase}/api/v1/products`);
if (!catalogResponse.ok) throw new Error(`Product catalog returned HTTP ${catalogResponse.status}.`);
const catalog = await catalogResponse.json();
const product = catalog.data?.find((item) => item.slug === slug);

if (!product) {
  console.log('Quiet Kit is not registered; this release includes every feature and advertises no checkout.');
  process.exit(0);
}
if (product.checkout_url !== checkout) throw new Error(`Catalog checkout URL does not match ${checkout}.`);
console.log('Quiet Kit is now registered. The current release still includes every feature and advertises no checkout.');
