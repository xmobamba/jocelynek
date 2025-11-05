import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    shop_id: user.shop_id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '12h'
  });
};
