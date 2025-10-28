export function initProducts(context) {
  const table = document.getElementById('productsTable');
  const formWrapper = document.getElementById('productFormWrapper');
  const form = document.getElementById('productForm');
  const addBtn = document.querySelector('[data-action="add-product"]');
  const cancelBtn = document.querySelector('[data-action="cancel-product"]');
  const shopSelect = document.getElementById('productShop');
  const searchInput = document.getElementById('productSearch');

  const submitBtn = form.querySelector('button[type="submit"]');
  const fields = {
    name: form.querySelector('input[name="name"]'),
    category: form.querySelector('input[name="category"]'),
    subcategory: form.querySelector('input[name="subcategory"]'),
    price: form.querySelector('input[name="price"]'),
    stock: form.querySelector('input[name="stock"]'),
    shopId: form.querySelector('select[name="shopId"]'),
    image: form.querySelector('input[name="image"]')
  };
  let editingProductId = null;

  function toggleForm(show = true, product = null) {
    if (!show) {
      formWrapper.hidden = true;
      form.reset();
      editingProductId = null;
      form.dataset.mode = 'create';
      submitBtn.textContent = 'Enregistrer';
      return;
    }

    formWrapper.hidden = false;
    populateShopOptions(product?.shopId);

    if (product) {
      editingProductId = product.id;
      form.dataset.mode = 'edit';
      submitBtn.textContent = 'Mettre à jour';
      fields.name.value = product.name || '';
      fields.category.value = product.category || '';
      fields.subcategory.value = product.subcategory || '';
      fields.price.value = product.price ?? '';
      fields.stock.value = product.stock ?? '';
      if (product.shopId && Array.from(fields.shopId.options).some((option) => option.value === product.shopId)) {
        fields.shopId.value = product.shopId;
      }
      fields.image.value = product.image || '';
    } else {
      editingProductId = null;
      form.dataset.mode = 'create';
      submitBtn.textContent = 'Enregistrer';
      form.reset();
    }

    fields.name.focus();
  }

  function populateShopOptions(selectedId) {
    const { shops } = context.getData();
    const desiredValue = selectedId ?? shopSelect.value ?? '';

    if (!shops.length) {
      shopSelect.innerHTML = '';
      shopSelect.value = '';
      return;
    }

    shopSelect.innerHTML = shops.map((shop) => `<option value="${shop.id}">${shop.name}</option>`).join('');

    const match = shops.find((shop) => shop.id === desiredValue);
    shopSelect.value = match ? match.id : shops[0].id;
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    if (!name) return;

    const payload = {
      name,
      category: (formData.get('category') || '').trim(),
      subcategory: (formData.get('subcategory') || '').trim(),
      price: Number(formData.get('price')) || 0,
      stock: Number(formData.get('stock')) || 0,
      image: (formData.get('image') || '').trim(),
      shopId: formData.get('shopId')
    };

    context.updateData((draft) => {
      if (editingProductId) {
        const product = draft.products.find((item) => item.id === editingProductId);
        if (product) {
          Object.assign(product, payload);
        }
        return;
      }

      draft.counters.product = (draft.counters.product || 0) + 1;
      draft.products.push({
        id: `product${draft.counters.product}`,
        ...payload
      });
    });

    toggleForm(false);
  });

  searchInput.addEventListener('input', () => render());

  table.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="edit-product"]');
    if (!button) return;
    const productId = button.getAttribute('data-product-id');
    const { products } = context.getData();
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    toggleForm(true, product);
  });

  function render() {
    const { products, shops, settings } = context.getData();
    populateShopOptions(fields.shopId.value);
    const query = searchInput.value.toLowerCase();

    const filtered = products.filter((product) => {
      const haystack = `${product.name} ${product.category} ${product.subcategory}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      table.innerHTML = '<tr><td colspan="6" class="empty-state">Aucun produit trouvé.</td></tr>';
      return;
    }

    table.innerHTML = filtered
      .map((product) => {
        const shop = shops.find((shop) => shop.id === product.shopId);
        const badgeClass = Number(product.stock) <= Number(settings.lowStockThreshold) ? 'badge danger' : 'badge';
        return `
          <tr>
            <td>
              <div>
                <strong>${product.name}</strong><br />
                <span class="badge-neutral">${product.subcategory || ''}</span>
              </div>
            </td>
            <td>${product.category || '—'}</td>
            <td>${context.formatCurrency(product.price, settings.currency)}</td>
            <td><span class="${badgeClass}">${product.stock}</span></td>
            <td>${shop ? shop.name : '—'}</td>
            <td>
              <button type="button" class="small edit" data-action="edit-product" data-product-id="${product.id}">
                Modifier
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  return { render };
}
