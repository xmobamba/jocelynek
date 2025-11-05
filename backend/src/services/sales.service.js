import { nanoid } from 'nanoid';
import { db, withTransaction } from '../config/database.js';

const generateReference = () => `SALE-${nanoid(8).toUpperCase()}`;

export const listSales = async ({ shopId, from, to }) => {
  const query = db('sales as s')
    .leftJoin('customers as c', 'c.id', 's.customer_id')
    .leftJoin('users as u', 'u.id', 's.cashier_id')
    .select('s.*', 'c.first_name as customer_first_name', 'c.last_name as customer_last_name', 'u.first_name as cashier_first_name', 'u.last_name as cashier_last_name')
    .orderBy('s.sold_at', 'desc');

  if (shopId) query.where('s.shop_id', shopId);
  if (from) query.where('s.sold_at', '>=', from);
  if (to) query.where('s.sold_at', '<=', to);

  return query;
};

export const getSaleById = async (id) => {
  const sale = await db('sales').where({ id }).first();
  if (!sale) return null;
  const items = await db('sale_items').where({ sale_id: id });
  const payments = await db('payments').where({ sale_id: id });
  return { ...sale, items, payments };
};

export const createSale = async (payload, userId) => withTransaction(async (trx) => {
  const reference = payload.reference || generateReference();
  const items = payload.items || [];
  const payments = payload.payments || [];

  const [saleId] = await trx('sales').insert({
    shop_id: payload.shop_id,
    cash_register_id: payload.cash_register_id,
    customer_id: payload.customer_id,
    cashier_id: userId,
    reference,
    subtotal: payload.subtotal,
    discount_amount: payload.discount_amount,
    tax_amount: payload.tax_amount,
    total: payload.total,
    paid_amount: payload.paid_amount,
    balance: payload.balance,
    status: payload.status || 'completed',
    notes: payload.notes,
    sold_at: payload.sold_at || new Date(),
    created_by: userId,
    updated_by: userId
  });

  for (const item of items) {
    await trx('sale_items').insert({
      sale_id: saleId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      tax_amount: item.tax_amount,
      total: item.total
    });

    await trx('stock').where({ shop_id: payload.shop_id, product_id: item.product_id }).decrement('quantity', item.quantity);
    await trx('stock_movements').insert({
      shop_id: payload.shop_id,
      product_id: item.product_id,
      sale_id: saleId,
      type: 'sale',
      quantity: -Math.abs(item.quantity),
      reference,
      created_by: userId
    });
  }

  for (const payment of payments) {
    await trx('payments').insert({
      sale_id: saleId,
      method: payment.method,
      provider: payment.provider,
      amount: payment.amount,
      transaction_reference: payment.transaction_reference,
      created_by: userId
    });
  }

  if (payload.customer_id && payload.balance !== 0) {
    await trx('customers').where({ id: payload.customer_id }).increment('balance', payload.balance);
  }

  return getSaleById(saleId);
});
