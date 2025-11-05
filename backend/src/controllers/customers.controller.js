import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../services/customers.service.js';

export const index = async (req, res, next) => {
  try {
    const customers = await listCustomers(req.query.shop_id);
    return res.json(customers);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Client introuvable' });
    }
    return res.json(customer);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const customer = await createCustomer(req.body, req.user.id);
    return res.status(201).json(customer);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Client introuvable' });
    }
    const updated = await updateCustomer(req.params.id, req.body, req.user.id);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Client introuvable' });
    }
    await deleteCustomer(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
