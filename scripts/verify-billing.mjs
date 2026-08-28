const apiBase = 'https://api.sociobot.in';
const slug = 'quiet-dictation-bridge';
const checkout = `${apiBase}/api/v1/products/${slug}/checkout`;
const catalogResponse = await fetch(`${apiBase}/api/v1/products`);
if (!catalogResponse.ok) throw new Error(`Product catalog returned HTTP ${catalogResponse.status}.`);
const catalog = await catalogResponse.json();
const product = catalog.data?.find((item) => item.slug === slug);

if (!product) {
  console.log('Quiet Kit is not registered; the app will withhold checkout and keep license restoration available.');
  process.exit(0);
}
if (product.checkout_url !== checkout) throw new Error(`Catalog checkout URL does not match ${checkout}.`);

const response = await fetch(checkout, { redirect: 'manual' });

if (![302, 303].includes(response.status)) {
  const body = await response.text();
  throw new Error(`Hosted Quiet Kit checkout must redirect (received HTTP ${response.status}: ${body.slice(0, 240)})`);
}

const location = response.headers.get('location');
if (!location?.startsWith('https://')) throw new Error('Hosted Quiet Kit checkout did not return an HTTPS location.');
console.log(`Hosted checkout redirects to ${new URL(location).origin}.`);
