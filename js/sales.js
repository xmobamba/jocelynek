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
  const customerInput = document.getElementById('saleCustomer');
  const notesInput = document.getElementById('saleNotes');
  const unitPriceDisplay = document.getElementById('saleUnitPrice');
  const totalDisplay = document.getElementById('saleTotal');
  const advanceDisplay = document.getElementById('saleAdvanceDisplay');
  const balanceDisplay = document.getElementById('saleBalance');
  const paidInFullCheckbox = document.getElementById('salePaidInFull');
  const statusPill = document.getElementById('saleStatusPill');
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
      customerInput.value = sale.customer || sale.customerName || sale.client || '';
      notesInput.value = sale.notes || '';
      const presetUnit =
        sale.unitPrice !== undefined && sale.unitPrice !== null && sale.unitPrice !== ''
          ? Number(sale.unitPrice) || 0
          : productData
          ? Number(productData.price) || 0
          : getProductPrice(sale.productId);
      unitPriceInput.value = presetUnit;
      advanceInput.value = Number(sale.advance || 0);
      if (paidInFullCheckbox) {
        const computedTotal = Math.max(presetUnit * Number(quantityInput.value || 0) - Number(discountInput.value || 0), 0);
        const isSettled = Number(sale.advance || 0) >= computedTotal - 0.005;
        paidInFullCheckbox.checked = isSettled;
      }
    } else {
      editingSaleId = null;
      submitBtn.textContent = 'Enregistrer & imprimer';
      form.reset();
      const data = context.getData();
      const { settings } = data;
      const firstProduct = data.products[0];
      const defaultShop =
        settings.defaultShopId && data.shops.find((shop) => shop.id === settings.defaultShopId);
      const defaultSeller =
        settings.defaultSellerId && data.sellers.find((seller) => seller.id === settings.defaultSellerId);
      const firstShop = defaultShop || data.shops[0];
      const firstSeller = defaultSeller || data.sellers[0];
      quantityInput.value = 1;
      discountInput.value = 0;
      advanceInput.value = 0;
      dateInput.value = todayISO();
      customerInput.value = '';
      notesInput.value = '';
      productSelect.value = firstProduct ? firstProduct.id : '';
      unitPriceInput.value = firstProduct ? Number(firstProduct.price) || 0 : 0;
      shopSelect.value = firstShop ? firstShop.id : '';
      sellerSelect.value = firstSeller ? firstSeller.id : '';
      if (paidInFullCheckbox) {
        paidInFullCheckbox.checked = true;
      }
    }

    updateSummary();
    productSelect.focus();
  }

  function populateSelects() {
    const { products, shops, sellers, settings } = context.getData();
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
    if (!shopSelect.value && settings.defaultShopId) {
      const preferredShop = shops.find((shop) => shop.id === settings.defaultShopId);
      if (preferredShop) {
        shopSelect.value = preferredShop.id;
      }
    }
    if (!shopSelect.value && shops.length) {
      shopSelect.value = shops[0].id;
    }
    if (currentSeller) sellerSelect.value = currentSeller;
    if (!sellerSelect.value && settings.defaultSellerId) {
      const preferredSeller = sellers.find((seller) => seller.id === settings.defaultSellerId);
      if (preferredSeller) {
        sellerSelect.value = preferredSeller.id;
      }
    }
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
    let advance;
    const paidInFull = paidInFullCheckbox?.checked;
    if (paidInFull) {
      advance = total;
      if (paidInFullCheckbox) {
        advanceInput.value = total;
      }
    } else {
      let rawAdvance = Number(advanceInput.value);
      if (advanceInput.value === '' || Number.isNaN(rawAdvance) || rawAdvance < 0) {
        rawAdvance = 0;
      }
      advance = Math.min(rawAdvance, total);
      if (rawAdvance !== advance) {
        advanceInput.value = advance;
      }
    }

    if (paidInFullCheckbox) {
      advanceInput.readOnly = Boolean(paidInFull);
    }

    unitPriceDisplay.textContent = context.formatCurrency(unitPrice, settings.currency);
    totalDisplay.textContent = context.formatCurrency(total, settings.currency);
    advanceDisplay.textContent = context.formatCurrency(advance, settings.currency);
    const balance = Math.max(total - advance, 0);
    balanceDisplay.textContent = context.formatCurrency(balance, settings.currency);
    if (statusPill) {
      const settled = balance <= 0.005;
      statusPill.textContent = settled ? 'Facture soldée' : 'Solde à encaisser';
      statusPill.classList.toggle('status-pill--ok', settled);
      statusPill.classList.toggle('status-pill--alert', !settled);
    }
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

  if (paidInFullCheckbox) {
    paidInFullCheckbox.addEventListener('change', () => {
      if (paidInFullCheckbox.checked) {
        const { products } = context.getData();
        const product = products.find((prod) => prod.id === productSelect.value);
        const rawUnitPrice = unitPriceInput.value;
        let unitPrice = Number(rawUnitPrice);
        if (rawUnitPrice === '' || Number.isNaN(unitPrice)) {
          unitPrice = product ? Number(product.price) || 0 : 0;
        }
        const quantity = Number(quantityInput.value) || 0;
        const discount = Number(discountInput.value) || 0;
        const total = Math.max(unitPrice * quantity - discount, 0);
        advanceInput.value = total;
      }
      updateSummary();
      if (!paidInFullCheckbox.checked) {
        advanceInput.focus();
      }
    });
  }

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
    const customer = (formData.get('customer') || '').trim();
    const date = formData.get('date') || todayISO();
    const rawAdvance = formData.get('advance');
    const paidInFull = paidInFullCheckbox?.checked;
    const total = Math.max(unitPrice * quantity - discount, 0);
    let advance = Number(rawAdvance);
    if (paidInFull) {
      advance = total;
    } else {
      if (rawAdvance === '' || Number.isNaN(advance) || advance < 0) {
        advance = 0;
      }
      if (advance > total) {
        advance = total;
      }
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
        sale.customer = customer;
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
        customer,
        notes
      });
      affectedSaleId = id;
    });

    const data = context.getData();
    const sale = data.sales.find((s) => s.id === affectedSaleId);
    const shouldPrint = data.settings.autoPrintReceipts !== false;
    if (sale && shouldPrint) {
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
      const haystack = `${sale.number} ${sale.date} ${product?.name || ''} ${seller?.name || ''} ${sale.customer || ''}`.toLowerCase();
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
            <td>${
              amounts.balance <= 0.005
                ? '<span class="status-pill status-pill--ok">Soldée</span>'
                : context.formatCurrency(amounts.balance, settings.currency)
            }</td>
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

  const settings = data.settings || {};
  const shopSummary = (data.shops || []).map((s) => s.name).join(' • ');
  const companyName = (settings.companyName || 'Jocelyne K').trim() || 'Jocelyne K';
  const tagline = (settings.companyTagline || '').trim() || shopSummary || 'Gestionnaire de ventes & stocks';
  const receiptMessage = settings.receiptMessage || 'Merci pour votre confiance. Veuillez conserver cette facture.';
  const contactParts = [];
  if (settings.companyPhone) contactParts.push(settings.companyPhone);
  if (settings.companyEmail) contactParts.push(settings.companyEmail);
  const contactLine = contactParts.length ? `Contact : ${contactParts.join(' · ')}` : '';
  const addressLine = settings.companyAddress ? settings.companyAddress : '';
  const footerMeta = [contactLine, addressLine].filter(Boolean).join(' · ') ||
    "Contact : +225 00 00 00 00 · Abidjan, Côte d'Ivoire";

  const receipt = template.content.cloneNode(true);
  const amounts = calculateSaleAmounts(sale, product);
  const settled = amounts.balance <= 0.005;
  const balanceLabelText = settled ? 'Facture soldée' : 'Reste à payer';
  const balanceHintText = settled ? 'Aucun montant dû' : 'Solde client';

  const brandNameEl = receipt.getElementById('receiptBrandName');
  if (brandNameEl) brandNameEl.textContent = companyName;
  const companyNameEl = receipt.getElementById('receiptCompanyName');
  if (companyNameEl) companyNameEl.textContent = companyName;
  const brandTaglineEl = receipt.getElementById('receiptBrandTagline');
  if (brandTaglineEl) {
    brandTaglineEl.textContent = tagline;
    brandTaglineEl.style.display = tagline ? 'block' : 'none';
  }
  const vendorEl = receipt.getElementById('receiptVendor');
  if (vendorEl) {
    const vendorLines = [];
    if (settings.companyAddress) vendorLines.push(settings.companyAddress);
    if (contactParts.length) vendorLines.push(contactParts.join(' · '));
    if (!vendorLines.length && shopSummary) vendorLines.push(shopSummary);
    vendorEl.innerHTML = vendorLines.join('<br />');
    vendorEl.style.display = vendorLines.length ? 'block' : 'none';
  }
  const currencyLabel = settings.currency || 'FCFA';
  const paymentTerm =
    sale.paymentTerm ||
    settings.paymentTerms ||
    settings.paymentTerm ||
    settings.defaultPaymentTerm ||
    'Comptant';
  const currencyEl = receipt.getElementById('receiptCurrency');
  if (currencyEl) currencyEl.textContent = currencyLabel;
  const paymentTermEl = receipt.getElementById('receiptPaymentTerm');
  if (paymentTermEl) paymentTermEl.textContent = paymentTerm;
  const customerEl = receipt.getElementById('receiptCustomer');
  if (customerEl) {
    const customerName = sale.customer || sale.customerName || sale.client || '';
    customerEl.textContent = customerName || 'Client non renseigné';
  }
  const shopName = shop ? shop.name : '—';
  const sellerName = seller ? seller.name : '—';
  const shopEl = receipt.getElementById('receiptShop');
  if (shopEl) shopEl.textContent = shopName;
  const sellerEl = receipt.getElementById('receiptSeller');
  if (sellerEl) sellerEl.textContent = sellerName;
  const dateEl = receipt.getElementById('receiptDate');
  if (dateEl) dateEl.textContent = new Date(sale.date).toLocaleString('fr-FR');
  const numberEl = receipt.getElementById('receiptNumber');
  if (numberEl) numberEl.textContent = sale.number;
  const productEl = receipt.getElementById('receiptProduct');
  if (productEl) productEl.textContent = product ? product.name : '—';
  const quantityEl = receipt.getElementById('receiptQuantity');
  if (quantityEl) quantityEl.textContent = sale.quantity;
  const unitEl = receipt.getElementById('receiptUnit');
  if (unitEl) unitEl.textContent = formatCurrency(amounts.unit, settings.currency);
  const discountEl = receipt.getElementById('receiptDiscount');
  if (discountEl) discountEl.textContent = formatCurrency(amounts.discount, settings.currency);
  const totalEl = receipt.getElementById('receiptTotal');
  if (totalEl) totalEl.textContent = formatCurrency(amounts.total, settings.currency);
  const summaryTotalEl = receipt.getElementById('receiptSummaryTotal');
  if (summaryTotalEl) summaryTotalEl.textContent = formatCurrency(amounts.total, settings.currency);
  const totalDueEl = receipt.getElementById('receiptTotalDue');
  if (totalDueEl) totalDueEl.textContent = formatCurrency(amounts.total, settings.currency);
  const advanceEl = receipt.getElementById('receiptAdvance');
  if (advanceEl) advanceEl.textContent = formatCurrency(amounts.advance, settings.currency);
  const summaryAdvanceEl = receipt.getElementById('receiptSummaryAdvance');
  if (summaryAdvanceEl) summaryAdvanceEl.textContent = formatCurrency(amounts.advance, settings.currency);
  const balanceEl = receipt.getElementById('receiptBalance');
  if (balanceEl) balanceEl.textContent = formatCurrency(amounts.balance, settings.currency);
  const summaryBalanceEl = receipt.getElementById('receiptSummaryBalance');
  if (summaryBalanceEl) summaryBalanceEl.textContent = formatCurrency(amounts.balance, settings.currency);
  const balanceLabelEl = receipt.getElementById('receiptBalanceLabel');
  if (balanceLabelEl) balanceLabelEl.textContent = balanceLabelText;
  const balanceHintEl = receipt.getElementById('receiptBalanceHint');
  if (balanceHintEl) balanceHintEl.textContent = balanceHintText;
  const balanceTitleEl = receipt.getElementById('receiptBalanceTitle');
  if (balanceTitleEl) balanceTitleEl.textContent = balanceLabelText;
  const summaryQuantityEl = receipt.getElementById('receiptSummaryQuantity');
  if (summaryQuantityEl) summaryQuantityEl.textContent = String(sale.quantity || 0);
  const summaryUnitEl = receipt.getElementById('receiptSummaryUnit');
  if (summaryUnitEl) summaryUnitEl.textContent = (sale.quantity || 0) > 1 ? 'Articles' : 'Article';
  const notesEl = receipt.getElementById('receiptNotes');
  if (notesEl) notesEl.textContent = sale.notes || '—';
  const footerMessageEl = receipt.getElementById('receiptFooterMessage');
  if (footerMessageEl) footerMessageEl.textContent = receiptMessage;
  const footerMetaEl = receipt.getElementById('receiptFooterMeta');
  if (footerMetaEl) footerMetaEl.textContent = footerMeta;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>${companyName} – Reçu ${sale.number}</title>
        <style>
          :root { color-scheme: light; }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 32px;
            font-family: 'Inter', sans-serif;
            background: #f1f5f9;
            color: #0f172a;
          }
          .invoice {
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 28px 60px rgba(15, 23, 42, 0.12);
            overflow: hidden;
          }
          .invoice__head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2rem;
            padding: 2.5rem 3rem 2.25rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            background: #ffffff;
          }
          .invoice__identity {
            flex: 1 1 auto;
          }
          .invoice__label {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 0.85rem;
            border-radius: 999px;
            background: rgba(0, 168, 107, 0.12);
            color: #047857;
            font-weight: 600;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 1rem;
          }
          .invoice__identity h1 {
            margin: 0;
            font-size: 2rem;
            color: #0f172a;
          }
          .invoice__tagline {
            margin: 0.4rem 0 0;
            color: #64748b;
            font-size: 0.95rem;
          }
          .invoice__company {
            margin-top: 1.75rem;
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .invoice__logo-wrap {
            width: 72px;
            height: 72px;
            border-radius: 18px;
            border: 1px solid rgba(0, 168, 107, 0.25);
            background: rgba(0, 168, 107, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.65rem;
          }
          .invoice__logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .invoice__company-info {
            font-size: 0.9rem;
            color: #475569;
          }
          .invoice__company-info strong {
            display: block;
            font-size: 1.05rem;
            color: #0f172a;
            margin-bottom: 0.35rem;
          }
          .invoice__company-info address {
            margin: 0;
            font-style: normal;
            line-height: 1.5;
          }
          .invoice__meta {
            min-width: 220px;
          }
          .invoice__meta dl {
            margin: 0;
            display: grid;
            gap: 1.1rem;
            text-align: right;
          }
          .invoice__meta dt {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin-bottom: 0.3rem;
          }
          .invoice__meta dd {
            margin: 0;
            font-weight: 600;
            font-size: 1.05rem;
            color: #0f172a;
          }
          .invoice__cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 1rem;
            padding: 1.75rem 3rem 2rem;
            background: #f8fafc;
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }
          .invoice__card {
            background: #fff8e6;
            border: 1px solid rgba(255, 165, 0, 0.25);
            border-radius: 18px;
            padding: 1rem 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .invoice__card span {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #a16207;
          }
          .invoice__card strong {
            font-size: 1.35rem;
            color: #0f172a;
          }
          .invoice__card small {
            font-size: 0.82rem;
            color: #64748b;
          }
          .invoice__parties {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.75rem;
            padding: 2rem 3rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          }
          .invoice__party h2 {
            margin: 0 0 0.6rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
          }
          .invoice__party p {
            margin: 0;
            color: #0f172a;
            font-size: 0.95rem;
            line-height: 1.6;
          }
          .invoice__party small {
            color: #475569;
            font-size: 0.85rem;
          }
          .invoice__party--terms .invoice__list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 0.75rem;
          }
          .invoice__list li {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 1rem;
            color: #0f172a;
            font-size: 0.95rem;
          }
          .invoice__list span {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
          }
          .invoice__table-wrapper {
            padding: 0 3rem 2.25rem;
          }
          .invoice__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
          }
          .invoice__table thead th {
            padding: 0.8rem 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.78rem;
            color: #0f172a;
            background: rgba(0, 168, 107, 0.08);
            text-align: left;
          }
          .invoice__table tbody td {
            padding: 0.85rem;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            color: #0f172a;
          }
          .invoice__table tbody tr:nth-child(even) td {
            background: rgba(15, 23, 42, 0.02);
          }
          .invoice__table td:last-child {
            font-weight: 600;
          }
          .invoice__extra {
            padding: 0 3rem 2.75rem;
            display: flex;
            flex-wrap: wrap;
            gap: 2.25rem;
          }
          .invoice__notes {
            flex: 1 1 320px;
          }
          .invoice__notes h3 {
            margin: 0 0 0.8rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
          }
          .invoice__notes p {
            margin: 0;
            color: #0f172a;
            line-height: 1.6;
            font-size: 0.95rem;
          }
          .invoice__totals {
            flex: 0 0 260px;
            border: 1px solid rgba(0, 168, 107, 0.25);
            border-radius: 18px;
            background: rgba(0, 168, 107, 0.08);
            padding: 1.5rem 1.75rem;
          }
          .invoice__totals dl {
            margin: 0;
            display: grid;
            gap: 1.15rem;
          }
          .invoice__totals dt {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #0f766e;
          }
          .invoice__totals dd {
            margin: 0;
            font-weight: 700;
            font-size: 1.15rem;
            color: #0f172a;
          }
          .invoice__footer {
            background: #f8fafc;
            border-top: 1px solid rgba(15, 23, 42, 0.08);
            padding: 1.75rem 3rem;
            text-align: center;
            font-size: 0.9rem;
            color: #475569;
          }
          .invoice__footer-meta {
            margin: 0.5rem 0 0;
            font-size: 0.8rem;
            color: #64748b;
          }
          @media (max-width: 720px) {
            body {
              padding: 16px;
            }
            .invoice__head,
            .invoice__cards,
            .invoice__parties,
            .invoice__table-wrapper,
            .invoice__extra,
            .invoice__footer {
              padding-left: 1.75rem;
              padding-right: 1.75rem;
            }
            .invoice__head {
              flex-direction: column;
              gap: 1.5rem;
            }
            .invoice__meta dl {
              text-align: left;
            }
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .invoice {
              border-radius: 0;
              box-shadow: none;
              border: none;
            }
            .invoice__label {
              background: none;
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
  const generatedAt = new Date();
  const dateObj = new Date(normalizedDate);
  const dateLabel = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const settings = data.settings || {};
  const shops = data.shops || [];
  const companyName = (settings.companyName || 'Jocelyne K').trim() || 'Jocelyne K';
  const shopLabel = shops.length ? shops.map((shop) => shop.name).join(' • ') : companyName;
  const tagline = (settings.companyTagline || '').trim() || shopLabel;
  const contactLines = [];
  if (settings.companyPhone) contactLines.push(settings.companyPhone);
  if (settings.companyEmail) contactLines.push(settings.companyEmail);
  const contactLine = contactLines.join(' · ');
  const addressLine = settings.companyAddress ? settings.companyAddress : '';
  const closingNote = (settings.closingNote || '').trim();
  const paymentReminder =
    (settings.paymentTerms || settings.paymentTerm || closingNote || 'Merci pour votre confiance.').trim();
  const recipientName = (settings.closingRecipient || 'Direction générale').trim() || 'Direction générale';
  const recipientDetails =
    (settings.closingRecipientNote || shopLabel || tagline || companyName).trim() || companyName;
  const reportNumber = `CLT-${normalizedDate.replace(/-/g, '')}`;
  const generatedLabel = generatedAt.toLocaleString('fr-FR');

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
  const grossRevenue = detailed.reduce(
    (sum, item) => sum + item.amounts.unit * Number(item.sale.quantity || 0),
    0
  );
  const totalRevenue = detailed.reduce((sum, item) => sum + item.amounts.total, 0);
  const totalAdvance = detailed.reduce((sum, item) => sum + item.amounts.advance, 0);
  const totalBalance = detailed.reduce((sum, item) => sum + item.amounts.balance, 0);
  const totalDiscount = detailed.reduce((sum, item) => sum + item.amounts.discount, 0);

  const hasOutstanding = totalBalance > 0.005;
  const outstandingLabel = hasOutstanding ? 'Solde dû' : 'Factures soldées';
  const outstandingCardClass = hasOutstanding ? '' : ' invoice__totals-card--settled';

  const breakdownByShop = detailed.reduce((acc, item) => {
    const key = item.shopName;
    if (!acc[key]) {
      acc[key] = { name: key, total: 0, count: 0, quantity: 0 };
    }
    acc[key].total += item.amounts.total;
    acc[key].count += 1;
    acc[key].quantity += Number(item.sale.quantity || 0);
    return acc;
  }, {});

  const breakdownRows = Object.values(breakdownByShop)
    .sort((a, b) => b.total - a.total)
    .map(
      (entry) => `
        <tr>
          <td>${entry.name}</td>
          <td>${entry.count}</td>
          <td>${entry.quantity}</td>
          <td>${formatCurrency(entry.total, settings.currency)}</td>
        </tr>
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
              <td class="number">${formatCurrency(item.amounts.unit, settings.currency)}</td>
              <td class="number">${formatCurrency(item.amounts.discount, settings.currency)}</td>
              <td class="number">${formatCurrency(item.amounts.total, settings.currency)}</td>
              <td class="number">${formatCurrency(item.amounts.advance, settings.currency)}</td>
              <td class="number">${formatCurrency(item.amounts.balance, settings.currency)}</td>
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
        <title>${companyName} – Clôture des ventes (${dateLabel})</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: 'Inter', sans-serif;
            background: #f5f7fa;
            color: #1f2937;
          }
          .invoice {
            background: #ffffff;
            max-width: 960px;
            margin: 0 auto;
            padding: 48px;
            border-radius: 18px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
            border: 1px solid #e2e8f0;
            border-top: 8px solid #00a86b;
          }
          .invoice__header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 32px;
          }
          .invoice__brand h1 {
            margin: 0;
            font-size: 1.9rem;
            color: #00a86b;
          }
          .invoice__brand .invoice__tagline {
            margin: 4px 0 0;
            color: #475569;
            font-size: 0.98rem;
          }
          .invoice__brand ul {
            margin: 12px 0 0;
            padding: 0;
            list-style: none;
            color: #475569;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .invoice__meta {
            text-align: right;
            min-width: 240px;
          }
          .invoice__title {
            font-size: 1.45rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #1f2937;
            font-weight: 600;
          }
          .invoice__meta table {
            margin-top: 12px;
            margin-left: auto;
            border-collapse: collapse;
            font-size: 0.92rem;
          }
          .invoice__meta td {
            padding: 6px 0 6px 16px;
            color: #334155;
            white-space: nowrap;
          }
          .invoice__meta td:first-child {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.78rem;
            color: #64748b;
            padding-left: 0;
          }
          .invoice__summary {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            margin-bottom: 32px;
          }
          .invoice__bill {
            flex: 1 1 260px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 18px 22px;
            background: #f8fafc;
          }
          .invoice__bill h2 {
            margin: 0 0 12px;
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #64748b;
          }
          .invoice__bill strong {
            display: block;
            font-size: 1.08rem;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .invoice__bill p {
            margin: 4px 0;
            color: #475569;
            font-size: 0.92rem;
          }
          .invoice__totals {
            flex: 1 1 320px;
            display: grid;
            gap: 14px;
          }
          .invoice__totals-card {
            border: 1px solid #bbf7d0;
            background: #f0fdf4;
            border-radius: 14px;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #065f46;
          }
          .invoice__totals-card span {
            font-size: 0.85rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #047857;
          }
          .invoice__totals-card strong {
            font-size: 1.1rem;
          }
          .invoice__totals-card--highlight {
            background: #dcfce7;
            border-color: #34d399;
            box-shadow: 0 10px 20px rgba(4, 120, 87, 0.12);
          }
          .invoice__totals-card--highlight span {
            color: #047857;
          }
          .invoice__totals-card--settled {
            background: #f8fafc;
            border-color: #cbd5f5;
            color: #1f2937;
          }
          .invoice__totals-card--settled span {
            color: #475569;
          }
          .invoice__table {
            margin-bottom: 32px;
          }
          .invoice__table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          .invoice__table thead th {
            background: #00a86b;
            color: #ffffff;
            padding: 12px 10px;
            text-align: left;
            font-size: 0.78rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .invoice__table tbody td {
            padding: 12px 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #1f2937;
          }
          .invoice__table tbody tr:nth-child(even) td {
            background: #f8fafc;
          }
          .invoice__table .number {
            text-align: right;
            font-variant-numeric: tabular-nums;
          }
          .invoice__table tfoot td {
            padding: 14px 10px;
            font-weight: 600;
            color: #1f2937;
            background: #ecfdf5;
            border-top: 2px solid #00a86b;
          }
          .invoice__table .empty-state {
            text-align: center;
            padding: 24px 16px;
            color: #64748b;
            font-style: italic;
          }
          .invoice__section-title {
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #64748b;
            margin: 0 0 12px;
          }
          .invoice__breakdown table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.88rem;
          }
          .invoice__breakdown thead th {
            background: #f0fdf4;
            color: #047857;
            padding: 10px;
            text-align: left;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .invoice__breakdown tbody td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .invoice__breakdown tbody tr:nth-child(even) td {
            background: #f8fafc;
          }
          .invoice__breakdown .empty-state {
            text-align: center;
            padding: 16px;
            color: #94a3b8;
          }
          .invoice__notes {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            margin-top: 32px;
          }
          .invoice__payment {
            flex: 1 1 360px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 18px 22px;
            background: #ffffff;
          }
          .invoice__payment-summary {
            display: grid;
            gap: 8px;
            margin-bottom: 16px;
          }
          .invoice__payment-summary div {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 0.92rem;
            color: #1f2937;
          }
          .invoice__payment-summary span {
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
          }
          .invoice__payment-summary strong {
            font-size: 1rem;
            color: #0f172a;
          }
          .invoice__payment-note {
            margin: 8px 0 0;
            color: #475569;
            line-height: 1.6;
            font-size: 0.95rem;
          }
          .invoice__signature {
            flex: 1 1 200px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            border: 1px dashed #cbd5f5;
            border-radius: 14px;
            padding: 18px 22px;
            background: #f8fafc;
          }
          .invoice__signature span {
            font-size: 0.85rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 24px;
          }
          .invoice__signature .line {
            border-bottom: 2px solid #94a3b8;
            height: 48px;
          }
          @media (max-width: 720px) {
            body { padding: 16px; }
            .invoice { padding: 32px 24px; }
            .invoice__header { flex-direction: column; text-align: left; }
            .invoice__meta { text-align: left; }
            .invoice__meta table { margin-left: 0; }
            .invoice__notes { flex-direction: column; }
            .invoice__signature { min-height: 140px; }
          }
          @media print {
            body { padding: 0; background: #ffffff; }
            .invoice { box-shadow: none; border-radius: 0; border: none; }
            .invoice__signature { border-color: #d1d5db; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="invoice__header">
            <div class="invoice__brand">
              <h1>${companyName}</h1>
              <p class="invoice__tagline">${tagline}</p>
              <ul>
                ${addressLine ? `<li>${addressLine}</li>` : ''}
                ${contactLine ? `<li>${contactLine}</li>` : ''}
              </ul>
            </div>
            <div class="invoice__meta">
              <div class="invoice__title">Clôture journalière</div>
              <table>
                <tr><td>N° rapport</td><td>${reportNumber}</td></tr>
                <tr><td>Date</td><td>${dateLabel}</td></tr>
                <tr><td>Généré le</td><td>${generatedLabel}</td></tr>
                ${shopLabel ? `<tr><td>Boutiques</td><td>${shopLabel}</td></tr>` : ''}
              </table>
            </div>
          </div>
          <div class="invoice__summary">
            <div class="invoice__bill">
              <h2>Destinataire</h2>
              <strong>${recipientName}</strong>
              <p>${recipientDetails}</p>
            </div>
            <div class="invoice__totals">
              <div class="invoice__totals-card invoice__totals-card--highlight">
                <span>Total du jour</span>
                <strong>${formatCurrency(totalRevenue, settings.currency)}</strong>
              </div>
              <div class="invoice__totals-card">
                <span>Avances encaissées</span>
                <strong>${formatCurrency(totalAdvance, settings.currency)}</strong>
              </div>
              <div class="invoice__totals-card${outstandingCardClass}">
                <span>${outstandingLabel}</span>
                <strong>${formatCurrency(totalBalance, settings.currency)}</strong>
              </div>
              <div class="invoice__totals-card">
                <span>Remises accordées</span>
                <strong>${formatCurrency(totalDiscount, settings.currency)}</strong>
              </div>
            </div>
          </div>
          <div class="invoice__table">
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
                ${rows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Totaux</td>
                  <td>${totalQuantity}</td>
                  <td class="number">—</td>
                  <td class="number">${formatCurrency(totalDiscount, settings.currency)}</td>
                  <td class="number">${formatCurrency(totalRevenue, settings.currency)}</td>
                  <td class="number">${formatCurrency(totalAdvance, settings.currency)}</td>
                  <td class="number">${formatCurrency(totalBalance, settings.currency)}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="invoice__breakdown">
            <div class="invoice__section-title">Récapitulatif par boutique</div>
            <table>
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Ventes</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${
                  breakdownRows ||
                  '<tr><td colspan="4" class="empty-state">Aucune vente enregistrée pour cette période.</td></tr>'
                }
              </tbody>
            </table>
          </div>
          <div class="invoice__notes">
            <div class="invoice__payment">
              <div class="invoice__section-title">Instructions & résumé</div>
              <div class="invoice__payment-summary">
                <div><span>Sous-total</span><strong>${formatCurrency(grossRevenue, settings.currency)}</strong></div>
                <div><span>Total du jour</span><strong>${formatCurrency(totalRevenue, settings.currency)}</strong></div>
                <div><span>Avances encaissées</span><strong>${formatCurrency(totalAdvance, settings.currency)}</strong></div>
                <div><span>${outstandingLabel}</span><strong>${formatCurrency(totalBalance, settings.currency)}</strong></div>
              </div>
              <p class="invoice__payment-note">${paymentReminder}</p>
            </div>
            <div class="invoice__signature">
              <span>Signature autorisée</span>
              <div class="line"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

