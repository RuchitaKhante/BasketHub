const grid = document.getElementById('productGrid');
const searchBox = document.getElementById('searchBox');
const categoryFilter = document.getElementById('categoryFilter');
const resultsLabel = document.getElementById('resultsLabel');
let allProducts = [];

// Stable, product-relevant images. These override the old Picsum/placeholder URLs
// in the supplied seed data, which return random or generic images.
const productImages = [
  { keys: ['wireless mouse', 'mouse'], url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=85' },
  { keys: ['running shoes', 'shoe', 'sneaker', 'trainer'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85' },
  { keys: ['water bottle', 'bottle'], url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85' },
  { keys: ['earbud', 'headphone'], url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85' },
  { keys: ['power bank'], url: 'https://media.istockphoto.com/id/1409737619/photo/a-mobile-phone-being-charged-using-a-power-bank-is-on-the-table.jpg?s=1024x1024&w=is&k=20&c=X4clzgh24y3xKF6JKAyksRtSkseYJNPUoLDyfpVULUI=' },
  { keys: ['keyboard'], url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85' },
  { keys: ['smart watch', 'analog wrist watch', 'wrist watch', 'watch'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85' },
  { keys: ['usb-c fast charger', 'fast charger', 'charger'], url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=85' },
  { keys: ['cotton t-shirt', 't-shirt', 'tshirt'], url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85' },
  { keys: ['slim fit jeans', 'jeans'], url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85' },
  { keys: ['hooded sweatshirt', 'hoodie', 'sweatshirt'], url: 'https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D' },
  { keys: ['canvas backpack', 'backpack'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85' },
  { keys: ['ceramic mug', 'mug'], url: 'https://images.unsplash.com/photo-1614940403522-a8c829e7eb82?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { keys: ['frying pan', 'non-stick pan'], url: 'https://plus.unsplash.com/premium_photo-1716488286931-79cef654e08c?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D' },
  { keys: ['desk lamp', 'lamp'], url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=85' },
  { keys: ['bedsheet', 'bed sheet'], url: 'https://images.unsplash.com/photo-1663247135608-594dd5e69b32?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { keys: ['wall clock', 'clock'], url: 'https://images.unsplash.com/photo-1590587754330-6fc06e3a9bb7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { keys: ['javascript programming handbook', 'java book'], url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D' },
  { keys: ['data structures made easy', 'data structures', 'dsa book'], url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=85' },
  { keys: ['python for beginners', 'python book'], url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=85' },
  { keys: ['spiral notebook', 'notebook'], url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85' },
  { keys: ['daily planner', 'planner diary', 'planner', 'diary'], url: 'https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?auto=format&fit=crop&w=800&q=85' },
  { keys: ['yoga mat'], url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=800&q=85' },
  { keys: ['dumbbell'], url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=85' },
  { keys: ['football'], url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=85' },
  { keys: ['skipping rope'], url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=85' },
  { keys: ['badminton', 'racket'], url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=85' }
];
const categoryImages = {
  electronics: 'https://images.unsplash.com/photo-1491497876055-8c1b4e9aefb6?auto=format&fit=crop&w=800&q=85',
  fashion: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85',
  home: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=85',
  books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85',
  sports: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=85'
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}
function getName(p) { return p.name ?? p.productName ?? 'Everyday essential'; }
function getCategory(p) { return p.category ?? p.categoryName ?? ''; }
function getImage(p) {
  const name = String(getName(p)).toLowerCase();
  for (const item of productImages) {
    if (item.keys.some(key => name.includes(key))) {
      // Ignore the deliberately random Picsum/placeholder URLs in the sample SQL.
      return item.url;
    }
  }
  const existing = p.imageUrl ?? p.image_url;
  if (existing && !/picsum\.photos|via\.placeholder\.com/i.test(existing)) return existing;
  return categoryImages[String(getCategory(p)).toLowerCase()] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85';
}

function loadCategories() {
  // Populate categories from the actual product data, so the dropdown still works
  // even if /api/products/categories returns a different response shape.
  const categories = [...new Set(allProducts.map(p => String(getCategory(p)).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const selected = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  if (categories.includes(selected)) categoryFilter.value = selected;
}

async function loadProducts() {
  grid.innerHTML = '<div class="loading-card">Finding good things for you…</div>';
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error(`Products request failed (${response.status})`);
    const data = await response.json();
    allProducts = Array.isArray(data) ? data : (Array.isArray(data.content) ? data.content : []);
    loadCategories();
    applyFilters();
  } catch (error) {
    console.error('Could not load products:', error);
    grid.innerHTML = '<div class="empty-state"><h3>We could not load the collection.</h3><p>Check that Spring Boot is running and that GET /api/products returns a JSON array.</p><button class="btn btn-dark" onclick="loadProducts()">Try again ↻</button></div>';
  }
}

function applyFilters() {
  const query = (searchBox?.value || '').trim().toLowerCase();
  const category = (categoryFilter?.value || '').trim().toLowerCase();
  const filtered = allProducts.filter(p => {
    const text = `${getName(p)} ${p.description || ''} ${getCategory(p)}`.toLowerCase();
    return (!query || text.includes(query)) && (!category || String(getCategory(p)).toLowerCase() === category);
  });
  showProducts(filtered);
}

function showProducts(products) {
  if (!products.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No products found.</h3><p>Try another search or choose a different category.</p><button class="btn btn-dark" onclick="resetFilters()">Show all products ↗</button></div>';
    if (resultsLabel) resultsLabel.textContent = '0 items';
    return;
  }
  if (resultsLabel) resultsLabel.innerHTML = `${products.length} ${products.length === 1 ? 'item' : 'items'} <span>↘</span>`;
  grid.innerHTML = products.map((p, index) => {
    const name = escapeHTML(getName(p));
    const desc = escapeHTML(p.description || 'A little upgrade for your everyday.');
    const category = escapeHTML(getCategory(p) || 'Everyday find');
    const image = escapeHTML(getImage(p));
    const price = Number(p.price ?? 0);
    const id = Number(p.id ?? p.productId);
    return `<article class="product-card"><div class="product-image-wrap"><img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x600/f1f2e9/28372b?text=BasketHub';"><span class="product-badge">${index % 2 === 0 ? 'Everyday pick' : 'Good find'}</span><button class="quick-add" aria-label="Add ${name} to basket" title="Add to basket" onclick="addToCart(${id})">+</button></div><div class="product-meta"><span class="product-category">${category}</span><h3 title="${name}">${name}</h3><p>${desc}</p><div class="product-bottom"><span class="product-price">₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span><span class="product-rating">★ Everyday pick</span></div></div></article>`;
  }).join('');
}

async function addToCart(productId) {
  if (!Number.isFinite(productId) || productId <= 0) { alert('This product has an invalid ID. Check that the API returns an id for each product.'); return; }
  const response = await authFetch('/api/cart', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) });
  if (!response) return;
  let data = {}; try { data = await response.json(); } catch (_) {}
  if (response.ok) { showToast('Added to your basket ✓'); updateCartCount(); }
  else alert(data.error || Object.values(data).join(', ') || 'Could not add this item.');
}
function showToast(message) {
  let toast = document.getElementById('basketToast');
  if (!toast) { toast = document.createElement('div'); toast.id = 'basketToast'; toast.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:99;background:#26372c;color:#fff;padding:14px 18px;border-radius:12px;font-size:12px;font-weight:700;box-shadow:0 12px 30px #0002'; document.body.appendChild(toast); }
  toast.textContent = message; toast.style.opacity = '1'; clearTimeout(window.basketToastTimer); window.basketToastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2400);
}
function resetFilters() { searchBox.value = ''; categoryFilter.value = ''; applyFilters(); }
searchBox.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
loadProducts();
