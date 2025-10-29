export function initShops(context) {
  const table = document.getElementById('shopsTable');
  const formWrapper = document.getElementById('shopFormWrapper');
  const form = document.getElementById('shopForm');
  const addBtn = document.querySelector('[data-action="add-shop"]');
  const cancelBtn = document.querySelector('[data-action="cancel-shop"]');

  function toggleForm(show = true) {
    formWrapper.hidden = !show;
    if (show) {
      form.reset();
      form.querySelector('input[name="name"]').focus();
    }
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    if (!name) return;

    context.updateData((draft) => {
      const id = `shop${draft.shops.length + 1}`;
      draft.shops.push({
        id,
        name,
        location: (formData.get('location') || '').trim()
      });
    });

    toggleForm(false);
  });

  function render() {
    const { shops, products, sales } = context.getData();
    if (!shops.length) {
      table.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune boutique.</td></tr>';
      return;
    }

    table.innerHTML = shops
      .map((shop) => {
        const productsCount = products.filter((product) => product.shopId === shop.id).length;
        const salesCount = sales.filter((sale) => sale.shopId === shop.id).length;
        return `
          <tr>
            <td>${shop.name}</td>
            <td>${shop.location || '—'}</td>
            <td>${productsCount}</td>
            <td>${salesCount}</td>
          </tr>
        `;
      })
      .join('');
  }

  return { render };
}
