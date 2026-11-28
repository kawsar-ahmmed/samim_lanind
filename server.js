const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PORT = Number(process.env.PORT) || 3000;
const DELIVERY_CHARGES = { dhaka: 80, outside: 150 };
const PRODUCTS = {
  'gulabi-garden': { name: 'Embroidered Kameez', price: 1499 },
  'nil-nodi': { name: 'Beige Floral Readymade 3-Piece', price: 1299 },
  'shonar-roddur': { name: 'Royal Purple Readymade 3-Piece', price: 1299 },
  'joba-bagan': { name: 'Navy Blue Readymade 3-Piece', price: 1299 },
  'megh-mala': { name: 'Blue Readymade 3-Piece', price: 1099 },
  'raat-rani': { name: 'Black & White Readymade 3-Piece', price: 1099 }
};
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};
let mutationQueue = Promise.resolve();

async function readOrders() {
  try {
    const value = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeOrders(orders) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${ORDERS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(orders, null, 2), 'utf8');
  await fs.rename(temporaryFile, ORDERS_FILE);
}

function updateOrders(updater) {
  const operation = mutationQueue.then(async () => {
    const orders = await readOrders();
    const result = await updater(orders);
    await writeOrders(orders);
    return result;
  });
  mutationQueue = operation.catch(() => {});
  return operation;
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 30_000) {
        reject(Object.assign(new Error('Request is too large'), { status: 413 }));
        request.destroy();
      }
    });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    request.on('error', reject);
  });
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/orders') {
    return sendJson(response, 200, await readOrders());
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === 'GET' && orderMatch) {
    const order = (await readOrders()).find(item => item.id === decodeURIComponent(orderMatch[1]));
    return order ? sendJson(response, 200, { order }) : sendJson(response, 404, { error: 'Order not found.' });
  }

  if (request.method === 'POST' && url.pathname === '/api/orders') {
    const input = await readJson(request);
    const product = PRODUCTS[input.productId];
    const quantity = Number(input.quantity);
    const name = cleanText(input.name, 80);
    const phone = cleanText(input.phone, 30);
    const address = cleanText(input.address, 500);
    const size = cleanText(input.size, 30);
    const deliveryArea = input.deliveryArea;
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !name || !phone || !address || !['M - (36-38)', 'L - (40-42)', 'XXL - (44-46)'].includes(size) || !DELIVERY_CHARGES[deliveryArea]) {
      return sendJson(response, 400, { error: 'Please provide valid order details.' });
    }
    const subtotal = product.price * quantity;
    const order = {
      id: `DF-${randomUUID().toUpperCase()}`,
      createdAt: new Date().toISOString(), status: 'pending',
      customer: name, phone, address, productId: input.productId, product: product.name,
      size, quantity, deliveryArea, deliveryCharge: DELIVERY_CHARGES[deliveryArea],
      subtotal, amount: subtotal + DELIVERY_CHARGES[deliveryArea]
    };
    await updateOrders(orders => { orders.unshift(order); });
    return sendJson(response, 201, { order });
  }

  if (request.method === 'PATCH' && orderMatch) {
    const input = await readJson(request);
    if (!['pending', 'active', 'delivered'].includes(input.status)) {
      return sendJson(response, 400, { error: 'Invalid order status.' });
    }
    const order = await updateOrders(orders => {
      const found = orders.find(item => item.id === decodeURIComponent(orderMatch[1]));
      if (found) found.status = input.status;
      return found || null;
    });
    if (!order) return sendJson(response, 404, { error: 'Order not found.' });
    return sendJson(response, 200, { order });
  }

  return sendJson(response, 404, { error: 'Not found.' });
}

async function serveFile(response, pathname) {
  let requestPath;
  try { requestPath = decodeURIComponent(pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  if (requestPath === '/') requestPath = '/index.html';
  if (requestPath === '/data' || requestPath.startsWith('/data/')) { response.writeHead(404).end('Not found'); return; }
  const filePath = path.resolve(ROOT, `.${requestPath}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    response.end(file);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
    else if (request.method === 'GET' || request.method === 'HEAD') await serveFile(response, url.pathname);
    else sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : 'Unable to process the request.' });
    else response.destroy();
    if (!error.status) console.error(error);
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Dressify is running at http://127.0.0.1:${PORT}`));
