import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../services/users.service.js';

export const index = async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const store = async (req, res, next) => {
  try {
    const user = await createUser(req.body, req.user.id);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    const updated = await updateUser(req.params.id, req.body, req.user.id);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    await deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
