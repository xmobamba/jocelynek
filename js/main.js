import {
  loadData,
  saveData,
  resetData,
  formatCurrency,
  generateIncrementalCode,
  todayISO,
  exportSalesToCsv,
  structuredClone
} from './utils.js';
import { initShops } from './shops.js';
import { initSellers } from './sellers.js';
import { initProducts } from './products.js';
import { initSales } from './sales.js';
import { initAdvances } from './advances.js';
import { initStats } from './stats.js';

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

function notify() {
  modules.forEach((module) => module.render());
  renderDashboard();
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((btn) => btn.classList.remove('active'));
      views.forEach((view) => view.classList.remove('active'));

      link.classList.add('active');
      const target = link.dataset.target;
      document.getElementById(target).classList.add('active');
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
  const salesToday = data.sales.filter((sale) => sale.date === today);
  const totalToday = salesToday.reduce((sum, sale) => {
    const product = data.products.find((prod) => prod.id === sale.productId);
    const unit = product ? Number(product.price) : 0;
    return sum + unit * sale.quantity - (sale.discount || 0);
  }, 0);
  const totalMonth = data.sales.reduce((sum, sale) => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
      ? sum + (data.products.find((prod) => prod.id === sale.productId)?.price || 0) * sale.quantity - (sale.discount || 0)
      : sum;
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
      const total = (product ? Number(product.price) : 0) * sale.quantity - (sale.discount || 0);
      return `
        <tr>
          <td>${sale.number}</td>
          <td>${product ? product.name : '—'}</td>
          <td>${sale.quantity}</td>
          <td>${context.formatCurrency(total, data.settings.currency)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderLowStock(data) {
  const list = document.getElementById('lowStockList');
  if (!list) return;
  const threshold = Number(data.settings.lowStockThreshold || 5);
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

function setupExport() {
  const btn = document.getElementById('exportCsvBtn');
  btn.addEventListener('click', () => {
    const data = context.getData();
    exportSalesToCsv(data);
  });
}

function setupSettings() {
  const form = document.getElementById('settingsForm');
  const resetButton = document.getElementById('resetData');
  const data = context.getData();
  form.currency.value = data.settings.currency;
  form.lowStockThreshold.value = data.settings.lowStockThreshold;
  form.receiptFormat.value = data.settings.receiptFormat;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    context.updateData((draft) => {
      draft.settings.currency = formData.get('currency') || 'FCFA';
      draft.settings.lowStockThreshold = Number(formData.get('lowStockThreshold')) || 5;
      draft.settings.receiptFormat = formData.get('receiptFormat') || 'a4';
    });
  });

  resetButton.addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
      state.data = resetData();
      notify();
    }
  });
}

function init() {
  setupNavigation();
  setupSearch();
  setupExport();
  setupSettings();

  modules.push(
    initShops(context),
    initSellers(context),
    initProducts(context),
    initSales(context),
    initAdvances(context),
    initStats(context)
  );

  notify();
}

window.addEventListener('DOMContentLoaded', init);
