// Checkout for BasketHub: delivery details + Cash on Delivery or online payment (Razorpay).
// It replaces the old checkoutNotice() message from cart.js.
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
  `;
  document.head.appendChild(css);

  function loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load the payment window'));
      document.head.appendChild(s);
    });
  }

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

  async function submit(details, method, errEl, goBtn) {
    goBtn.disabled = true;
    errEl.textContent = '';
    try {
      if (method === 'cod') {
        const res = await authFetch('/api/orders/cod', { method: 'POST', body: JSON.stringify(details) });
        if (!res) return;
        if (!res.ok) { errEl.textContent = await errorText(res); return; }
        done(await res.json());
        return;
      }

      // online payment
      const start = await authFetch('/api/orders/online/start', { method: 'POST', body: JSON.stringify(details) });
      if (!start) return;
      if (!start.ok) { errEl.textContent = await errorText(start); return; }
      const s = await start.json();
      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: s.keyId,
        amount: s.amountPaise,
        currency: s.currency,
        name: 'BasketHub',
        description: 'Order payment',
        order_id: s.razorpayOrderId,
        prefill: { name: details.name, contact: details.phone },
        handler: async function (response) {
          const v = await authFetch('/api/orders/online/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderId: s.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          if (!v) return;
          if (v.ok) done(await v.json());
          else alert(await errorText(v));
        }
      });
      rzp.on('payment.failed', function (r) {
        alert('Payment failed: ' + ((r.error && r.error.description) || 'please try again.'));
      });
      rzp.open();
    } catch (e) {
      errEl.textContent = e.message || 'Something went wrong. Please try again.';
    } finally {
      goBtn.disabled = false;
    }
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
        <label class="co-pay"><input type="radio" name="coPay" value="online">Pay online (UPI / card)</label>
        <div class="co-err" id="coErr"></div>
        <div class="co-actions">
          <button type="button" class="co-cancel" id="coCancel">Cancel</button>
          <button type="button" class="co-go" id="coGo">Place order</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const nameEl = overlay.querySelector('#coName');
    if (user && user.name) nameEl.value = user.name;
    const errEl = overlay.querySelector('#coErr');
    const goBtn = overlay.querySelector('#coGo');

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
      submit(details, method, errEl, goBtn);
    });
  };
})();
