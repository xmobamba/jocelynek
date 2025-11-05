import { db, withTransaction } from '../config/database.js';

export const listCashRegisters = async (shopId) => {
  const query = db('cash_registers');
  if (shopId) query.where({ shop_id: shopId });
  return query.orderBy('name');
};

export const getCashRegisterById = async (id) => db('cash_registers').where({ id }).first();

export const openCashRegister = async ({ cashRegisterId, amount, notes }, userId) => withTransaction(async (trx) => {
  const register = await trx('cash_registers').where({ id: cashRegisterId }).first();
  if (!register) throw new Error('Caisse introuvable');
  if (register.status === 'open') throw Object.assign(new Error('Caisse déjà ouverte'), { status: 409 });

  await trx('cash_registers').where({ id: cashRegisterId }).update({
    status: 'open',
    opened_at: new Date(),
    opening_amount: amount,
    updated_by: userId
  });

  await trx('cash_register_sessions').insert({
    cash_register_id: cashRegisterId,
    opened_by: userId,
    opened_at: new Date(),
    opening_amount: amount,
    notes
  });

  return getCashRegisterById(cashRegisterId);
});

export const closeCashRegister = async ({ cashRegisterId, amount, notes }, userId) => withTransaction(async (trx) => {
  const register = await trx('cash_registers').where({ id: cashRegisterId }).first();
  if (!register) throw new Error('Caisse introuvable');
  if (register.status === 'closed') throw Object.assign(new Error('Caisse déjà fermée'), { status: 409 });

  await trx('cash_registers').where({ id: cashRegisterId }).update({
    status: 'closed',
    closed_at: new Date(),
    closing_amount: amount,
    updated_by: userId
  });

  await trx('cash_register_sessions')
    .where({ cash_register_id: cashRegisterId })
    .andWhereNull('closed_at')
    .orderBy('opened_at', 'desc')
    .limit(1)
    .update({
      closed_by: userId,
      closed_at: new Date(),
      closing_amount: amount,
      notes
    });

  return getCashRegisterById(cashRegisterId);
});
