import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validator.js';
import { login, refreshToken, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', validate([
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
]), login);

router.post('/refresh', validate([
  body('token').isString()
]), refreshToken);

router.get('/me', authenticate, me);

export default router;
