import { db } from '../config/database.js';

export const listCustomers = async (shopId) => {
  const query = db('customers');
  if (shopId) {
    query.where({ shop_id: shopId });
  }
  return query.orderBy('last_name');
};

export const getCustomerById = async (id) => db('customers').where({ id }).first();

export const createCustomer = async (payload, userId) => {
  const [id] = await db('customers').insert({
    shop_id: payload.shop_id,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    credit_limit: payload.credit_limit ?? 0,
    balance: payload.balance ?? 0,
    notes: payload.notes,
    created_by: userId,
    updated_by: userId
  });
  return getCustomerById(id);
};

export const updateCustomer = async (id, payload, userId) => {
  await db('customers').where({ id }).update({
    shop_id: payload.shop_id,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    credit_limit: payload.credit_limit,
    balance: payload.balance,
    notes: payload.notes,
    updated_by: userId
  });
  return getCustomerById(id);
};

export const deleteCustomer = async (id) => db('customers').where({ id }).del();
