import { db } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

export const listUsers = async () => db('users').select('id', 'first_name', 'last_name', 'email', 'phone', 'role', 'shop_id', 'is_active');

export const getUserById = async (id) => db('users').select('id', 'first_name', 'last_name', 'email', 'phone', 'role', 'shop_id', 'is_active').where({ id }).first();

export const createUser = async (payload, currentUserId) => {
  const hashedPassword = await hashPassword(payload.password);
  const [id] = await db('users').insert({
    shop_id: payload.shop_id,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    password: hashedPassword,
    role: payload.role,
    is_active: payload.is_active ?? 1,
    created_by: currentUserId,
    updated_by: currentUserId
  });
  return getUserById(id);
};

export const updateUser = async (id, payload, currentUserId) => {
  const data = {
    shop_id: payload.shop_id,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    is_active: payload.is_active,
    updated_by: currentUserId
  };

  if (payload.password) {
    data.password = await hashPassword(payload.password);
  }

  await db('users').where({ id }).update(data);
  return getUserById(id);
};

export const deleteUser = async (id) => db('users').where({ id }).del();
