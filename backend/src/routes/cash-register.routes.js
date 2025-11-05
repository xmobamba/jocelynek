import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, open, close } from '../controllers/cash-register.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', validate([
  query('shop_id').optional().isInt({ min: 1 })
]), index);

router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);

router.post('/:id/open', validate([
  param('id').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0 }),
  body('notes').optional().isString()
]), open);

router.post('/:id/close', validate([
  param('id').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0 }),
  body('notes').optional().isString()
]), close);

export default router;
