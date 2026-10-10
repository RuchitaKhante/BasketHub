const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
async function postJson(url, data) {
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    let body = {}; try { body = await response.json(); } catch (_) { body = { error: 'Unexpected response from server.' }; }
    return { ok: response.ok, body };
  } catch (error) { console.error(error); return { ok: false, body: { error: 'Cannot connect to BasketHub. Make sure the backend is running.' } }; }
}
function showMessage(text, success = false) { if (!message) return; message.style.color = success ? '#55751d' : '#c34232'; message.textContent = text; }
if (registerForm) registerForm.addEventListener('submit', async e => {
  e.preventDefault(); const button = registerForm.querySelector('button[type="submit"]'); button.disabled = true; button.style.opacity = '.7'; showMessage('Creating your account…', true);
  const result = await postJson('/api/auth/register', { name: document.getElementById('name').value.trim(), email: document.getElementById('email').value.trim(), password: document.getElementById('password').value });
  if (result.ok) { showMessage('Account created! Taking you to sign in…', true); window.location.href = 'login.html'; }
  else { showMessage(result.body.error || Object.values(result.body).join(', ') || 'Registration failed.'); button.disabled = false; button.style.opacity = '1'; }
});
if (loginForm) loginForm.addEventListener('submit', async e => {
  e.preventDefault(); const button = loginForm.querySelector('button[type="submit"]'); button.disabled = true; button.style.opacity = '.7'; showMessage('Signing you in…', true);
  const result = await postJson('/api/auth/login', { email: document.getElementById('email').value.trim(), password: document.getElementById('password').value });
  if (result.ok && result.body.token) { localStorage.setItem('token', result.body.token); localStorage.setItem('user', JSON.stringify(result.body.user || {})); window.location.href = 'index.html'; }
  else { showMessage(result.body.error || Object.values(result.body).join(', ') || 'Login failed. Please check your details.'); button.disabled = false; button.style.opacity = '1'; }
});
