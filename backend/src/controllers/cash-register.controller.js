import {
  listCashRegisters,
  getCashRegisterById,
  openCashRegister,
  closeCashRegister
} from '../services/cash-register.service.js';

export const index = async (req, res, next) => {
  try {
    const registers = await listCashRegisters(req.query.shop_id);
    return res.json(registers);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const register = await getCashRegisterById(req.params.id);
    if (!register) {
      return res.status(404).json({ message: 'Caisse introuvable' });
    }
    return res.json(register);
  } catch (error) {
    return next(error);
  }
};

export const open = async (req, res, next) => {
  try {
    const register = await openCashRegister({
      cashRegisterId: req.params.id,
      amount: req.body.amount,
      notes: req.body.notes
    }, req.user.id);
    return res.json(register);
  } catch (error) {
    return next(error);
  }
};

export const close = async (req, res, next) => {
  try {
    const register = await closeCashRegister({
      cashRegisterId: req.params.id,
      amount: req.body.amount,
      notes: req.body.notes
    }, req.user.id);
    return res.json(register);
  } catch (error) {
    return next(error);
  }
};
