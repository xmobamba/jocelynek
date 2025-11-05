import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store, update, destroy } from '../controllers/products.controller.js';

const router = Router();

router.use(authenticate);

const productValidation = [
  body('name').isString().notEmpty(),
  body('sku').isString().notEmpty(),
  body('barcode').optional().isString(),
  body('category_id').optional().isInt({ min: 1 }),
  body('shop_id').optional().isInt({ min: 1 }),
  body('purchase_price').isFloat({ min: 0 }),
  body('sale_price').isFloat({ min: 0 }),
  body('tax_rate').optional().isFloat({ min: 0 }),
  body('unit').optional().isString(),
  body('image_url').optional().isURL(),
  body('is_active').optional().isBoolean()
];

router.get('/', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('search').optional().isString()
]), index);

router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);
router.post('/', validate(productValidation), store);
router.put('/:id', validate([param('id').isInt({ min: 1 }), ...productValidation]), update);
router.delete('/:id', validate([param('id').isInt({ min: 1 })]), destroy);

export default router;
