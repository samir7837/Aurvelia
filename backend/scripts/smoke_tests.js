require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const BASE = `http://localhost:${process.env.PORT || 4000}`;

async function tryReq(method, path, body, token) {
  const url = BASE + path;
  const opts = { method, headers: { 'Accept': 'application/json' } };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let parsed = text;
    try { parsed = JSON.parse(text); } catch (e) {}
    return { status: res.status, body: parsed };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  console.log('Base URL:', BASE);
  const results = {};

  results.health = await tryReq('GET','/api/health');
  results.products = await tryReq('GET','/api/products');

  // Register a new temporary user
  results.register = await tryReq('POST','/api/auth/register',{ email: 'smokeuser@example.com', password: 'smokepass', full_name: 'Smoke User' });

  // Login as customer seed
  results.loginCustomer = await tryReq('POST','/api/auth/login',{ email: 'customer@example.com', password: 'custpass' });
  const custToken = results.loginCustomer.body?.token;

  // Login as admin
  results.loginAdmin = await tryReq('POST','/api/auth/login',{ email: 'admin@example.com', password: 'adminpass' });
  const adminToken = results.loginAdmin.body?.token;

  // auth/me
  results.authMe = await tryReq('GET','/api/auth/me',null,custToken);

  // cart (GET)
  results.cartGet = await tryReq('GET','/api/cart',null,custToken);

  // pick a product id
  const prod = results.products.body && results.products.body[0];
  // cart add endpoint requested by user (/api/cart/add)
  if (prod) {
    results.cartAddAlias = await tryReq('POST','/api/cart/add',{ product_id: prod.id, quantity: 1 },custToken);
    // actual cart POST
    results.cartPost = await tryReq('POST','/api/cart',{ product_id: prod.id, quantity: 1 },custToken);
  } else {
    results.cartAddAlias = { error: 'no product available' };
    results.cartPost = { error: 'no product available' };
  }

  // orders
  results.ordersGet = await tryReq('GET','/api/orders',null,custToken);
  results.ordersPost = await tryReq('POST','/api/orders',{ items: [{ product_id: prod?.id, name: prod?.name, slug: prod?.slug, category: prod?.category, price: prod?.price, quantity: 1 }], subtotal: prod?.price||0, total: prod?.price||0, shipping_address: {} },custToken);

  // reviews
  results.reviews = await tryReq('GET',`/api/reviews/product/${prod?.id || 'unknown'}`);

  // newsletter
  results.newsletter = await tryReq('POST','/api/newsletter',{ email: 'subscribe@example.com' });

  // contact
  results.contact = await tryReq('POST','/api/contact',{ name: 'Smoke', email: 'smoke@example.com', message: 'Hello' });

  // admin stats
  results.adminStatsNoAuth = await tryReq('GET','/api/admin/stats');
  results.adminStatsAuth = await tryReq('GET','/api/admin/stats',null,adminToken);

  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => { console.error(err); process.exit(1); });
