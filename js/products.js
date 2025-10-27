export function initProducts(context) {
  const table = document.getElementById('productsTable');
  const formWrapper = document.getElementById('productFormWrapper');
  const form = document.getElementById('productForm');
  const addBtn = document.querySelector('[data-action="add-product"]');
  const cancelBtn = document.querySelector('[data-action="cancel-product"]');
  const shopSelect = document.getElementById('productShop');
  const searchInput = document.getElementById('productSearch');

  function toggleForm(show = true) {
    formWrapper.hidden = !show;
    if (show) {
      populateShopOptions();
      form.reset();
      form.querySelector('input[name="name"]').focus();
    }
  }

  function populateShopOptions() {
    const { shops } = context.getData();
    shopSelect.innerHTML = shops.map((shop) => `<option value="${shop.id}">${shop.name}</option>`).join('');
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    if (!name) return;

    context.updateData((draft) => {
      draft.counters.product = (draft.counters.product || 0) + 1;
      draft.products.push({
        id: `product${draft.counters.product}`,
        name,
        category: (formData.get('category') || '').trim(),
        subcategory: (formData.get('subcategory') || '').trim(),
        price: Number(formData.get('price')) || 0,
        stock: Number(formData.get('stock')) || 0,
        image: (formData.get('image') || '').trim(),
        shopId: formData.get('shopId')
      });
    });

    toggleForm(false);
  });

  searchInput.addEventListener('input', () => render());

  function render() {
    const { products, shops, settings } = context.getData();
    populateShopOptions();
    const query = searchInput.value.toLowerCase();

    const filtered = products.filter((product) => {
      const haystack = `${product.name} ${product.category} ${product.subcategory}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      table.innerHTML = '<tr><td colspan="5" class="empty-state">Aucun produit trouvé.</td></tr>';
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
          </tr>
        `;
      })
      .join('');
  }

  return { render };
}
