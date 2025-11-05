import { db, withTransaction } from '../config/database.js';

export const getStockByShop = async (shopId) => db('stock as s')
  .join('products as p', 'p.id', 's.product_id')
  .select('s.*', 'p.name as product_name', 'p.sku', 'p.barcode')
  .where('s.shop_id', shopId)
  .orderBy('p.name');

export const adjustStock = async ({ shopId, productId, quantity, type, reference, notes }, userId) => withTransaction(async (trx) => {
  const stockRow = await trx('stock').where({ shop_id: shopId, product_id: productId }).first();
  if (!stockRow) {
    await trx('stock').insert({ shop_id: shopId, product_id: productId, quantity: 0 });
  }

  await trx('stock').where({ shop_id: shopId, product_id: productId }).increment('quantity', quantity);

  await trx('stock_movements').insert({
    shop_id: shopId,
    product_id: productId,
    type,
    quantity,
    reference,
    notes,
    created_by: userId
  });
});

export const transferStock = async ({ sourceShopId, targetShopId, productId, quantity, reference, notes }, userId) => withTransaction(async (trx) => {
  await trx('stock').where({ shop_id: sourceShopId, product_id: productId }).decrement('quantity', quantity);
  const targetStock = await trx('stock').where({ shop_id: targetShopId, product_id: productId }).first();
  if (!targetStock) {
    await trx('stock').insert({ shop_id: targetShopId, product_id: productId, quantity: 0 });
  }
  await trx('stock').where({ shop_id: targetShopId, product_id: productId }).increment('quantity', quantity);

  await trx('stock_movements').insert([{
    shop_id: sourceShopId,
    product_id: productId,
    target_shop_id: targetShopId,
    type: 'transfer_out',
    quantity: -Math.abs(quantity),
    reference,
    notes,
    created_by: userId
  }, {
    shop_id: targetShopId,
    product_id: productId,
    source_shop_id: sourceShopId,
    type: 'transfer_in',
    quantity: Math.abs(quantity),
    reference,
    notes,
    created_by: userId
  }]);
});

export const listMovements = async ({ shopId, productId }) => {
  const query = db('stock_movements').orderBy('created_at', 'desc');
  if (shopId) query.where({ shop_id: shopId });
  if (productId) query.where({ product_id: productId });
  return query;
};
