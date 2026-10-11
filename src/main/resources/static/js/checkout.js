// Checkout for BasketHub: delivery details + Cash on Delivery or a DEMO UPI payment.
// The UPI option is a simulation: no real money moves. It replaces the old checkoutNotice() from cart.js.
(function () {
  const css = document.createElement('style');
  css.textContent = `
    .co-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
    .co-box{background:#fff;border-radius:16px;max-width:420px;width:100%;padding:20px;max-height:92vh;overflow-y:auto;font-family:'DM Sans',Arial,sans-serif}
    .co-box h3{margin:0 0 12px}
    .co-box label{display:block;font-size:13px;font-weight:600;margin:10px 0 4px}
    .co-box input[type=text],.co-box input[type=tel],.co-box textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #ddd;border-radius:8px;font:inherit}
    .co-pay{display:block;border:1px solid #ddd;border-radius:10px;padding:10px;margin:8px 0;cursor:pointer;font-weight:500}
    .co-pay input{margin-right:8px}
    .co-actions{display:flex;gap:8px;margin-top:14px}
    .co-actions button{flex:1;border:0;border-radius:10px;padding:11px;font-weight:700;cursor:pointer}
    .co-go{background:#111;color:#fff}.co-cancel{background:#eee}
    .co-err{color:#b3261e;font-size:13px;margin-top:8px;min-height:16px}
    .co-demo{background:#fff7e0;border:1px solid #f0d58a;border-radius:10px;padding:10px;font-size:13px;margin-top:10px}
    .co-amount{font-size:26px;font-weight:800;margin:8px 0}
  `;
  document.head.appendChild(css);

  let overlay = null;
  function closeBox() { if (overlay) { overlay.remove(); overlay = null; } }

  function done(order) {
    closeBox();
    alert('Thank you! Your order #' + order.id + ' is placed. Total: ₹' + order.total);
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof loadCart === 'function') loadCart();
  }

  async function errorText(res) {
    const d = await res.json().catch(() => ({}));
    return d.error || Object.values(d).join(' ') || 'Something went wrong. Please try again.';
  }

  async function sendOrder(url, payload, errEl, btn) {
    btn.disabled = true;
    errEl.textContent = '';
    try {
      const res = await authFetch(url, { method: 'POST', body: JSON.stringify(payload) });
      if (!res) return;
      if (!res.ok) { errEl.textContent = await errorText(res); return; }
      done(await res.json());
    } catch (e) {
      errEl.textContent = e.message || 'Something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
    }
  }

  async function showApproval(details, upiId) {
    let total = '';
    try {
      const r = await authFetch('/api/cart');
      if (r && r.ok) { const c = await r.json(); total = '₹' + Number(c.total).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
    } catch (_) {}

    overlay.querySelector('.co-box').innerHTML = `
      <h3>Approve UPI payment</h3>
      <div>Payment request to <b>${upiId.replace(/[<>&"']/g, '')}</b></div>
      <div class="co-amount">${total}</div>
      <div class="co-demo">Demo payment: this only simulates UPI. No real money is charged.</div>
      <div class="co-err" id="coErr2"></div>
      <div class="co-actions">
        <button type="button" class="co-cancel" id="coDecline">Decline</button>
        <button type="button" class="co-go" id="coApprove">Approve (demo)</button>
      </div>`;
    const errEl = overlay.querySelector('#coErr2');
    overlay.querySelector('#coDecline').addEventListener('click', closeBox);
    const approve = overlay.querySelector('#coApprove');
    approve.addEventListener('click', () =>
      sendOrder('/api/orders/upi-demo', Object.assign({}, details, { upiId }), errEl, approve));
  }

  window.checkoutNotice = function () {
    if (overlay) return;
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) {}

    overlay = document.createElement('div');
    overlay.className = 'co-overlay';
    overlay.innerHTML = `
      <div class="co-box">
        <h3>Delivery &amp; payment</h3>
        <label for="coName">Full name</label><input id="coName" type="text" maxlength="100">
        <label for="coPhone">Phone number</label><input id="coPhone" type="tel" maxlength="15">
        <label for="coAddr">Delivery address</label><textarea id="coAddr" rows="3" maxlength="300"></textarea>
        <label>Payment method</label>
        <label class="co-pay"><input type="radio" name="coPay" value="cod" checked>Cash on Delivery</label>
        <label class="co-pay"><input type="radio" name="coPay" value="upi">UPI (demo, no real money)</label>
        <div id="coUpiBox" style="display:none">
          <label for="coUpi">UPI ID</label><input id="coUpi" type="text" maxlength="80" placeholder="name@upi">
        </div>
        <div class="co-err" id="coErr"></div>
        <div class="co-actions">
          <button type="button" class="co-cancel" id="coCancel">Cancel</button>
          <button type="button" class="co-go" id="coGo">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const nameEl = overlay.querySelector('#coName');
    if (user && user.name) nameEl.value = user.name;
    const errEl = overlay.querySelector('#coErr');
    const goBtn = overlay.querySelector('#coGo');
    const upiBox = overlay.querySelector('#coUpiBox');

    overlay.querySelectorAll('input[name=coPay]').forEach(r => r.addEventListener('change', () => {
      const m = overlay.querySelector('input[name=coPay]:checked').value;
      upiBox.style.display = m === 'upi' ? 'block' : 'none';
      goBtn.textContent = m === 'upi' ? 'Continue' : 'Place order';
    }));
    goBtn.textContent = 'Place order';

    overlay.querySelector('#coCancel').addEventListener('click', closeBox);
    goBtn.addEventListener('click', () => {
      const details = {
        name: nameEl.value.trim(),
        phone: overlay.querySelector('#coPhone').value.trim(),
        address: overlay.querySelector('#coAddr').value.trim()
      };
      if (!details.name || !details.phone || !details.address) {
        errEl.textContent = 'Please fill in your name, phone and address.';
        return;
      }
      const method = overlay.querySelector('input[name=coPay]:checked').value;
      if (method === 'cod') {
        sendOrder('/api/orders/cod', details, errEl, goBtn);
        return;
      }
      const upiId = overlay.querySelector('#coUpi').value.trim();
      if (!/^[a-zA-Z0-9._-]{2,64}@[a-zA-Z0-9]{2,32}$/.test(upiId)) {
        errEl.textContent = 'Please enter a valid UPI ID, for example name@upi';
        return;
      }
      showApproval(details, upiId);
    });
  };
})();
