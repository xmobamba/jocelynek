import { getStockByShop, adjustStock, transferStock, listMovements } from '../services/stock.service.js';

export const stockByShop = async (req, res, next) => {
  try {
    const stock = await getStockByShop(req.params.shopId);
    return res.json(stock);
  } catch (error) {
    return next(error);
  }
};

export const adjust = async (req, res, next) => {
  try {
    await adjustStock({
      shopId: req.body.shop_id,
      productId: req.body.product_id,
      quantity: req.body.quantity,
      type: req.body.type,
      reference: req.body.reference,
      notes: req.body.notes
    }, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const transfer = async (req, res, next) => {
  try {
    await transferStock({
      sourceShopId: req.body.source_shop_id,
      targetShopId: req.body.target_shop_id,
      productId: req.body.product_id,
      quantity: req.body.quantity,
      reference: req.body.reference,
      notes: req.body.notes
    }, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const movements = async (req, res, next) => {
  try {
    const history = await listMovements({
      shopId: req.query.shop_id,
      productId: req.query.product_id
    });
    return res.json(history);
  } catch (error) {
    return next(error);
  }
};
