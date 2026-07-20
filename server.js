const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');


async function readStore() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function filterProducts(products, category = 'all') {
  return category === 'all' ? products : products.filter((product) => product.category === category);
}

function calculateOrder(products, items) {
  const normalizedItems = items.map((item) => ({ productId: item.productId, quantity: sanitizeQuantity(item.quantity) }))
    .filter((item) => item.productId && item.quantity > 0);
  const lines = normalizedItems.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return null;
    const quantity = Math.min(item.quantity, product.stock);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    };
  }).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { lines, total };
}

function createApp() {
  const express = require('express');
  const app = express();

  app.use(express.json());
  app.use(express.static(__dirname));

  app.get('/api/products', async (req, res) => {
  const store = await readStore();
  res.json(filterProducts(store.products, req.query.category));
});

  app.get('/api/products/:id', async (req, res) => {
  const store = await readStore();
  const product = store.products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Товар не найден.' });
  return res.json(product);
});

  app.post('/api/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name) return res.status(400).json({ message: 'Введите имя.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Введите корректный email.' });
  if (password.length < 6) return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов.' });

  const store = await readStore();
  if (store.users.some((user) => user.email === email)) return res.status(409).json({ message: 'Пользователь уже зарегистрирован.' });

  const user = { id: crypto.randomUUID(), name, email, password, createdAt: new Date().toISOString() };
  store.users.push(user);
  await writeStore(store);
  return res.status(201).json({ user: publicUser(user), message: 'Регистрация выполнена.' });
});

  app.post('/api/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const store = await readStore();
  const user = store.users.find((item) => item.email === email && item.password === password);
  if (!user) return res.status(401).json({ message: 'Неверный email или пароль.' });
  return res.json({ user: publicUser(user), message: 'Вход выполнен.' });
});

  app.get('/api/orders/:email', async (req, res) => {
  const store = await readStore();
  const email = normalizeEmail(req.params.email);
  res.json(store.orders.filter((order) => order.userEmail === email));
});

  app.post('/api/orders', async (req, res) => {
  const customer = req.body.customer || {};
  const userEmail = normalizeEmail(customer.email);
  const name = String(customer.name || '').trim();
  const address = String(customer.address || '').trim();

  if (!name || !isValidEmail(userEmail) || !address) return res.status(400).json({ message: 'Укажите имя, email и адрес доставки.' });
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) return res.status(400).json({ message: 'Корзина пуста.' });

  const store = await readStore();
  const { lines, total } = calculateOrder(store.products, req.body.items);
  if (lines.length === 0) return res.status(400).json({ message: 'В корзине нет доступных товаров.' });

  for (const line of lines) {
    const product = store.products.find((item) => item.id === line.productId);
    product.stock -= line.quantity;
  }

  const order = { id: crypto.randomUUID(), userEmail, customer: { name, address }, items: lines, total, createdAt: new Date().toISOString() };
  store.orders.unshift(order);
  await writeStore(store);
  return res.status(201).json({ order, message: 'Заказ оформлен.' });
});

  return app;
}

if (require.main === module) {
  createApp().listen(PORT, () => console.log(`TechStore запущен: http://localhost:${PORT}`));
}

module.exports = { createApp, filterProducts, calculateOrder, sanitizeQuantity };
