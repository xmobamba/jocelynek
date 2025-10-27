export function initSellers(context) {
  const table = document.getElementById('sellersTable');
  const formWrapper = document.getElementById('sellerFormWrapper');
  const form = document.getElementById('sellerForm');
  const shopSelect = document.getElementById('sellerShop');
  const addBtn = document.querySelector('[data-action="add-seller"]');
  const cancelBtn = document.querySelector('[data-action="cancel-seller"]');

  function toggleForm(show = true) {
    formWrapper.hidden = !show;
    if (show) {
      fillShopOptions();
      form.reset();
      form.querySelector('input[name="name"]').focus();
    }
  }

  function fillShopOptions() {
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
      draft.counters.seller = (draft.counters.seller || 0) + 1;
      draft.sellers.push({
        id: `seller${draft.counters.seller}`,
        name,
        phone: (formData.get('phone') || '').trim(),
        shopId: formData.get('shopId')
      });
    });

    toggleForm(false);
  });

  function render() {
    const { sellers, shops, sales, products, settings } = context.getData();
    fillShopOptions();

    if (!sellers.length) {
      table.innerHTML = '<tr><td colspan="5" class="empty-state">Aucune vendeuse enregistrée.</td></tr>';
      return;
    }

    table.innerHTML = sellers
      .map((seller) => {
        const sellerSales = sales.filter((sale) => sale.sellerId === seller.id);
        const total = sellerSales.reduce((sum, sale) => {
          const product = products.find((prod) => prod.id === sale.productId);
          const unit = product ? Number(product.price) : 0;
          return sum + unit * sale.quantity - (sale.discount || 0);
        }, 0);
        const shop = shops.find((shop) => shop.id === seller.shopId);
        return `
          <tr>
            <td>${seller.name}</td>
            <td>${seller.phone || '—'}</td>
            <td>${shop ? shop.name : '—'}</td>
            <td>${sellerSales.length}</td>
            <td>${context.formatCurrency(total, settings.currency)}</td>
          </tr>
        `;
      })
      .join('');
  }

  return { render };
}
