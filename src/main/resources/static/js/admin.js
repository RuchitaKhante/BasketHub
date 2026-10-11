// BasketHub admin page: add, edit and delete products.
// The server only allows this for users with the ADMIN role.
(function () {
  const msg = document.getElementById('msg');
  const rows = document.getElementById('rows');
  const form = document.getElementById('productForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const formTitle = document.getElementById('formTitle');
  let products = [];

  function show(text, ok) {
    msg.textContent = text;
    msg.className = ok ? 'ok' : 'err';
    msg.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function loadProducts() {
    const res = await fetch('/api/products');
    products = res.ok ? await res.json() : [];
    rows.innerHTML = products.map(p => `
      <tr>
        <td>${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="" onerror="this.style.visibility='hidden'">` : ''}</td>
        <td>${esc(p.name)}</td>
        <td>${esc(p.category)}</td>
        <td>₹${esc(p.price)}</td>
        <td>${esc(p.stock)}</td>
        <td>
          <button type="button" class="light" data-edit="${p.id}">Edit</button>
          <button type="button" class="danger" data-del="${p.id}">Delete</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="6">No products yet.</td></tr>';
  }

  function resetForm() {
    form.reset();
    document.getElementById('pid').value = '';
    formTitle.textContent = 'Add a product';
    cancelBtn.style.display = 'none';
  }

  rows.addEventListener('click', async (e) => {
    const editId = e.target.getAttribute('data-edit');
    const delId = e.target.getAttribute('data-del');

    if (editId) {
      const p = products.find(x => String(x.id) === editId);
      if (!p) return;
      document.getElementById('pid').value = p.id;
      document.getElementById('name').value = p.name || '';
      document.getElementById('category').value = p.category || '';
      document.getElementById('price').value = p.price;
      document.getElementById('stock').value = p.stock;
      document.getElementById('imageUrl').value = p.imageUrl || '';
      document.getElementById('description').value = p.description || '';
      formTitle.textContent = 'Edit product #' + p.id;
      cancelBtn.style.display = 'inline-block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (delId) {
      if (!confirm('Delete this product?')) return;
      const res = await authFetch('/api/products/' + delId, { method: 'DELETE' });
      if (!res) return;
      if (res.ok) { show('Product deleted.', true); loadProducts(); }
      else if (res.status === 403) show('Only an admin can do this. Log in with the admin account.', false);
      else show('Could not delete the product.', false);
    }
  });

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pid').value;
    const body = {
      name: document.getElementById('name').value.trim(),
      category: document.getElementById('category').value.trim(),
      price: Number(document.getElementById('price').value),
      stock: parseInt(document.getElementById('stock').value, 10),
      imageUrl: document.getElementById('imageUrl').value.trim(),
      description: document.getElementById('description').value.trim()
    };

    const res = await authFetch(id ? '/api/products/' + id : '/api/products', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
    if (!res) return;

    if (res.ok) {
      show(id ? 'Product updated.' : 'Product added.', true);
      resetForm();
      loadProducts();
    } else if (res.status === 403) {
      show('Only an admin can do this. Log in with the admin account (log out and in again after being made admin).', false);
    } else {
      const data = await res.json().catch(() => ({}));
      show(Object.values(data).join(' ') || 'Could not save the product.', false);
    }
  });

  loadProducts();
})();
