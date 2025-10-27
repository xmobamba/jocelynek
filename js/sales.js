import { todayISO } from './utils.js';

export function initSales(context) {
  const table = document.getElementById('salesTable');
  const formWrapper = document.getElementById('saleFormWrapper');
  const form = document.getElementById('saleForm');
  const addBtn = document.querySelector('[data-action="add-sale"]');
  const cancelBtn = document.querySelector('[data-action="cancel-sale"]');
  const productSelect = document.getElementById('saleProduct');
  const shopSelect = document.getElementById('saleShop');
  const sellerSelect = document.getElementById('saleSeller');
  const quantityInput = document.getElementById('saleQuantity');
  const discountInput = document.getElementById('saleDiscount');
  const dateInput = document.getElementById('saleDate');
  const unitPriceDisplay = document.getElementById('saleUnitPrice');
  const totalDisplay = document.getElementById('saleTotal');
  const searchInput = document.getElementById('salesSearch');

  function toggleForm(show = true) {
    formWrapper.hidden = !show;
    if (show) {
      populateSelects();
      form.reset();
      dateInput.value = todayISO();
      quantityInput.value = 1;
      discountInput.value = 0;
      updateSummary();
      productSelect.focus();
    }
  }

  function populateSelects() {
    const { products, shops, sellers } = context.getData();
    productSelect.innerHTML = products
      .map((product) => `<option value="${product.id}">${product.name}</option>`)
      .join('');
    shopSelect.innerHTML = shops.map((shop) => `<option value="${shop.id}">${shop.name}</option>`).join('');
    sellerSelect.innerHTML = sellers
      .map((seller) => `<option value="${seller.id}">${seller.name}</option>`)
      .join('');
  }

  function updateSummary() {
    const { products, settings } = context.getData();
    const product = products.find((prod) => prod.id === productSelect.value);
    const unitPrice = product ? Number(product.price) : 0;
    const quantity = Number(quantityInput.value) || 0;
    const discount = Number(discountInput.value) || 0;
    const total = unitPrice * quantity - discount;
    unitPriceDisplay.textContent = context.formatCurrency(unitPrice, settings.currency);
    totalDisplay.textContent = context.formatCurrency(Math.max(total, 0), settings.currency);
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  ;['change', 'input'].forEach((eventName) => {
    productSelect.addEventListener(eventName, updateSummary);
    quantityInput.addEventListener(eventName, updateSummary);
    discountInput.addEventListener(eventName, updateSummary);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const productId = formData.get('productId');
    const shopId = formData.get('shopId');
    const sellerId = formData.get('sellerId');
    const quantity = Number(formData.get('quantity')) || 1;
    const discount = Number(formData.get('discount')) || 0;
    const date = formData.get('date') || todayISO();

    if (!productId || !sellerId || !shopId) return;

    const saleNumber = context.generateSaleNumber();

    context.updateData((draft) => {
      const product = draft.products.find((prod) => prod.id === productId);
      if (!product) return;
      product.stock = Math.max(0, Number(product.stock) - quantity);
      draft.sales.push({
        id: crypto.randomUUID(),
        number: saleNumber,
        productId,
        shopId,
        sellerId,
        quantity,
        discount,
        date,
        notes: (formData.get('notes') || '').trim()
      });
    });

    const data = context.getData();
    const sale = data.sales[data.sales.length - 1];
    if (sale) {
      printReceipt(sale, data, context.formatCurrency.bind(context));
    }

    toggleForm(false);
  });

  searchInput.addEventListener('input', () => render());

  function render() {
    const { sales, products, sellers, shops, settings } = context.getData();
    populateSelects();
    updateSummary();
    const query = searchInput.value.toLowerCase();

    const filtered = sales.filter((sale) => {
      const product = products.find((prod) => prod.id === sale.productId);
      const seller = sellers.find((sel) => sel.id === sale.sellerId);
      const haystack = `${sale.number} ${sale.date} ${product?.name || ''} ${seller?.name || ''}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      table.innerHTML = '<tr><td colspan="8" class="empty-state">Aucune vente enregistrée.</td></tr>';
      return;
    }

    table.innerHTML = filtered
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((sale) => {
        const product = products.find((prod) => prod.id === sale.productId);
        const seller = sellers.find((sel) => sel.id === sale.sellerId);
        const shop = shops.find((s) => s.id === sale.shopId);
        const unit = product ? Number(product.price) : 0;
        const total = unit * sale.quantity - (sale.discount || 0);
        return `
          <tr>
            <td>${sale.number}</td>
            <td>${new Date(sale.date).toLocaleDateString('fr-FR')}</td>
            <td>${product ? product.name : '—'}</td>
            <td>${sale.quantity}</td>
            <td>${context.formatCurrency(total, settings.currency)}</td>
            <td>${seller ? seller.name : '—'}</td>
            <td>${shop ? shop.name : '—'}</td>
            <td><button class="small print" data-sale="${sale.id}">Imprimer</button></td>
          </tr>
        `;
      })
      .join('');

    table.querySelectorAll('button[data-sale]').forEach((button) => {
      button.addEventListener('click', () => {
        const sale = sales.find((s) => s.id === button.dataset.sale);
        if (!sale) return;
        printReceipt(sale, context.getData(), context.formatCurrency.bind(context));
      });
    });
  }

  return { render };
}

function printReceipt(sale, data, formatCurrency) {
  const product = data.products.find((prod) => prod.id === sale.productId);
  const seller = data.sellers.find((sel) => sel.id === sale.sellerId);
  const shop = data.shops.find((s) => s.id === sale.shopId);
  const template = document.getElementById('receiptTemplate');
  if (!template) return;

  const receipt = template.content.cloneNode(true);
  const unit = product ? Number(product.price) : 0;
  const total = unit * sale.quantity - (sale.discount || 0);

  receipt.getElementById('receiptShop').textContent = shop ? shop.name : '';
  receipt.getElementById('receiptDate').textContent = new Date(sale.date).toLocaleString('fr-FR');
  receipt.getElementById('receiptNumber').textContent = sale.number;
  receipt.getElementById('receiptProduct').textContent = product ? product.name : '';
  receipt.getElementById('receiptQuantity').textContent = sale.quantity;
  receipt.getElementById('receiptUnit').textContent = formatCurrency(unit, data.settings.currency);
  receipt.getElementById('receiptTotal').textContent = formatCurrency(total, data.settings.currency);
  receipt.getElementById('receiptSeller').textContent = seller ? seller.name : '';
  receipt.getElementById('receiptNotes').textContent = sale.notes || '—';

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Reçu ${sale.number}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 24px; }
          h1 { margin-bottom: 8px; }
          p { margin: 4px 0; }
          footer { margin-top: 24px; text-align: center; font-size: 0.85rem; color: #555; }
        </style>
      </head>
      <body>
        ${receipt.firstElementChild.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
