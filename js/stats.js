import { calculateSaleAmounts, formatNumber } from './utils.js';

const PERIODS = {
  week: { days: 7, label: '7 derniers jours' },
  month: { days: 30, label: '30 derniers jours' },
  quarter: { days: 90, label: '90 derniers jours' }
};

export function initStats(context) {
  const periodSelect = document.getElementById('statsPeriod');
  const periodLabel = document.getElementById('statsPeriodLabel');
  const revenueChart = document.getElementById('revenueChart');
  const topProductsList = document.getElementById('topProductsList');
  const topSellersList = document.getElementById('topSellersList');

  periodSelect.addEventListener('change', () => render());

  function render() {
    const { sales, products, sellers, settings } = context.getData();
    const period = periodSelect.value;
    const { days, label } = PERIODS[period];
    periodLabel.textContent = label;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const filteredSales = sales.filter((sale) => new Date(sale.date) >= startDate);
    renderRevenueChart(filteredSales, products, settings, revenueChart, startDate, days);
    renderTopProducts(filteredSales, products, settings, topProductsList);
    renderTopSellers(filteredSales, sellers, products, settings, topSellersList);
  }

  return { render };
}

function renderRevenueChart(sales, products, settings, container, startDate, days) {
  const dailyTotals = Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const label = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const total = sales
      .filter((sale) => sameDay(new Date(sale.date), date))
      .reduce((sum, sale) => {
        const product = products.find((prod) => prod.id === sale.productId);
        const amounts = calculateSaleAmounts(sale, product);
        return sum + amounts.total;
      }, 0);
    return { label, total };
  });

  const maxTotal = Math.max(...dailyTotals.map((day) => day.total), 1);
  container.innerHTML = dailyTotals
    .map((day) => {
      const height = Math.max((day.total / maxTotal) * 100, 8);
      return `
        <div class="chart-bar" style="height: ${height}%">
          <span>${formatNumber(day.total)}</span>
          <small>${day.label}</small>
        </div>
      `;
    })
    .join('');
}

function renderTopProducts(sales, products, settings, container) {
  const totals = sales.reduce((acc, sale) => {
    const product = products.find((prod) => prod.id === sale.productId);
    if (!product) return acc;
    if (!acc[product.id]) {
      acc[product.id] = { name: product.name, quantity: 0, total: 0 };
    }
    acc[product.id].quantity += sale.quantity;
    const amounts = calculateSaleAmounts(sale, product);
    acc[product.id].total += amounts.total;
    return acc;
  }, {});

  const ranking = Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (!ranking.length) {
    container.innerHTML = '<li class="empty-state">Pas de ventes sur cette période.</li>';
    return;
  }

  container.innerHTML = ranking
    .map(
      (item) => `
        <li>
          <span>${item.name}</span>
          <small>${item.quantity} vendus · ${new Intl.NumberFormat('fr-FR').format(item.total)} ${settings.currency}</small>
        </li>
      `
    )
    .join('');
}

function renderTopSellers(sales, sellers, products, settings, container) {
  const totals = sales.reduce((acc, sale) => {
    const seller = sellers.find((sel) => sel.id === sale.sellerId);
    const product = products.find((prod) => prod.id === sale.productId);
    if (!seller || !product) return acc;
    if (!acc[seller.id]) {
      acc[seller.id] = { name: seller.name, quantity: 0, total: 0 };
    }
    acc[seller.id].quantity += sale.quantity;
    const amounts = calculateSaleAmounts(sale, product);
    acc[seller.id].total += amounts.total;
    return acc;
  }, {});

  const ranking = Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (!ranking.length) {
    container.innerHTML = '<li class="empty-state">Pas de ventes sur cette période.</li>';
    return;
  }

  container.innerHTML = ranking
    .map(
      (item) => `
        <li>
          <span>${item.name}</span>
          <small>${item.quantity} ventes · ${new Intl.NumberFormat('fr-FR').format(item.total)} ${settings.currency}</small>
        </li>
      `
    )
    .join('');
}

function sameDay(dateA, dateB) {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}
