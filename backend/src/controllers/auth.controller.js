import { generateToken } from '../utils/token.js';
import { comparePassword } from '../utils/password.js';
import { db } from '../config/database.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    await db('users').where({ id: user.id }).update({ last_login_at: new Date() });

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        shop_id: user.shop_id
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req, res) => {
  const { token: oldToken } = req.body;
  return res.json({ token: oldToken });
};

export const me = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      shop_id: user.shop_id
    });
  } catch (error) {
    return next(error);
  }
};
