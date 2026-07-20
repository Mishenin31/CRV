const paintings = [
  {
    id: 'starry-night',
    title: 'Звёздная ночь',
    author: 'Винсент Ван Гог',
    year: '1889',
    style: 'Постимпрессионизм',
    hall: 'Зал 1',
    mood: 'Динамика',
    colors: 'linear-gradient(135deg, #101d42, #1f5f99 48%, #f3c44d 49%, #f9ed9c)',
    description: 'Вихревое ночное небо показывает, как художник превращал внутреннее переживание в ритм цвета и мазка. Страница подходит для NFC-метки рядом с репродукцией.',
    fact: 'Картина написана в Сен-Реми и стала одним из самых узнаваемых образов ночного пейзажа.'
  },
  {
    id: 'girl-with-pearl',
    title: 'Девушка с жемчужной серёжкой',
    author: 'Ян Вермеер',
    year: 'ок. 1665',
    style: 'Барокко',
    hall: 'Зал 2',
    mood: 'Тишина',
    colors: 'linear-gradient(135deg, #111, #243b55 45%, #e5c06b 46%, #f7dfb2)',
    description: 'Камерный портрет строится на взгляде, мягком свете и контрасте тёмного фона с сиянием жемчуга.',
    fact: 'Работу часто называют «северной Моной Лизой» за загадочность выражения лица.'
  },
  {
    id: 'great-wave',
    title: 'Большая волна в Канагаве',
    author: 'Кацусика Хокусай',
    year: '1831',
    style: 'Укиё-э',
    hall: 'Зал 3',
    mood: 'Энергия',
    colors: 'linear-gradient(135deg, #f8f0d8, #2b6cb0 48%, #0f2f57 49%, #d8edf8)',
    description: 'Гравюра соединяет силу природы, графическую ясность и выразительный силуэт горы Фудзи вдали.',
    fact: 'Это лист из серии «Тридцать шесть видов Фудзи».'
  },
  {
    id: 'birth-of-venus',
    title: 'Рождение Венеры',
    author: 'Сандро Боттичелли',
    year: 'ок. 1485',
    style: 'Ренессанс',
    hall: 'Зал 2',
    mood: 'Лёгкость',
    colors: 'linear-gradient(135deg, #cbe5df, #f5d6bd 48%, #b6d6a8 49%, #f8efe1)',
    description: 'Мифологический сюжет представлен как торжественный выход красоты, где линия важнее материальной тяжести фигур.',
    fact: 'Темперная живопись на холсте была необычным выбором для крупного произведения XV века.'
  },
  {
    id: 'black-square',
    title: 'Чёрный квадрат',
    author: 'Казимир Малевич',
    year: '1915',
    style: 'Супрематизм',
    hall: 'Зал 4',
    mood: 'Концепт',
    colors: 'linear-gradient(135deg, #f2eee7 0 35%, #050505 36% 72%, #d7ccbd 73%)',
    description: 'Работа сводит изображение к знаку и предлагает смотреть на картину как на идею, а не окно в реальность.',
    fact: 'Полотно стало ключевым символом русского авангарда.'
  },
  {
    id: 'water-lilies',
    title: 'Кувшинки',
    author: 'Клод Моне',
    year: '1916',
    style: 'Импрессионизм',
    hall: 'Зал 1',
    mood: 'Созерцание',
    colors: 'linear-gradient(135deg, #8fc3a9, #6b8fc9 45%, #d0b4dd 46%, #f2d2a9)',
    description: 'Сад в Живерни становится почти абстрактным полем света, отражений и цветовых вибраций.',
    fact: 'Моне писал серии кувшинок много лет, наблюдая один и тот же мотив в разном свете.'
  }
];

const STORAGE_KEYS = {
  registrations: 'crvRegistrations',
  purchases: 'crvPurchaseRequests',
  users: 'crvUsers',
  session: 'crvSession'
};

const SECTION_HASHES = new Set(['', 'catalog', 'auth', 'adminCabinet']);

const DEFAULT_ADMIN = {
  name: 'Администратор crv',
  email: 'admin@crv.local',
  password: 'admin123',
  role: 'Админ'
};

const cards = typeof document !== 'undefined' ? document.querySelector('#cards') : null;
const detail = typeof document !== 'undefined' ? document.querySelector('#detail') : null;
const searchInput = typeof document !== 'undefined' ? document.querySelector('#searchInput') : null;
const styleFilter = typeof document !== 'undefined' ? document.querySelector('#styleFilter') : null;
const hallFilter = typeof document !== 'undefined' ? document.querySelector('#hallFilter') : null;
const emptyState = typeof document !== 'undefined' ? document.querySelector('#emptyState') : null;
const registrationForm = typeof document !== 'undefined' ? document.querySelector('#registrationForm') : null;
const registrationResult = typeof document !== 'undefined' ? document.querySelector('#registrationResult') : null;
const loginForm = typeof document !== 'undefined' ? document.querySelector('#loginForm') : null;
const loginResult = typeof document !== 'undefined' ? document.querySelector('#loginResult') : null;
const managerForm = typeof document !== 'undefined' ? document.querySelector('#managerForm') : null;
const managerResult = typeof document !== 'undefined' ? document.querySelector('#managerResult') : null;
const adminCabinet = typeof document !== 'undefined' ? document.querySelector('#adminCabinet') : null;
const usersList = typeof document !== 'undefined' ? document.querySelector('#usersList') : null;
const currentUserInfo = typeof document !== 'undefined' ? document.querySelector('#currentUserInfo') : null;
const logoutButton = typeof document !== 'undefined' ? document.querySelector('#logoutButton') : null;

function uniqueOptions(key) {
  return [...new Set(paintings.map((painting) => painting[key]))].sort();
}

function fillFilters() {
  uniqueOptions('style').forEach((style) => styleFilter.append(new Option(style, style)));
  uniqueOptions('hall').forEach((hall) => hallFilter.append(new Option(hall, hall)));
}

function paintingUrl(painting) {
  return `${location.origin}${location.pathname}#${painting.id}`;
}

function qrText(painting) {
  return paintingUrl(painting);
}

function filterPaintings(items, query = '', style = 'all', hall = 'all') {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((painting) => {
    const haystack = [
      painting.title,
      painting.author,
      painting.year,
      painting.style,
      painting.hall,
      painting.mood,
      painting.description
    ].join(' ').toLowerCase();

    return (!normalizedQuery || haystack.includes(normalizedQuery))
      && (style === 'all' || painting.style === style)
      && (hall === 'all' || painting.hall === hall);
  });
}

function readStoredItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveStoredItem(key, item) {
  const items = readStoredItems(key);
  items.push({ ...item, createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(items));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email) {
  return email.toString().trim().toLowerCase();
}

function getUsers() {
  const users = readStoredItems(STORAGE_KEYS.users);
  const hasAdmin = users.some((user) => user.role === 'Админ');
  return hasAdmin ? users : [{ ...DEFAULT_ADMIN, createdAt: new Date().toISOString() }, ...users];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function seedUsers() {
  saveUsers(getUsers());
}

function getCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.session));
    if (!session?.email) return null;
    return getUsers().find((user) => user.email === session.email) || null;
  } catch {
    return null;
  }
}

function isAdmin(user) {
  return user?.role === 'Админ';
}

function canRegisterRole(role, currentUser) {
  if (role === 'Покупатель') return true;
  if (role === 'Менеджер') return isAdmin(currentUser);
  return false;
}

function addUser({ name, email, password, role }, currentUser = null) {
  const cleanName = name.toString().trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password.toString();

  if (!cleanName) return { ok: false, message: 'Введите имя.' };
  if (!cleanEmail || !isValidEmail(cleanEmail)) return { ok: false, message: 'Введите корректный email, например name@example.com.' };
  if (cleanPassword.length < 6) return { ok: false, message: 'Пароль должен содержать минимум 6 символов.' };
  if (!canRegisterRole(role, currentUser)) return { ok: false, message: 'Менеджеров может добавлять только администратор.' };

  const users = getUsers();
  if (users.some((user) => user.email === cleanEmail)) return { ok: false, message: 'Пользователь с таким email уже существует.' };

  const user = { name: cleanName, email: cleanEmail, password: cleanPassword, role, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  saveStoredItem(STORAGE_KEYS.registrations, { name: cleanName, email: cleanEmail, role });
  return { ok: true, user, message: `${cleanName}, регистрация в роли «${role}» выполнена.` };
}

function login(email, password) {
  const cleanEmail = normalizeEmail(email);
  const user = getUsers().find((item) => item.email === cleanEmail && item.password === password.toString());
  if (!user) return { ok: false, message: 'Неверный email или пароль.' };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ email: user.email }));
  return { ok: true, user, message: `Вы вошли как ${user.name} (${user.role}).` };
}

function renderUsers() {
  if (!usersList) return;
  const users = getUsers();
  usersList.innerHTML = users.map((user) => `
    <div class="user-row">
      <strong>${user.name}</strong>
      <span>${user.email}</span>
      <span class="tag">${user.role}</span>
    </div>
  `).join('');
}

function renderAuthState() {
  const user = getCurrentUser();
  document.querySelectorAll('.admin-only').forEach((item) => item.classList.toggle('hidden', !isAdmin(user)));
  if (adminCabinet) adminCabinet.classList.toggle('hidden', !isAdmin(user));
  if (currentUserInfo) currentUserInfo.textContent = user ? `Сейчас в системе: ${user.name} (${user.role}).` : 'Войдите как администратор, чтобы открыть кабинет.';
  renderUsers();
}

function renderCards() {
  const query = searchInput.value;
  const style = styleFilter.value;
  const hall = hallFilter.value;
  const filtered = filterPaintings(paintings, query, style, hall);

  cards.innerHTML = filtered.map((painting) => `
    <article class="card" style="--painting-gradient: ${painting.colors}">
      <div class="card__image" role="img" aria-label="Цветовая композиция картины ${painting.title}"></div>
      <div class="card__body">
        <h3>${painting.title}</h3>
        <p class="meta">${painting.author} · ${painting.year}<br>${painting.style} · ${painting.hall}</p>
        <div class="tags"><span class="tag">${painting.mood}</span><span class="tag">NFC: #${painting.id}</span></div>
        <div class="card__actions">
          <a class="button" href="#${painting.id}">Страница картины</a>
          <button class="button button--ghost buy-button" type="button" data-id="${painting.id}" data-title="${painting.title}">Купить</button>
        </div>
      </div>
    </article>
  `).join('');
  emptyState.classList.toggle('hidden', filtered.length > 0);
  document.querySelectorAll('.buy-button').forEach((button) => {
    button.addEventListener('click', () => {
      saveStoredItem(STORAGE_KEYS.purchases, {
        paintingId: button.dataset.id,
        title: button.dataset.title
      });
      button.textContent = 'Заявка отправлена';
      button.disabled = true;
    });
  });
}

function renderNotFound(id) {
  detail.classList.remove('hidden');
  detail.removeAttribute('style');
  detail.innerHTML = `
    <div class="detail__content detail__content--not-found">
      <p class="eyebrow">NFC-страница</p>
      <h2>Экспонат не найден</h2>
      <p class="meta">Экспонат с идентификатором «${id}» отсутствует в каталоге crv.</p>
      <div class="detail__actions">
        <a class="button" href="#catalog">Вернуться в каталог</a>
      </div>
    </div>
  `;
}

function renderDetail() {
  const id = decodeURIComponent(location.hash.replace('#', ''));
  const painting = paintings.find((item) => item.id === id);

  if (!painting) {
    detail.classList.toggle('hidden', SECTION_HASHES.has(id));
    if (!SECTION_HASHES.has(id)) {
      renderNotFound(id);
    }
    return;
  }

  detail.classList.remove('hidden');
  detail.style.setProperty('--painting-gradient', painting.colors);
  detail.innerHTML = `
    <div class="detail__content">
      <p class="eyebrow">${painting.hall} · NFC-страница</p>
      <h2>${painting.title}</h2>
      <p class="meta">${painting.author} · ${painting.year} · ${painting.style}</p>
      <p>${painting.description}</p>
      <div class="facts">
        <div class="fact"><strong>Настроение</strong>${painting.mood}</div>
        <div class="fact"><strong>Факт</strong>${painting.fact}</div>
      </div>
      <div class="detail__actions">
        <a class="button" href="#catalog">Выйти в каталог</a>
        <button class="button button--ghost" type="button" id="copyLink">Скопировать ссылку для NFC</button>
      </div>
      <div class="qr-panel">
        <strong>QR-код со ссылкой на картину</strong>
        <p class="meta">Посетитель может отсканировать код и открыть страницу экспоната.</p>
        <canvas id="qrCanvas" aria-label="QR-код картины ${painting.title}"></canvas>
        <p id="qrFallback" class="qr-fallback hidden"><a href="${paintingUrl(painting)}">${paintingUrl(painting)}</a></p>
      </div>
    </div>
    <div class="detail__image" role="img" aria-label="Цветовая композиция картины ${painting.title}"></div>
  `;

  const canvas = document.querySelector('#qrCanvas');
  const fallback = document.querySelector('#qrFallback');
  if (window.QRCode) {
    QRCode.toCanvas(canvas, qrText(painting), { width: 180, margin: 1, color: { dark: '#201a17', light: '#ffffff' } });
  } else {
    canvas.classList.add('hidden');
    fallback.classList.remove('hidden');
  }

  document.querySelector('#copyLink').addEventListener('click', async () => {
    await navigator.clipboard.writeText(paintingUrl(painting));
    document.querySelector('#copyLink').textContent = 'Ссылка скопирована';
  });
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleRegistrationSubmit(event) {
  event.preventDefault();
  const formData = new FormData(registrationForm);
  const result = addUser({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role')
  });

  registrationResult.textContent = result.message;
  if (result.ok) registrationForm.reset();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const result = login(formData.get('email'), formData.get('password'));
  loginResult.textContent = result.message;
  if (result.ok) {
    loginForm.reset();
    renderAuthState();
    if (isAdmin(result.user)) location.hash = 'adminCabinet';
  }
}

function handleManagerSubmit(event) {
  event.preventDefault();
  const formData = new FormData(managerForm);
  const result = addUser({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: 'Менеджер'
  }, getCurrentUser());

  managerResult.textContent = result.message;
  if (result.ok) {
    managerForm.reset();
    renderUsers();
  }
}

if (typeof document !== 'undefined') {
  seedUsers();
  fillFilters();
  registrationForm.addEventListener('submit', handleRegistrationSubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  managerForm.addEventListener('submit', handleManagerSubmit);
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    renderAuthState();
    location.hash = 'auth';
  });
  renderCards();
  renderDetail();
  [searchInput, styleFilter, hallFilter].forEach((control) => control.addEventListener('input', renderCards));
  window.addEventListener('hashchange', renderDetail);
  renderAuthState();
}

if (typeof module !== 'undefined') {
  module.exports = { filterPaintings, canRegisterRole, isAdmin };
}
