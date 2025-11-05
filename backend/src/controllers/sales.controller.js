import { listSales, getSaleById, createSale } from '../services/sales.service.js';

export const index = async (req, res, next) => {
  try {
    const sales = await listSales({
      shopId: req.query.shop_id,
      from: req.query.from,
      to: req.query.to
    });
    return res.json(sales);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const sale = await getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Vente introuvable' });
    }
    return res.json(sale);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const sale = await createSale(req.body, req.user.id);
    return res.status(201).json(sale);
  } catch (error) {
    return next(error);
  }
};
