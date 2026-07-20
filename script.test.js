const test = require('node:test');
const assert = require('node:assert/strict');
const { filterProducts, buildCartItems } = require('./script.js');
const { calculateOrder, sanitizeQuantity } = require('./server.js');

const products = [
  { id: 'phone', category: 'smartphones', name: 'Phone', price: 100, stock: 2 },
  { id: 'laptop', category: 'laptops', name: 'Laptop', price: 500, stock: 1 }
];

test('filterProducts returns all products or one category', () => {
  assert.deepEqual(filterProducts(products, 'all'), products);
  assert.deepEqual(filterProducts(products, 'smartphones'), [products[0]]);
});

test('buildCartItems joins cart rows with products and totals', () => {
  assert.deepEqual(buildCartItems([{ productId: 'phone', quantity: 2 }], products), [{ ...products[0], quantity: 2, subtotal: 200 }]);
});

test('sanitizeQuantity accepts only positive integer values', () => {
  assert.equal(sanitizeQuantity('3'), 3);
  assert.equal(sanitizeQuantity('-1'), 0);
  assert.equal(sanitizeQuantity('abc'), 0);
});

test('calculateOrder caps quantities by stock and calculates total', () => {
  assert.deepEqual(calculateOrder(products, [{ productId: 'phone', quantity: 5 }, { productId: 'missing', quantity: 1 }]), {
    lines: [{ productId: 'phone', name: 'Phone', price: 100, quantity: 2, subtotal: 200 }],
    total: 200
  });
});
