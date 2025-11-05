import { db } from '../config/database.js';

export const getRevenueReport = async ({ shopId, period }) => {
  const query = db('sales').select(
    db.raw('DATE(sold_at) as date'),
    db.raw('SUM(total) as total_sales'),
    db.raw('SUM(tax_amount) as total_tax'),
    db.raw('SUM(discount_amount) as total_discount')
  ).where('status', 'completed')
    .groupByRaw('DATE(sold_at)')
    .orderBy('date', 'desc');

  if (shopId) query.andWhere('shop_id', shopId);

  if (period === 'week') {
    query.andWhere('sold_at', '>=', db.raw('DATE_SUB(CURDATE(), INTERVAL 7 DAY)'));
  } else if (period === 'month') {
    query.andWhere('sold_at', '>=', db.raw('DATE_SUB(CURDATE(), INTERVAL 30 DAY)'));
  }

  return query;
};

export const getTopProducts = async ({ limit = 10, shopId }) => {
  const query = db('sale_items as si')
    .join('sales as s', 's.id', 'si.sale_id')
    .join('products as p', 'p.id', 'si.product_id')
    .select('si.product_id', 'p.name', db.raw('SUM(si.quantity) as total_quantity'), db.raw('SUM(si.total) as total_amount'))
    .where('s.status', 'completed')
    .groupBy('si.product_id', 'p.name')
    .orderBy('total_quantity', 'desc')
    .limit(limit);
  if (shopId) query.andWhere('s.shop_id', shopId);
  return query;
};

export const getCashRegisterReport = async ({ shopId, date }) => {
  const query = db('sales as s')
    .join('cash_registers as cr', 'cr.id', 's.cash_register_id')
    .select('cr.name', db.raw('SUM(s.total) as total_sales'), db.raw('SUM(s.paid_amount) as total_paid'))
    .groupBy('cr.name');
  if (shopId) query.where('s.shop_id', shopId);
  if (date) query.andWhere(db.raw('DATE(s.sold_at) = ?', [date]));
  return query;
};

export const compareShops = async ({ from, to }) => {
  const query = db('sales')
    .select('shop_id', db.raw('SUM(total) as total_sales'), db.raw('SUM(paid_amount) as total_paid'))
    .where('status', 'completed')
    .groupBy('shop_id');

  if (from) query.andWhere('sold_at', '>=', from);
  if (to) query.andWhere('sold_at', '<=', to);

  return query;
};
