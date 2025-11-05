import { db } from '../config/database.js';

export const listCategories = async (shopId) => {
  const query = db('categories').select('*');
  if (shopId) {
    query.where({ shop_id: shopId });
  }
  return query;
};

export const getCategoryById = async (id) => db('categories').where({ id }).first();

export const createCategory = async (payload, userId) => {
  const [id] = await db('categories').insert({
    shop_id: payload.shop_id,
    name: payload.name,
    description: payload.description,
    created_by: userId,
    updated_by: userId
  });
  return getCategoryById(id);
};

export const updateCategory = async (id, payload, userId) => {
  await db('categories').where({ id }).update({
    shop_id: payload.shop_id,
    name: payload.name,
    description: payload.description,
    updated_by: userId
  });
  return getCategoryById(id);
};

export const deleteCategory = async (id) => db('categories').where({ id }).del();
