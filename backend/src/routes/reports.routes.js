import { Router } from 'express';
import { query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { revenue, topProducts, cashRegisters, shopsComparison } from '../controllers/reports.controller.js';

const router = Router();

router.use(authenticate);

router.get('/revenue', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('period').optional().isIn(['day', 'week', 'month'])
]), revenue);

router.get('/top-products', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
]), topProducts);

router.get('/cash-registers', validate([
  query('shop_id').optional().isInt({ min: 1 }),
  query('date').optional().isISO8601()
]), cashRegisters);

router.get('/compare-shops', validate([
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601()
]), shopsComparison);

export default router;
