import { calculateSaleAmounts, todayISO, isSameDay, toISODate } from './utils.js';

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
  const reportDateInput = document.getElementById('dailyReportDate');
  const reportButton = document.getElementById('printDailyReport');

  let editingSaleId = null;

  if (reportDateInput && !reportDateInput.value) {
    reportDateInput.value = todayISO();
  }

  if (reportButton) {
    reportButton.addEventListener('click', () => {
      const rawDate = reportDateInput?.value;
      const selectedDate = toISODate(rawDate) || todayISO();
      const data = context.getData();
      printDailyReport(selectedDate, data, context.formatCurrency.bind(context));
    });
  }

  if (reportDateInput) {
    reportDateInput.addEventListener('change', () => {
      render();
    });
  }

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
    const rawSelectedDate = reportDateInput?.value;
    const selectedDate = toISODate(rawSelectedDate);
    populateSelects();
    updateSummary();
    const query = searchInput.value.toLowerCase();

    const filtered = sales.filter((sale) => {
      const product = products.find((prod) => prod.id === sale.productId);
      const seller = sellers.find((sel) => sel.id === sale.sellerId);
      const haystack = `${sale.number} ${sale.date} ${product?.name || ''} ${seller?.name || ''}`.toLowerCase();
      const matchesQuery = haystack.includes(query);
      const matchesDate = !selectedDate || isSameDay(sale.date, selectedDate);
      return matchesQuery && matchesDate;
    });

    if (!filtered.length) {
      const emptyMessage = selectedDate
        ? 'Aucune vente pour la date sélectionnée.'
        : 'Aucune vente enregistrée.';
      table.innerHTML = `<tr><td colspan="10" class="empty-state">${emptyMessage}</td></tr>`;
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
          :root { color-scheme: light; }
          body {
            margin: 0;
            padding: 32px;
            font-family: 'Inter', sans-serif;
            background: #f5f7fb;
            color: #1f2933;
          }
          .invoice {
            font-family: inherit;
            background: #ffffff;
            border-radius: 18px;
            padding: 2.5rem;
            max-width: 720px;
            margin: 0 auto;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
            border: 1px solid rgba(15, 23, 42, 0.06);
          }
          .invoice__header {
            display: flex;
            justify-content: space-between;
            gap: 1.5rem;
            align-items: center;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            padding-bottom: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .invoice__brand {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .invoice__logo {
            width: 56px;
            height: 56px;
            object-fit: contain;
            border-radius: 14px;
            background: rgba(255, 165, 0, 0.12);
            padding: 0.35rem;
          }
          .invoice__brand h1 {
            margin: 0;
            font-size: 1.6rem;
          }
          .invoice__brand p {
            margin: 0.2rem 0 0;
            color: #6b7280;
          }
          .invoice__meta {
            text-align: right;
            font-size: 0.95rem;
            color: #6b7280;
          }
          .invoice__meta p {
            margin: 0.2rem 0;
          }
          .invoice__details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .invoice__details h2 {
            margin: 0 0 0.35rem;
            font-size: 1rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .invoice__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }
          .invoice__table th,
          .invoice__table td {
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          }
          .invoice__table th {
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.75rem;
            color: #6b7280;
          }
          .invoice__table td:last-child {
            font-weight: 700;
          }
          .invoice__summary {
            display: flex;
            justify-content: space-between;
            gap: 2rem;
            align-items: flex-start;
            flex-wrap: wrap;
          }
          .invoice__notes {
            flex: 1 1 320px;
          }
          .invoice__notes h3 {
            margin: 0 0 0.5rem;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
          }
          .invoice__totals {
            flex: 0 1 240px;
            background: rgba(255, 165, 0, 0.06);
            border-radius: 14px;
            padding: 1rem 1.25rem;
          }
          .invoice__totals dl {
            margin: 0;
            display: grid;
            gap: 0.75rem;
          }
          .invoice__totals dt {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
          }
          .invoice__totals dd {
            margin: 0.1rem 0 0;
            font-size: 1.1rem;
            font-weight: 700;
          }
          .invoice__footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.85rem;
            color: #6b7280;
            border-top: 1px dashed rgba(15, 23, 42, 0.2);
            padding-top: 1rem;
          }
          .invoice__footer-meta {
            margin: 0.5rem 0 0;
            font-size: 0.8rem;
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .invoice {
              box-shadow: none;
              border: none;
              border-radius: 0;
            }
          }
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

function printDailyReport(date, data, formatCurrency) {
  const normalizedDate = toISODate(date) || todayISO();
  const dateLabel = new Date(normalizedDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const detailed = data.sales
    .filter((sale) => isSameDay(sale.date, normalizedDate))
    .map((sale) => {
      const product = data.products.find((prod) => prod.id === sale.productId);
      const seller = data.sellers.find((sel) => sel.id === sale.sellerId);
      const shop = data.shops.find((s) => s.id === sale.shopId);
      const amounts = calculateSaleAmounts(sale, product);
      return {
        sale,
        productName: product ? product.name : '—',
        sellerName: seller ? seller.name : '—',
        shopName: shop ? shop.name : '—',
        amounts
      };
    });

  const totalQuantity = detailed.reduce((sum, item) => sum + Number(item.sale.quantity || 0), 0);
  const totalRevenue = detailed.reduce((sum, item) => sum + item.amounts.total, 0);
  const totalAdvance = detailed.reduce((sum, item) => sum + item.amounts.advance, 0);
  const totalBalance = detailed.reduce((sum, item) => sum + item.amounts.balance, 0);
  const totalDiscount = detailed.reduce((sum, item) => sum + item.amounts.discount, 0);

  const breakdownByShop = detailed.reduce((acc, item) => {
    const key = item.shopName;
    if (!acc[key]) {
      acc[key] = { name: key, total: 0, count: 0 };
    }
    acc[key].total += item.amounts.total;
    acc[key].count += 1;
    return acc;
  }, {});

  const breakdownList = Object.values(breakdownByShop)
    .sort((a, b) => b.total - a.total)
    .map(
      (entry) => `
        <li>
          <span>${entry.name}</span>
          <strong>${formatCurrency(entry.total, data.settings.currency)}</strong>
          <small>${entry.count} vente${entry.count > 1 ? 's' : ''}</small>
        </li>
      `
    )
    .join('');

  const rows = detailed.length
    ? detailed
        .sort((a, b) => a.sale.number.localeCompare(b.sale.number))
        .map(
          (item) => `
            <tr>
              <td>${item.sale.number}</td>
              <td>${item.productName}</td>
              <td>${item.sale.quantity}</td>
              <td>${formatCurrency(item.amounts.unit, data.settings.currency)}</td>
              <td>${formatCurrency(item.amounts.discount, data.settings.currency)}</td>
              <td>${formatCurrency(item.amounts.total, data.settings.currency)}</td>
              <td>${formatCurrency(item.amounts.advance, data.settings.currency)}</td>
              <td>${formatCurrency(item.amounts.balance, data.settings.currency)}</td>
              <td>${item.sellerName}</td>
              <td>${item.shopName}</td>
            </tr>
          `
        )
        .join('')
    : `<tr><td colspan="10" class="empty-state">Aucune vente enregistrée pour cette date.</td></tr>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Clôture des ventes – ${dateLabel}</title>
        <style>
          :root { color-scheme: light; }
          body {
            margin: 0;
            padding: 32px;
            font-family: 'Inter', sans-serif;
            background: #f5f7fb;
            color: #1f2933;
          }
          .report {
            background: #ffffff;
            border-radius: 20px;
            padding: 2.5rem;
            max-width: 960px;
            margin: 0 auto;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
            border: 1px solid rgba(15, 23, 42, 0.05);
          }
          .report__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1.5rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            padding-bottom: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .report__header h1 {
            margin: 0;
            font-size: 1.8rem;
          }
          .report__header p {
            margin: 0;
            color: #6b7280;
          }
          .report__metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .report__metric {
            background: rgba(255, 165, 0, 0.12);
            border-radius: 16px;
            padding: 1rem 1.25rem;
          }
          .report__metric span {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
          }
          .report__metric strong {
            display: block;
            margin-top: 0.35rem;
            font-size: 1.3rem;
          }
          .report__metric small {
            display: block;
            margin-top: 0.35rem;
            font-size: 0.85rem;
            color: #6b7280;
          }
          .report__breakdown {
            margin-bottom: 2rem;
          }
          .report__breakdown h2 {
            margin: 0 0 0.75rem;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
          }
          .report__breakdown ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 0.75rem;
          }
          .report__breakdown li {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 1rem;
            background: rgba(15, 23, 42, 0.03);
            border-radius: 14px;
            padding: 0.85rem 1rem;
          }
          .report__breakdown strong {
            font-size: 1.05rem;
          }
          .report__breakdown small {
            color: #6b7280;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th, td {
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.1);
            text-align: left;
          }
          th {
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.75rem;
            color: #6b7280;
          }
          tfoot td {
            font-weight: 700;
          }
          .empty {
            text-align: center;
            padding: 2rem 1rem;
            color: #6b7280;
            font-style: italic;
          }
          .empty-state {
            text-align: center;
            font-style: italic;
            color: #6b7280;
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .report {
              box-shadow: none;
              border: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="report__header">
            <div>
              <h1>Clôture de la journée</h1>
              <p>${dateLabel}</p>
            </div>
            <div>
              <p><strong>Boutiques :</strong> Jocelyne K &amp; Jocelyne K 2</p>
              <p><strong>Rapport généré :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
          <div class="report__metrics">
            <div class="report__metric">
              <span>Chiffre d'affaires</span>
              <strong>${formatCurrency(totalRevenue, data.settings.currency)}</strong>
              <small>${detailed.length} vente${detailed.length > 1 ? 's' : ''}</small>
            </div>
            <div class="report__metric">
              <span>Quantité vendue</span>
              <strong>${totalQuantity}</strong>
              <small>Articles</small>
            </div>
            <div class="report__metric">
              <span>Avances encaissées</span>
              <strong>${formatCurrency(totalAdvance, data.settings.currency)}</strong>
            </div>
            <div class="report__metric">
              <span>Restes à percevoir</span>
              <strong>${formatCurrency(totalBalance, data.settings.currency)}</strong>
            </div>
          </div>
          <div class="report__breakdown">
            <h2>Détail par boutique</h2>
            <ul>
              ${breakdownList || '<li><span>Aucune vente enregistrée</span><small>—</small></li>'}
            </ul>
          </div>
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Produit</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Remise</th>
                <th>Total</th>
                <th>Avance</th>
                <th>Reste</th>
                <th>Vendeuse</th>
                <th>Boutique</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="10" class="empty">Aucune vente enregistrée ce jour.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Totaux</td>
                <td>${totalQuantity}</td>
                <td>—</td>
                <td>${formatCurrency(totalDiscount, data.settings.currency)}</td>
                <td>${formatCurrency(totalRevenue, data.settings.currency)}</td>
                <td>${formatCurrency(totalAdvance, data.settings.currency)}</td>
                <td>${formatCurrency(totalBalance, data.settings.currency)}</td>
                <td colspan="2"> </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
