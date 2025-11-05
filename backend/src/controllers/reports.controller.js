import {
  getRevenueReport,
  getTopProducts,
  getCashRegisterReport,
  compareShops
} from '../services/reports.service.js';

export const revenue = async (req, res, next) => {
  try {
    const report = await getRevenueReport({
      shopId: req.query.shop_id,
      period: req.query.period
    });
    return res.json(report);
  } catch (error) {
    return next(error);
  }
};

export const topProducts = async (req, res, next) => {
  try {
    const report = await getTopProducts({
      limit: req.query.limit ? Number(req.query.limit) : 10,
      shopId: req.query.shop_id
    });
    return res.json(report);
  } catch (error) {
    return next(error);
  }
};

export const cashRegisters = async (req, res, next) => {
  try {
    const report = await getCashRegisterReport({
      shopId: req.query.shop_id,
      date: req.query.date
    });
    return res.json(report);
  } catch (error) {
    return next(error);
  }
};

export const shopsComparison = async (req, res, next) => {
  try {
    const report = await compareShops({
      from: req.query.from,
      to: req.query.to
    });
    return res.json(report);
  } catch (error) {
    return next(error);
  }
};
