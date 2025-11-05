import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { stockByShop, adjust, transfer, movements } from '../controllers/stock.controller.js';

const router = Router();

router.use(authenticate);

router.get('/shops/:shopId', validate([param('shopId').isInt({ min: 1 })]), stockByShop);

router.post('/adjust', validate([
  body('shop_id').isInt({ min: 1 }),
  body('product_id').isInt({ min: 1 }),
  body('quantity').isFloat(),
  body('type').isIn(['purchase', 'sale', 'adjustment', 'inventory']),
  body('reference').isString().notEmpty(),
  body('notes').optional().isString()
]), adjust);

router.post('/transfer', validate([
  body('source_shop_id').isInt({ min: 1 }),
  body('target_shop_id').isInt({ min: 1 }),
  body('product_id').isInt({ min: 1 }),
  body('quantity').isFloat({ min: 0.001 }),
  body('reference').isString().notEmpty(),
  body('notes').optional().isString()
]), transfer);

router.get('/movements', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('product_id').optional().isInt({ min: 1 })
]), movements);

export default router;
