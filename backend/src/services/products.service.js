import { db } from '../config/database.js';

export const listProducts = async ({ shopId, search }) => {
  const query = db('products as p')
    .leftJoin('categories as c', 'c.id', 'p.category_id')
    .select('p.*', 'c.name as category_name');

  if (shopId) {
    query.where('p.shop_id', shopId).orWhereNull('p.shop_id');
  }

  if (search) {
    query.andWhere((builder) => {
      builder.where('p.name', 'like', `%${search}%`)
        .orWhere('p.sku', 'like', `%${search}%`)
        .orWhere('p.barcode', 'like', `%${search}%`);
    });
  }

  query.orderBy('p.name');
  return query;
};

export const getProductById = async (id) => db('products').where({ id }).first();

export const createProduct = async (payload, userId) => {
  const [id] = await db('products').insert({
    shop_id: payload.shop_id,
    category_id: payload.category_id,
    sku: payload.sku,
    barcode: payload.barcode,
    name: payload.name,
    description: payload.description,
    purchase_price: payload.purchase_price,
    sale_price: payload.sale_price,
    tax_rate: payload.tax_rate,
    unit: payload.unit,
    image_url: payload.image_url,
    is_active: payload.is_active ?? 1,
    created_by: userId,
    updated_by: userId
  });
  return getProductById(id);
};

export const updateProduct = async (id, payload, userId) => {
  await db('products').where({ id }).update({
    shop_id: payload.shop_id,
    category_id: payload.category_id,
    sku: payload.sku,
    barcode: payload.barcode,
    name: payload.name,
    description: payload.description,
    purchase_price: payload.purchase_price,
    sale_price: payload.sale_price,
    tax_rate: payload.tax_rate,
    unit: payload.unit,
    image_url: payload.image_url,
    is_active: payload.is_active,
    updated_by: userId
  });
  return getProductById(id);
};

export const deleteProduct = async (id) => db('products').where({ id }).del();
