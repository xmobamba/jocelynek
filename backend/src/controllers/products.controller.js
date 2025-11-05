import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/products.service.js';

export const index = async (req, res, next) => {
  try {
    const products = await listProducts({
      shopId: req.query.shop_id,
      search: req.query.search
    });
    return res.json(products);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const product = await createProduct(req.body, req.user.id);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    const updated = await updateProduct(req.params.id, req.body, req.user.id);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    await deleteProduct(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
