import { listShops, getShopById, createShop, updateShop, deleteShop } from '../services/shops.service.js';

export const index = async (req, res, next) => {
  try {
    const shops = await listShops();
    return res.json(shops);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const shop = await getShopById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }
    return res.json(shop);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const shop = await createShop(req.body);
    return res.status(201).json(shop);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const shop = await getShopById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }
    const updated = await updateShop(req.params.id, req.body);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const shop = await getShopById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }
    await deleteShop(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
