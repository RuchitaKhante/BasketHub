// Shared helpers for authenticated API requests and the header.
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return null; }
  options.headers = Object.assign({}, options.headers || {}, { Authorization: 'Bearer ' + token });
  if (options.body) options.headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      window.location.href = 'login.html'; return null;
    }
    return response;
  } catch (error) { console.error(error); alert('Could not connect to BasketHub. Please check that the backend is running.'); return null; }
}
async function updateCartCount() {
  const token = localStorage.getItem('token'); if (!token) return;
  try {
    const response = await fetch('/api/cart', { headers: { Authorization: 'Bearer ' + token } });
    if (!response.ok) return;
    const cart = await response.json(); const el = document.getElementById('cartCount');
    if (el && cart.items) el.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) { console.error('Cart count:', error); }
}
function renderAuthLinks() {
  const authLinks = document.getElementById('authLinks'); if (!authLinks) return;
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) { user = null; }
  
  // Show Admin tab only for users whose stored role is ADMIN
  const adminTab = document.getElementById('adminTab');

  if (adminTab) {
      const isAdmin =
          user &&
          localStorage.getItem('token') &&
          String(user.role || '').toUpperCase() === 'ADMIN';

      adminTab.style.display = isAdmin ? 'inline-block' : 'none';
  }
  
  if (user && localStorage.getItem('token')) {
    const safeName = String(user.name || 'Shopper').replace(/[<>"'&]/g, '');
    authLinks.innerHTML = `<a href="cart.html" class="header-pill">♡ Basket (<span id="cartCount">0</span>)</a><span class="welcome-user">Hi, ${safeName}</span><a href="#" id="logoutLink">Log out</a>`;
    document.getElementById('logoutLink').addEventListener('click', e => { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html'; });
    updateCartCount();
  } else {
    authLinks.innerHTML = '<a href="login.html">Sign in</a><a class="header-pill" href="register.html">Join us ↗</a>';
  }
}
document.addEventListener('DOMContentLoaded', () => { renderAuthLinks(); const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear(); });
