import { calculateSaleAmounts, todayISO } from './utils.js';

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
  const unitPriceInput = document.getElementById('saleUnitPriceInput');
  const discountInput = document.getElementById('saleDiscount');
  const advanceInput = document.getElementById('saleAdvance');
  const dateInput = document.getElementById('saleDate');
  const notesInput = document.getElementById('saleNotes');
  const unitPriceDisplay = document.getElementById('saleUnitPrice');
  const totalDisplay = document.getElementById('saleTotal');
  const advanceDisplay = document.getElementById('saleAdvanceDisplay');
  const balanceDisplay = document.getElementById('saleBalance');
  const searchInput = document.getElementById('salesSearch');
  const submitBtn = document.getElementById('saleSubmit');

  let editingSaleId = null;

  function toggleForm(show = true, sale = null) {
    formWrapper.hidden = !show;
    if (!show) {
      editingSaleId = null;
      submitBtn.textContent = 'Enregistrer & imprimer';
      form.reset();
      return;
    }

    populateSelects();

    if (sale) {
      editingSaleId = sale.id;
      submitBtn.textContent = 'Mettre à jour & imprimer';
      const snapshot = context.getData();
      const productData = snapshot.products.find((prod) => prod.id === sale.productId);
      const shopData = snapshot.shops.find((shop) => shop.id === sale.shopId);
      const sellerData = snapshot.sellers.find((seller) => seller.id === sale.sellerId);

      ensureOption(productSelect, sale.productId, productData ? productData.name : 'Produit archivé');
      ensureOption(shopSelect, sale.shopId, shopData ? shopData.name : 'Boutique archivée');
      ensureOption(sellerSelect, sale.sellerId, sellerData ? sellerData.name : 'Vendeuse archivée');

      productSelect.value = sale.productId || '';
      shopSelect.value = sale.shopId || '';
      sellerSelect.value = sale.sellerId || '';
      quantityInput.value = Number(sale.quantity || 1);
      discountInput.value = Number(sale.discount || 0);
      dateInput.value = sale.date || todayISO();
      notesInput.value = sale.notes || '';
      const presetUnit =
        sale.unitPrice !== undefined && sale.unitPrice !== null && sale.unitPrice !== ''
          ? Number(sale.unitPrice) || 0
          : productData
          ? Number(productData.price) || 0
          : getProductPrice(sale.productId);
      unitPriceInput.value = presetUnit;
      advanceInput.value = Number(sale.advance || 0);
    } else {
      editingSaleId = null;
      submitBtn.textContent = 'Enregistrer & imprimer';
      form.reset();
      const data = context.getData();
      const firstProduct = data.products[0];
      const firstShop = data.shops[0];
      const firstSeller = data.sellers[0];
      quantityInput.value = 1;
      discountInput.value = 0;
      advanceInput.value = 0;
      dateInput.value = todayISO();
      notesInput.value = '';
      productSelect.value = firstProduct ? firstProduct.id : '';
      unitPriceInput.value = firstProduct ? Number(firstProduct.price) || 0 : 0;
      shopSelect.value = firstShop ? firstShop.id : '';
      sellerSelect.value = firstSeller ? firstSeller.id : '';
    }

    updateSummary();
    productSelect.focus();
  }

  function populateSelects() {
    const { products, shops, sellers } = context.getData();
    const currentProduct = productSelect.value;
    const currentShop = shopSelect.value;
    const currentSeller = sellerSelect.value;

    productSelect.innerHTML = products
      .map((product) => `<option value="${product.id}">${product.name}</option>`)
      .join('');
    shopSelect.innerHTML = shops.map((shop) => `<option value="${shop.id}">${shop.name}</option>`).join('');
    sellerSelect.innerHTML = sellers
      .map((seller) => `<option value="${seller.id}">${seller.name}</option>`)
      .join('');

    if (currentProduct) productSelect.value = currentProduct;
    if (!productSelect.value && products.length) {
      productSelect.value = products[0].id;
    }
    if (currentShop) shopSelect.value = currentShop;
    if (!shopSelect.value && shops.length) {
      shopSelect.value = shops[0].id;
    }
    if (currentSeller) sellerSelect.value = currentSeller;
    if (!sellerSelect.value && sellers.length) {
      sellerSelect.value = sellers[0].id;
    }
  }

  function getProductPrice(productId) {
    const { products } = context.getData();
    const product = products.find((prod) => prod.id === productId);
    return product ? Number(product.price) || 0 : 0;
  }

  function ensureOption(select, value, label) {
    if (!value) return;
    const exists = Array.from(select.options).some((option) => option.value === value);
    if (exists) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.dataset.missing = 'true';
    select.append(option);
  }

  function updateSummary() {
    const { products, settings } = context.getData();
    const product = products.find((prod) => prod.id === productSelect.value);
    const rawUnitPrice = unitPriceInput.value;
    let unitPrice = Number(rawUnitPrice);
    if (rawUnitPrice === '') {
      unitPrice = product ? Number(product.price) || 0 : 0;
    }
    if (Number.isNaN(unitPrice)) {
      unitPrice = 0;
    }
    const quantity = Number(quantityInput.value) || 0;
    const discount = Number(discountInput.value) || 0;
    const total = Math.max(unitPrice * quantity - discount, 0);
    let advance = Number(advanceInput.value);
    if (Number.isNaN(advance) || advance < 0) {
      advance = 0;
    }
    if (advance > total) {
      advance = total;
    }

    unitPriceDisplay.textContent = context.formatCurrency(unitPrice, settings.currency);
    totalDisplay.textContent = context.formatCurrency(total, settings.currency);
    advanceDisplay.textContent = context.formatCurrency(advance, settings.currency);
    balanceDisplay.textContent = context.formatCurrency(Math.max(total - advance, 0), settings.currency);
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  productSelect.addEventListener('change', () => {
    const { products } = context.getData();
    const product = products.find((prod) => prod.id === productSelect.value);
    if (product) {
      unitPriceInput.value = Number(product.price) || 0;
    }
    updateSummary();
  });

  ['change', 'input'].forEach((eventName) => {
    quantityInput.addEventListener(eventName, updateSummary);
    discountInput.addEventListener(eventName, updateSummary);
    unitPriceInput.addEventListener(eventName, updateSummary);
    advanceInput.addEventListener(eventName, updateSummary);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const productId = formData.get('productId');
    const shopId = formData.get('shopId');
    const sellerId = formData.get('sellerId');
    const quantity = Number(formData.get('quantity')) || 1;
    const discount = Number(formData.get('discount')) || 0;
    const rawUnitPrice = formData.get('unitPrice');
    let unitPrice = Number(rawUnitPrice);
    if (rawUnitPrice === '' || Number.isNaN(unitPrice)) {
      unitPrice = getProductPrice(productId);
    }
    const notes = (formData.get('notes') || '').trim();
    const date = formData.get('date') || todayISO();
    const rawAdvance = formData.get('advance');
    let advance = Number(rawAdvance);
    if (rawAdvance === '' || Number.isNaN(advance) || advance < 0) {
      advance = 0;
    }

    const total = Math.max(unitPrice * quantity - discount, 0);
    if (advance > total) {
      advance = total;
    }

    if (!productId || !sellerId || !shopId) return;

    let affectedSaleId = editingSaleId || null;
    const saleNumber = editingSaleId ? null : context.generateSaleNumber();

    context.updateData((draft) => {
      if (editingSaleId) {
        const sale = draft.sales.find((s) => s.id === editingSaleId);
        if (!sale) return;
        const newProduct = draft.products.find((prod) => prod.id === productId);
        if (!newProduct) return;
        const previousProduct = draft.products.find((prod) => prod.id === sale.productId);
        if (previousProduct) {
          previousProduct.stock = Number(previousProduct.stock || 0) + Number(sale.quantity || 0);
        }
        newProduct.stock = Math.max(0, Number(newProduct.stock || 0) - quantity);
        sale.productId = productId;
        sale.shopId = shopId;
        sale.sellerId = sellerId;
        sale.quantity = quantity;
        sale.discount = discount;
        sale.unitPrice = unitPrice;
        sale.advance = advance;
        sale.date = date;
        sale.notes = notes;
        affectedSaleId = sale.id;
        return;
      }

      const product = draft.products.find((prod) => prod.id === productId);
      if (!product) return;
      product.stock = Math.max(0, Number(product.stock || 0) - quantity);
      const id = crypto.randomUUID();
      draft.sales.push({
        id,
        number: saleNumber,
        productId,
        shopId,
        sellerId,
        quantity,
        discount,
        unitPrice,
        advance,
        date,
        notes
      });
      affectedSaleId = id;
    });

    const data = context.getData();
    const sale = data.sales.find((s) => s.id === affectedSaleId);
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
      table.innerHTML = '<tr><td colspan="10" class="empty-state">Aucune vente enregistrée.</td></tr>';
      return;
    }

    table.innerHTML = filtered
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((sale) => {
        const product = products.find((prod) => prod.id === sale.productId);
        const seller = sellers.find((sel) => sel.id === sale.sellerId);
        const shop = shops.find((s) => s.id === sale.shopId);
        const amounts = calculateSaleAmounts(sale, product);
        return `
          <tr>
            <td>${sale.number}</td>
            <td>${new Date(sale.date).toLocaleDateString('fr-FR')}</td>
            <td>${product ? product.name : '—'}</td>
            <td>${sale.quantity}</td>
            <td>${context.formatCurrency(amounts.total, settings.currency)}</td>
            <td>${context.formatCurrency(amounts.advance, settings.currency)}</td>
            <td>${context.formatCurrency(amounts.balance, settings.currency)}</td>
            <td>${seller ? seller.name : '—'}</td>
            <td>${shop ? shop.name : '—'}</td>
            <td>
              <button class="small edit" data-edit-sale="${sale.id}">Modifier</button>
              <button class="small print" data-sale="${sale.id}">Imprimer</button>
            </td>
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

    table.querySelectorAll('button[data-edit-sale]').forEach((button) => {
      button.addEventListener('click', () => {
        const sale = sales.find((s) => s.id === button.dataset.editSale);
        if (!sale) return;
        toggleForm(true, sale);
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
  const amounts = calculateSaleAmounts(sale, product);

  receipt.getElementById('receiptShop').textContent = shop ? shop.name : '';
  receipt.getElementById('receiptDate').textContent = new Date(sale.date).toLocaleString('fr-FR');
  receipt.getElementById('receiptNumber').textContent = sale.number;
  receipt.getElementById('receiptProduct').textContent = product ? product.name : '';
  receipt.getElementById('receiptQuantity').textContent = sale.quantity;
  receipt.getElementById('receiptUnit').textContent = formatCurrency(amounts.unit, data.settings.currency);
  receipt.getElementById('receiptDiscount').textContent = formatCurrency(amounts.discount, data.settings.currency);
  receipt.getElementById('receiptTotal').textContent = formatCurrency(amounts.total, data.settings.currency);
  receipt.getElementById('receiptAdvance').textContent = formatCurrency(amounts.advance, data.settings.currency);
  receipt.getElementById('receiptBalance').textContent = formatCurrency(amounts.balance, data.settings.currency);
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
