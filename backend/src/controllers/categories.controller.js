import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categories.service.js';

export const index = async (req, res, next) => {
  try {
    const categories = await listCategories(req.query.shop_id);
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const category = await createCategory(req.body, req.user.id);
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    const updated = await updateCategory(req.params.id, req.body, req.user.id);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    await deleteCategory(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
