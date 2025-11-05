import { db } from '../config/database.js';

export const listShops = async () => db('shops').select('*');

export const getShopById = async (id) => db('shops').where({ id }).first();

export const createShop = async (payload) => {
  const [id] = await db('shops').insert(payload);
  return getShopById(id);
};

export const updateShop = async (id, payload) => {
  await db('shops').where({ id }).update(payload);
  return getShopById(id);
};

export const deleteShop = async (id) => db('shops').where({ id }).del();
