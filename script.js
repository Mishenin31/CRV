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

const cards = document.querySelector('#cards');
const detail = document.querySelector('#detail');
const searchInput = document.querySelector('#searchInput');
const styleFilter = document.querySelector('#styleFilter');
const hallFilter = document.querySelector('#hallFilter');
const emptyState = document.querySelector('#emptyState');

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
  return `${painting.title}\n${painting.author}, ${painting.year}\n${painting.style}, ${painting.hall}\n${painting.description}\nСсылка: ${paintingUrl(painting)}`;
}

function renderCards() {
  const query = searchInput.value.trim().toLowerCase();
  const style = styleFilter.value;
  const hall = hallFilter.value;
  const filtered = paintings.filter((painting) => {
    const haystack = [painting.title, painting.author, painting.year, painting.style, painting.hall, painting.mood, painting.description].join(' ').toLowerCase();
    return (!query || haystack.includes(query)) && (style === 'all' || painting.style === style) && (hall === 'all' || painting.hall === hall);
  });

  cards.innerHTML = filtered.map((painting) => `
    <article class="card" style="--painting-gradient: ${painting.colors}">
      <div class="card__image" aria-hidden="true"></div>
      <div class="card__body">
        <h3>${painting.title}</h3>
        <p class="meta">${painting.author} · ${painting.year}<br>${painting.style} · ${painting.hall}</p>
        <div class="tags"><span class="tag">${painting.mood}</span><span class="tag">NFC: #${painting.id}</span></div>
        <a class="button" href="#${painting.id}">Страница картины</a>
      </div>
    </article>
  `).join('');
  emptyState.classList.toggle('hidden', filtered.length > 0);
}

function renderDetail() {
  const id = decodeURIComponent(location.hash.replace('#', ''));
  const painting = paintings.find((item) => item.id === id);
  detail.classList.toggle('hidden', !painting);
  if (!painting) return;

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
        <strong>QR-код с информацией о картине</strong>
        <p class="meta">Посетитель может отсканировать код и сохранить описание или ссылку на страницу.</p>
        <canvas id="qrCanvas" aria-label="QR-код картины ${painting.title}"></canvas>
      </div>
    </div>
    <div class="detail__image" aria-hidden="true"></div>
  `;

  const canvas = document.querySelector('#qrCanvas');
  if (window.QRCode) {
    QRCode.toCanvas(canvas, qrText(painting), { width: 180, margin: 1, color: { dark: '#201a17', light: '#ffffff' } });
  }

  document.querySelector('#copyLink').addEventListener('click', async () => {
    await navigator.clipboard.writeText(paintingUrl(painting));
    document.querySelector('#copyLink').textContent = 'Ссылка скопирована';
  });
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

fillFilters();
renderCards();
renderDetail();
[searchInput, styleFilter, hallFilter].forEach((control) => control.addEventListener('input', renderCards));
window.addEventListener('hashchange', renderDetail);
