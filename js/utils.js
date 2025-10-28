const STORAGE_KEY = 'jkManagerData';

const defaultData = {
  shops: [
    { id: 'shop1', name: 'Jocelyne K', location: 'Abidjan' },
    { id: 'shop2', name: 'Jocelyne K 2', location: 'Abidjan' }
  ],
  sellers: [],
  products: [],
  sales: [],
  advances: [],
  settings: {
    currency: 'FCFA',
    lowStockThreshold: 5,
    receiptFormat: 'a4'
  },
  counters: {
    sale: 0,
    product: 0,
    seller: 0
  }
};

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = structuredClone(defaultData);
    saveData(data);
    return data;
  }
  try {
    const parsed = JSON.parse(raw);
    const data = { ...structuredClone(defaultData), ...parsed };
    // merge arrays if missing default shops
    if (!Array.isArray(data.shops) || data.shops.length === 0) {
      data.shops = structuredClone(defaultData.shops);
    } else {
      const hasShop1 = data.shops.some((shop) => shop.id === 'shop1');
      const hasShop2 = data.shops.some((shop) => shop.id === 'shop2');
      if (!hasShop1) data.shops.unshift(structuredClone(defaultData.shops[0]));
      if (!hasShop2) data.shops.push(structuredClone(defaultData.shops[1]));
    }
    if (!data.counters) {
      data.counters = structuredClone(defaultData.counters);
    }
    if (!data.settings) {
      data.settings = structuredClone(defaultData.settings);
    } else {
      data.settings = { ...structuredClone(defaultData.settings), ...data.settings };
    }
    return data;
  } catch (error) {
    console.error('Impossible de lire les données, réinitialisation...', error);
    const data = structuredClone(defaultData);
    saveData(data);
    return data;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  const data = structuredClone(defaultData);
  saveData(data);
  return data;
}

export function formatCurrency(value, currency = 'FCFA') {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'FCFA' ? 'XOF' : 'XOF',
    minimumFractionDigits: 0
  })
    .format(number)
    .replace('XOF', currency);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
}

export function calculateSaleAmounts(sale, product) {
  const unit =
    sale && sale.unitPrice !== undefined && sale.unitPrice !== null && sale.unitPrice !== ''
      ? Number(sale.unitPrice) || 0
      : Number(product?.price) || 0;
  const quantity = Number(sale?.quantity || 0);
  const discount = Number(sale?.discount || 0);
  const total = Math.max(unit * quantity - discount, 0);
  const advanceRaw = Number(sale?.advance || 0);
  const advance = Math.min(Math.max(advanceRaw, 0), total);
  const balance = Math.max(total - advance, 0);
  return { unit, quantity, discount, total, advance, balance };
}

export function generateIncrementalCode(prefix, counter) {
  return `${prefix}${String(counter).padStart(4, '0')}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function toISODate(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

export function isSameDay(left, right) {
  const leftIso = toISODate(left);
  const rightIso = toISODate(right);
  if (!leftIso || !rightIso) return false;
  return leftIso === rightIso;
}

export function dateToLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function clone(value) {
  return structuredClone(value);
}

export function sum(array, selector) {
  return array.reduce((total, item) => total + (selector ? selector(item) : item), 0);
}

export function groupBy(array, selector) {
  return array.reduce((groups, item) => {
    const key = selector(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function computeSaleTotals(products, sales) {
  return sales.map((sale) => {
    const product = products.find((prod) => prod.id === sale.productId) || {};
    const amounts = calculateSaleAmounts(sale, product);
    return { ...sale, unitPrice: amounts.unit, total: amounts.total, advance: amounts.advance, balance: amounts.balance };
  });
}

export function exportSalesToCsv({ sales, products, sellers, shops, settings }) {
  const rows = [
    [
      'Numéro',
      'Date',
      'Produit',
      'Quantité',
      'Prix unitaire',
      'Remise',
      'Avance',
      'Reste à payer',
      'Total',
      'Vendeuse',
      'Boutique'
    ]
  ];

  sales.forEach((sale) => {
    const product = products.find((p) => p.id === sale.productId);
    const seller = sellers.find((s) => s.id === sale.sellerId);
    const shop = shops.find((s) => s.id === sale.shopId);
    const amounts = calculateSaleAmounts(sale, product);
    rows.push([
      sale.number,
      sale.date,
      product ? product.name : '—',
      sale.quantity,
      amounts.unit,
      amounts.discount,
      amounts.advance,
      amounts.balance,
      amounts.total,
      seller ? seller.name : '—',
      shop ? shop.name : '—'
    ]);
  });

  const csvContent = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ventes_${new Date().toISOString().slice(0, 10)}.csv`);
  link.click();
  URL.revokeObjectURL(url);
}

export function structuredClone(value) {
  return JSON.parse(JSON.stringify(value));
}
