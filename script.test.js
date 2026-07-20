const test = require('node:test');
const assert = require('node:assert/strict');
const { filterPaintings } = require('./script.js');

const fixtures = [
  { title: 'Море', author: 'Автор A', year: '1901', style: 'Импрессионизм', hall: 'Зал 1', mood: 'Свет', description: 'Синий пейзаж' },
  { title: 'Город', author: 'Автор B', year: '1910', style: 'Супрематизм', hall: 'Зал 2', mood: 'Ритм', description: 'Красный квадрат' },
  { title: 'Портрет', author: 'Автор C', year: '1920', style: 'Импрессионизм', hall: 'Зал 2', mood: 'Тишина', description: 'Камерная работа' }
];

test('filterPaintings searches text fields case-insensitively', () => {
  assert.deepEqual(filterPaintings(fixtures, 'кВаДрАт', 'all', 'all'), [fixtures[1]]);
});

test('filterPaintings combines style and hall filters', () => {
  assert.deepEqual(filterPaintings(fixtures, '', 'Импрессионизм', 'Зал 2'), [fixtures[2]]);
});
