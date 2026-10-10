const container = document.getElementById('cartContainer');
async function loadCart() {
  const response = await authFetch('/api/cart'); if (!response) return;
  let cart; try { cart = await response.json(); } catch (_) { container.innerHTML = '<div class="empty-state">Could not read your basket. Please refresh.</div>'; return; }
  showCart(cart);
}
function safeText(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function cartProductImage(item) {
  const name = String(item.name || '').toLowerCase();
  const matches = [
    [['wireless mouse','mouse'], 'photo-1527814050087-3793815479db'], [['running shoes','shoe','sneaker','trainer'], 'photo-1542291026-7eec264c27ff'],
    [['water bottle','bottle'], 'photo-1602143407151-7111542de6e8'], [['earbud','headphone'], 'photo-1606220945770-b5b6c2c55bf1'],
    [['power bank'], 'photo-1609592424848-3a9b4d7c1e8a'], [['keyboard'], 'photo-1587829741301-dc798b83add3'],
    [['smart watch','analog wrist watch','wrist watch','watch'], 'photo-1523275335684-37898b6baf30'], [['charger'], 'photo-1583863788434-e58a36330cf0'],
    [['cotton t-shirt','t-shirt','tshirt'], 'photo-1521572163474-6864f9cf17ab'], [['slim fit jeans','jeans'], 'photo-1542272604-787c3835535d'],
    [['hooded sweatshirt','hoodie','sweatshirt'], 'photo-1556821840-3a63f95609a7'], [['canvas backpack','backpack'], 'photo-1553062407-98eeb64c6a62'],
    [['ceramic mug','mug'], 'photo-1514228742587-6b1558f5489d'], [['frying pan','non-stick pan'], 'photo-1556911220-bff31c812dba'],
    [['desk lamp','lamp'], 'photo-1503602642458-232111445657'], [['bedsheet','bed sheet'], 'photo-1631049307264-da0ec9d70304'],
    [['wall clock','clock'], 'photo-1563861826100-9cb868e6c7f4'], [['java programming handbook','java book'], 'photo-1532012197267-da84d127e765'],
    [['data structures made easy','data structures','dsa book'], 'photo-1543002588-bfa74002ed7e'], [['python for beginners','python book'], 'photo-1519682337058-a94d519337bc'],
    [['spiral notebook','notebook'], 'photo-1531346878377-a5be20888e57'], [['daily planner','planner diary','planner','diary'], 'photo-1517971129774-8a2b38fa128e'],
    [['yoga mat'], 'photo-1592432678016-e910b452f9a2'], [['dumbbell'], 'photo-1583454110551-21f2fa2afe61'],
    [['football'], 'photo-1579952363873-27f3bade9f55'], [['skipping rope'], 'photo-1517836357463-d25dfeac3438'],
    [['badminton','racket'], 'photo-1626224583764-f87db24ac4ea']
  ];
  for (const [keys, photo] of matches) {
    if (keys.some(key => name.includes(key))) return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=300&q=80`;
  }
  const existing = item.imageUrl || item.image_url;
  if (existing && !/picsum\.photos|via\.placeholder\.com/i.test(existing)) return existing;
  return 'https://placehold.co/300x300/f1f2e9/28372b?text=BasketHub';
}
function showCart(cart) {
  const items = Array.isArray(cart.items) ? cart.items : [];
  const countEl = document.getElementById('cartCount'); if (countEl) countEl.textContent = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (!items.length) { container.innerHTML = `<div class="empty-cart"><div class="empty-icon">🧺</div><h2>Your basket is taking a little break.</h2><p>Looks like you haven't added any good finds yet.</p><a class="btn btn-dark" href="index.html">Explore the collection <span>↗</span></a></div>`; return; }
  const rows = items.map(item => {
    const id = Number(item.id), qty = Number(item.quantity || 1), price = Number(item.price || 0), subtotal = Number(item.subtotal ?? price * qty);
    const image = safeText(cartProductImage(item));
    return `<tr><td><div class="cart-product"><img src="${image}" alt="${safeText(item.name)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80'"><span>${safeText(item.name)}</span></div></td><td>₹${price.toLocaleString('en-IN',{maximumFractionDigits:2})}</td><td><div class="qty-controls"><button class="qty-btn" aria-label="Decrease quantity" onclick="changeQty(${id},${qty - 1})">−</button><span class="qty">${qty}</span><button class="qty-btn" aria-label="Increase quantity" onclick="changeQty(${id},${qty + 1})">+</button></div></td><td><strong>₹${subtotal.toLocaleString('en-IN',{maximumFractionDigits:2})}</strong></td><td><button class="remove-btn" onclick="removeItem(${id})">Remove</button></td></tr>`;
  }).join('');
  const total = Number(cart.total ?? items.reduce((sum, item) => sum + Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 1)), 0));
  container.innerHTML = `<table class="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead><tbody>${rows}</tbody></table><div class="cart-summary"><div><small>YOUR BASKET TOTAL</small><h3>₹${total.toLocaleString('en-IN',{maximumFractionDigits:2})}</h3><small>Shipping and taxes calculated at checkout.</small></div><button class="checkout-btn" onclick="checkoutNotice()">Continue to checkout ↗</button></div>`;
}
async function changeQty(itemId, newQty) {
  if (newQty < 1) return;
  const response = await authFetch('/api/cart/' + itemId, { method: 'PUT', body: JSON.stringify({ quantity: newQty }) }); if (!response) return;
  let data = {}; try { data = await response.json(); } catch (_) {}
  if (response.ok) showCart(data); else alert(data.error || Object.values(data).join(', ') || 'Could not update quantity.');
}
async function removeItem(itemId) {
  const response = await authFetch('/api/cart/' + itemId, { method: 'DELETE' }); if (!response) return;
  let data = {}; try { data = await response.json(); } catch (_) {}
  if (response.ok) showCart(data); else alert(data.error || 'Could not remove this item.');
}
function checkoutNotice() { alert('Checkout is not connected yet. Your basket is ready; payment and order placement need to be implemented in the backend.'); }
loadCart();
