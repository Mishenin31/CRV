const API = '/api';
const CART_KEY = 'techStoreCart';
const SESSION_KEY = 'techStoreUser';
const categories = { smartphones: 'Смартфоны', laptops: 'Ноутбуки', accessories: 'Аксессуары' };

const state = { products: [], category: 'all' };
const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

function readCart() { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCart(); }
function getSession() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); renderAccount(); }

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Ошибка сервера');
  return data;
}

function filterProducts(products, category = 'all') {
  return category === 'all' ? products : products.filter((product) => product.category === category);
}

function buildCartItems(cart, products) {
  return cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? { ...product, quantity: item.quantity, subtotal: product.price * item.quantity } : null;
  }).filter(Boolean);
}

async function loadProducts(category = state.category) {
  state.category = category;
  state.products = await request(`/products?category=${encodeURIComponent(category)}`);
  renderProducts();
  renderCart();
}

function renderProducts() {
  $('#products').innerHTML = state.products.map((product) => `
    <article class="card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="card__body">
        <span class="tag">${categories[product.category]}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="meta">В наличии: ${product.stock} шт.</p>
        <strong>${money(product.price)}</strong>
        <div class="actions">
          <a class="button button--ghost" href="#${product.id}">Карточка товара</a>
          <button class="button" data-add="${product.id}" type="button">В корзину</button>
        </div>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => addToCart(button.dataset.add)));
}

async function renderProductDetail() {
  const id = location.hash.slice(1);
  if (!id || ['catalog', 'cart', 'auth', 'account'].includes(id)) return $('#product').classList.add('hidden');
  try {
    const product = await request(`/products/${id}`);
    $('#product').classList.remove('hidden');
    $('#product').innerHTML = `
      <div class="product-detail">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <p class="eyebrow">Карточка товара</p>
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p class="meta">Категория: ${categories[product.category]} · Количество на складе: ${product.stock}</p>
          <strong class="price">${money(product.price)}</strong>
          <button class="button" data-add="${product.id}" type="button">Добавить в корзину</button>
        </div>
      </div>`;
    $('#product [data-add]').addEventListener('click', () => addToCart(product.id));
    $('#product').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    $('#product').classList.remove('hidden');
    $('#product').innerHTML = `<h2>Товар не найден</h2><p>${error.message}</p>`;
  }
}

function addToCart(productId) {
  const cart = readCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (item) item.quantity += 1; else cart.push({ productId, quantity: 1 });
  saveCart(cart);
}

function changeQuantity(productId, delta) {
  const cart = readCart().map((item) => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0);
  saveCart(cart);
}

function renderCart() {
  const cartItems = buildCartItems(readCart(), state.products);
  $('#cartCounter').textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  $('#cartItems').innerHTML = cartItems.length ? cartItems.map((item) => `
    <div class="cart-row">
      <span>${item.name}</span><span>${money(item.price)} × ${item.quantity}</span>
      <div><button data-minus="${item.id}">−</button><button data-plus="${item.id}">+</button></div>
    </div>`).join('') : '<p class="meta">Корзина пуста.</p>';
  $('#cartTotal').textContent = `Итого: ${money(cartItems.reduce((sum, item) => sum + item.subtotal, 0))}`;
  document.querySelectorAll('[data-minus]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.minus, -1)));
  document.querySelectorAll('[data-plus]').forEach((button) => button.addEventListener('click', () => changeQuantity(button.dataset.plus, 1)));
}

async function renderAccount() {
  const user = getSession();
  $('#accountUser').textContent = user ? `${user.name} (${user.email})` : 'Войдите, чтобы увидеть свои заказы.';
  if (!user) return $('#orders').innerHTML = '';
  const orders = await request(`/orders/${encodeURIComponent(user.email)}`);
  $('#orders').innerHTML = orders.length ? orders.map((order) => `<div class="order"><strong>Заказ ${order.id.slice(0, 8)}</strong><span>${new Date(order.createdAt).toLocaleString('ru-RU')}</span><span>${money(order.total)}</span></div>`).join('') : '<p class="meta">Заказов пока нет.</p>';
}

function bindForms() {
  $('#registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = $('#registerResult');
    try { const data = await request('/register', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); result.textContent = data.message; setSession(data.user); event.target.reset(); }
    catch (error) { result.textContent = error.message; }
  });
  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = $('#loginResult');
    try { const data = await request('/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); result.textContent = data.message; setSession(data.user); }
    catch (error) { result.textContent = error.message; }
  });
  $('#orderForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = $('#orderResult');
    try {
      const customer = Object.fromEntries(new FormData(event.target));
      const data = await request('/orders', { method: 'POST', body: JSON.stringify({ customer, items: readCart() }) });
      result.textContent = data.message; saveCart([]); event.target.reset(); await loadProducts(); await renderAccount();
    } catch (error) { result.textContent = error.message; }
  });
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    loadProducts(button.dataset.category);
  }));
  bindForms();
  loadProducts();
  renderProductDetail();
  renderAccount();
  window.addEventListener('hashchange', renderProductDetail);
}

if (typeof module !== 'undefined') module.exports = { filterProducts, buildCartItems };
