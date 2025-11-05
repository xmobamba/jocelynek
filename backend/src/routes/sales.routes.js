import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store } from '../controllers/sales.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601()
]), index);

router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);

router.post('/', validate([
  body('shop_id').isInt({ min: 1 }),
  body('cash_register_id').optional().isInt({ min: 1 }),
  body('customer_id').optional().isInt({ min: 1 }),
  body('subtotal').isFloat({ min: 0 }),
  body('discount_amount').optional().isFloat(),
  body('tax_amount').optional().isFloat(),
  body('total').isFloat({ min: 0 }),
  body('paid_amount').isFloat({ min: 0 }),
  body('balance').isFloat(),
  body('status').optional().isIn(['draft', 'completed', 'refunded', 'void']),
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt({ min: 1 }),
  body('items.*.quantity').isFloat({ min: 0.001 }),
  body('items.*.unit_price').isFloat({ min: 0 }),
  body('items.*.total').isFloat({ min: 0 }),
  body('payments').isArray(),
  body('payments.*.method').isIn(['cash', 'card', 'mobile_money', 'credit']),
  body('payments.*.provider').optional().isString(),
  body('payments.*.amount').isFloat({ min: 0 })
]), store);

export default router;
