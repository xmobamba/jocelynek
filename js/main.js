import {
  loadData,
  saveData,
  resetData,
  formatCurrency,
  calculateSaleAmounts,
  generateIncrementalCode,
  todayISO,
  exportSalesToCsv,
  structuredClone,
  isSameDay
} from './utils.js';
import { initShops } from './shops.js';
import { initSellers } from './sellers.js';
import { initProducts } from './products.js';
import { initSales } from './sales.js';
import { initAdvances } from './advances.js';
import { initStats } from './stats.js';
import { initAi } from './ai.js';

const state = {
  data: loadData(),
  subscribers: new Set()
};

const context = {
  getData: () => state.data,
  updateData(updater) {
    const copy = structuredClone(state.data);
    const updated = updater(copy) || copy;
    state.data = updated;
    saveData(state.data);
    notify();
    return state.data;
  },
  formatCurrency,
  generateSaleNumber() {
    state.data.counters.sale = (state.data.counters.sale || 0) + 1;
    const number = generateIncrementalCode('VENT', state.data.counters.sale);
    state.data.lastGeneratedSaleNumber = number;
    saveData(state.data);
    return number;
  },
  register(callback) {
    state.subscribers.add(callback);
    return () => state.subscribers.delete(callback);
  }
};

const modules = [];
let aiModule = null;

function getInitials(value) {
  if (!value) return 'JK';
  const initials = value
    .split(/[^A-Za-zÀ-ÖØ-öø-ÿ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
  return initials.slice(0, 2) || 'JK';
}

function renderBranding() {
  const { settings, shops } = context.getData();
  const companyName = (settings.companyName || 'Jocelyne K').trim() || 'Jocelyne K';
  const shopSummary = shops.length ? shops.map((shop) => shop.name).join(' • ') : companyName;
  const tagline = (settings.companyTagline || '').trim() || shopSummary;
  const initials = getInitials(companyName);

  const brandName = document.getElementById('brandName');
  if (brandName) brandName.textContent = companyName;
  const brandTagline = document.getElementById('brandTagline');
  if (brandTagline) brandTagline.textContent = tagline;
  const brandInitials = document.getElementById('brandInitials');
  if (brandInitials) brandInitials.textContent = initials;

  const userInitials = document.getElementById('userInitials');
  if (userInitials) userInitials.textContent = initials;
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = companyName;

  const sidebarInitials = document.getElementById('sidebarInitials');
  if (sidebarInitials) sidebarInitials.textContent = initials;
  const sidebarName = document.getElementById('sidebarName');
  if (sidebarName) sidebarName.textContent = companyName;
  const sidebarTagline = document.getElementById('sidebarTagline');
  if (sidebarTagline) sidebarTagline.textContent = tagline;

  const dashboardSubtitle = document.getElementById('dashboardSubtitle');
  if (dashboardSubtitle) {
    dashboardSubtitle.textContent = shops.length
      ? `Vue d'ensemble : ${shopSummary}`
      : `Vue d'ensemble des boutiques ${companyName}.`;
  }

  document.title = `Gestionnaire de ventes – ${companyName}`;
}

function notify() {
  renderBranding();
  modules.forEach((module) => module.render());
  renderDashboard();
}

function activateView(target) {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  navLinks.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === target);
  });
  views.forEach((view) => {
    view.classList.toggle('active', view.id === target);
  });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      activateView(link.dataset.target);
    });
  });
}

function setupSearch() {
  const search = document.getElementById('globalSearch');
  search.addEventListener('input', () => {
    const query = search.value.toLowerCase();
    const activeSection = document.querySelector('.view.active');
    if (!activeSection) return;
    const rows = activeSection.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

function renderDashboard() {
  const data = context.getData();
  const cards = document.getElementById('dashboardCards');
  if (!cards) return;
  const today = todayISO();
  const salesToday = data.sales.filter((sale) => isSameDay(sale.date, today));
  const now = new Date();
  const currentMonthSales = data.sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  });
  const totalToday = salesToday.reduce((sum, sale) => {
    const product = data.products.find((prod) => prod.id === sale.productId);
    const amounts = calculateSaleAmounts(sale, product);
    return sum + amounts.total;
  }, 0);
  const totalMonth = currentMonthSales.reduce((sum, sale) => {
    const product = data.products.find((prod) => prod.id === sale.productId);
    const amounts = calculateSaleAmounts(sale, product);
    return sum + amounts.total;
  }, 0);
  const totalSales = data.sales.length;
  const inventory = data.products.reduce((acc, product) => acc + Number(product.stock || 0), 0);

  cards.innerHTML = `
    <article class="dashboard-card">
      <h3>Ventes du jour</h3>
      <strong>${context.formatCurrency(totalToday, data.settings.currency)}</strong>
      <span>${salesToday.length} ventes</span>
    </article>
    <article class="dashboard-card">
      <h3>Ventes du mois</h3>
      <strong>${context.formatCurrency(totalMonth, data.settings.currency)}</strong>
      <span>${totalSales} ventes au total</span>
    </article>
    <article class="dashboard-card">
      <h3>Produits en stock</h3>
      <strong>${inventory}</strong>
      <span>Produits actifs: ${data.products.length}</span>
    </article>
    <article class="dashboard-card">
      <h3>Avances enregistrées</h3>
      <strong>${context.formatCurrency(
        data.advances.reduce((sum, advance) => sum + Number(advance.amount || 0), 0),
        data.settings.currency
      )}</strong>
      <span>${data.advances.length} avances</span>
    </article>
  `;

  const dashboardDate = document.getElementById('dashboardDate');
  if (dashboardDate) {
    dashboardDate.textContent = new Date(today).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  renderDailySalesTable(salesToday, data);
  renderLowStock(data);
  renderInventorySummary(data, salesToday);
  renderCategorySales(currentMonthSales, data, now);
}

function renderDailySalesTable(salesToday, data) {
  const tbody = document.getElementById('dailySalesTable');
  if (!tbody) return;
  if (salesToday.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune vente aujourd\'hui.</td></tr>';
    return;
  }
  tbody.innerHTML = salesToday
    .map((sale) => {
      const product = data.products.find((prod) => prod.id === sale.productId);
      const amounts = calculateSaleAmounts(sale, product);
      return `
        <tr>
          <td>${sale.number}</td>
          <td>${product ? product.name : '—'}</td>
          <td>${sale.quantity}</td>
          <td>${context.formatCurrency(amounts.total, data.settings.currency)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderLowStock(data) {
  const list = document.getElementById('lowStockList');
  if (!list) return;
  const threshold = Number(data.settings.lowStockThreshold || 5);
  const label = list.closest('.panel')?.querySelector('.panel-header span');
  if (label) {
    label.textContent = `Seuil ≤ ${threshold}`;
  }
  const lowStock = data.products.filter((product) => Number(product.stock || 0) <= threshold);
  if (lowStock.length === 0) {
    list.innerHTML = '<li>Aucun stock critique \u2728</li>';
    return;
  }
  list.innerHTML = lowStock
    .map((product) => {
      const shop = data.shops.find((shop) => shop.id === product.shopId);
      return `
        <li>
          <span>${product.name} (${shop ? shop.name : '—'})</span>
          <span class="badge danger">${product.stock} en stock</span>
        </li>
      `;
    })
    .join('');
}

function renderInventorySummary(data, salesToday) {
  const tbody = document.getElementById('inventorySummaryTable');
  if (!tbody) return;

  if (!data.products.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Aucun produit enregistré.</td></tr>';
    return;
  }

  const summary = data.products.map((product) => {
    const soldToday = salesToday
      .filter((sale) => sale.productId === product.id)
      .reduce((total, sale) => total + Number(sale.quantity || 0), 0);
    return {
      product,
      soldToday
    };
  });

  summary.sort((a, b) => {
    if (b.soldToday !== a.soldToday) {
      return b.soldToday - a.soldToday;
    }
    return Number(b.product.stock || 0) - Number(a.product.stock || 0);
  });

  tbody.innerHTML = summary
    .map((item) => {
      const shop = data.shops.find((shopItem) => shopItem.id === item.product.shopId);
      const stockLabel = `${Number(item.product.stock || 0)} ${item.product.unit || ''}`.trim();
      return `
        <tr>
          <td>
            <div class="table-title">${item.product.name}</div>
            <small class="table-subtitle">${shop ? shop.name : '—'}</small>
          </td>
          <td>${stockLabel || '0'}</td>
          <td>${item.soldToday}</td>
        </tr>
      `;
    })
    .join('');
}

function renderCategorySales(monthSales, data, now) {
  const list = document.getElementById('categorySalesList');
  if (!list) return;
  const periodLabel = document.getElementById('categorySalesPeriod');
  if (periodLabel) {
    periodLabel.textContent = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  if (!monthSales.length) {
    list.innerHTML = '<li class="empty-state">Aucune vente enregistrée ce mois-ci.</li>';
    return;
  }

  const totals = monthSales.reduce((acc, sale) => {
    const product = data.products.find((prod) => prod.id === sale.productId);
    if (!product) return acc;
    const category = product.category?.trim() || 'Sans catégorie';
    if (!acc[category]) {
      acc[category] = { name: category, total: 0 };
    }
    const amounts = calculateSaleAmounts(sale, product);
    acc[category].total += amounts.total;
    return acc;
  }, {});

  const ranking = Object.values(totals).sort((a, b) => b.total - a.total);
  const grandTotal = ranking.reduce((sum, item) => sum + item.total, 0);

  if (!ranking.length || grandTotal === 0) {
    list.innerHTML = '<li class="empty-state">Aucune vente enregistrée ce mois-ci.</li>';
    return;
  }

  list.innerHTML = ranking
    .map((item) => {
      const percentage = grandTotal ? Math.round((item.total / grandTotal) * 100) : 0;
      return `
        <li>
          <div class="category-row">
            <span>${item.name}</span>
            <strong>${context.formatCurrency(item.total, data.settings.currency)}</strong>
          </div>
          <div class="category-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentage}">
            <span style="width: ${percentage}%"></span>
          </div>
          <small>${percentage}% des ventes du mois</small>
        </li>
      `;
    })
    .join('');
}

function setupExport() {
  const btn = document.getElementById('exportCsvBtn');
  btn.addEventListener('click', () => {
    const data = context.getData();
    exportSalesToCsv(data);
  });
}

function setupDashboardShortcuts() {
  const openButton = document.getElementById('openInsightsFromDashboard');
  if (openButton) {
    openButton.addEventListener('click', () => {
      activateView('insights');
      const insightsLink = document.querySelector('.nav-link[data-target="insights"]');
      insightsLink?.focus?.();
    });
  }

  const refreshButton = document.getElementById('dashboardRefreshInsights');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      if (aiModule?.render) {
        aiModule.render();
      }
      const originalText = refreshButton.textContent;
      refreshButton.textContent = 'Analyse actualisée';
      refreshButton.disabled = true;
      setTimeout(() => {
        refreshButton.textContent = originalText;
        refreshButton.disabled = false;
      }, 1400);
    });
  }
}

function setupSettings() {
  const form = document.getElementById('settingsForm');
  const resetButton = document.getElementById('resetData');
  if (!form) return;

  const fields = {
    currency: form.querySelector('#currency'),
    lowStockThreshold: form.querySelector('#lowStockThreshold'),
    receiptFormat: form.querySelector('#receiptFormat'),
    defaultShop: form.querySelector('#defaultShop'),
    defaultSeller: form.querySelector('#defaultSeller'),
    autoPrint: form.querySelector('#autoPrintReceipts'),
    companyName: form.querySelector('#companyName'),
    companyTagline: form.querySelector('#companyTagline'),
    companyPhone: form.querySelector('#companyPhone'),
    companyEmail: form.querySelector('#companyEmail'),
    companyAddress: form.querySelector('#companyAddress'),
    receiptMessage: form.querySelector('#receiptMessage'),
    closingNote: form.querySelector('#closingNote')
  };

  function populateSelect(select, items, selectedValue, emptyLabel) {
    if (!select) return;
    if (!items.length) {
      select.innerHTML = `<option value="">${emptyLabel}</option>`;
      select.disabled = true;
      select.value = '';
      return;
    }

    select.disabled = false;
    select.innerHTML = items.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
    if (selectedValue && !items.some((item) => item.id === selectedValue)) {
      const option = document.createElement('option');
      option.value = selectedValue;
      option.textContent = 'Enregistrement indisponible';
      option.dataset.missing = 'true';
      select.append(option);
    }
    if (selectedValue) {
      select.value = selectedValue;
    }
    if (!select.value && items.length) {
      select.value = items[0].id;
    }
  }

  function populateForm() {
    const data = context.getData();
    const { settings, shops, sellers } = data;

    if (fields.currency) fields.currency.value = settings.currency || 'FCFA';
    if (fields.lowStockThreshold)
      fields.lowStockThreshold.value = Number(settings.lowStockThreshold || 5);
    if (fields.receiptFormat) fields.receiptFormat.value = settings.receiptFormat || 'a4';
    if (fields.autoPrint) fields.autoPrint.checked = settings.autoPrintReceipts !== false;

    populateSelect(fields.defaultShop, shops, settings.defaultShopId, 'Aucune boutique enregistrée');
    populateSelect(fields.defaultSeller, sellers, settings.defaultSellerId, 'Aucune vendeuse enregistrée');

    if (fields.companyName) fields.companyName.value = settings.companyName || 'Jocelyne K';
    if (fields.companyTagline)
      fields.companyTagline.value = settings.companyTagline || 'Gestionnaire de ventes & stocks';
    if (fields.companyPhone) fields.companyPhone.value = settings.companyPhone || '';
    if (fields.companyEmail) fields.companyEmail.value = settings.companyEmail || '';
    if (fields.companyAddress) fields.companyAddress.value = settings.companyAddress || '';
    if (fields.receiptMessage) fields.receiptMessage.value = settings.receiptMessage || '';
    if (fields.closingNote) fields.closingNote.value = settings.closingNote || '';
  }

  populateForm();
  context.register(populateForm);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    context.updateData((draft) => {
      draft.settings.currency = formData.get('currency') || 'FCFA';
      draft.settings.lowStockThreshold = Number(formData.get('lowStockThreshold')) || 5;
      draft.settings.receiptFormat = formData.get('receiptFormat') || 'a4';
      draft.settings.defaultShopId = formData.get('defaultShop') || '';
      draft.settings.defaultSellerId = formData.get('defaultSeller') || '';
      draft.settings.autoPrintReceipts = formData.get('autoPrintReceipts') !== null;
      draft.settings.companyName = (formData.get('companyName') || '').trim() || 'Jocelyne K';
      draft.settings.companyTagline = (formData.get('companyTagline') || '').trim();
      draft.settings.companyPhone = (formData.get('companyPhone') || '').trim();
      draft.settings.companyEmail = (formData.get('companyEmail') || '').trim();
      draft.settings.companyAddress = (formData.get('companyAddress') || '').trim();
      draft.settings.receiptMessage = (formData.get('receiptMessage') || '').trim();
      draft.settings.closingNote = (formData.get('closingNote') || '').trim();
    });
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
        state.data = resetData();
        form.reset();
        notify();
      }
    });
  }
}

function init() {
  setupNavigation();
  setupSearch();
  setupExport();
  setupSettings();

  const registeredModules = [
    initShops(context),
    initSellers(context),
    initProducts(context),
    initSales(context),
    initAdvances(context),
    initStats(context)
  ];

  aiModule = initAi(context);
  if (aiModule) {
    registeredModules.push(aiModule);
  }

  modules.push(...registeredModules.filter(Boolean));

  setupDashboardShortcuts();

  notify();
}

window.addEventListener('DOMContentLoaded', init);
