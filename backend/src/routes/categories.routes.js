import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store, update, destroy } from '../controllers/categories.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', validate([
  query('shop_id').optional().isInt({ min: 1 })
]), index);

router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);

router.post('/', validate([
  body('name').isString().notEmpty(),
  body('shop_id').optional().isInt({ min: 1 }),
  body('description').optional().isString()
]), store);

router.put('/:id', validate([
  param('id').isInt({ min: 1 }),
  body('name').isString().notEmpty(),
  body('shop_id').optional().isInt({ min: 1 }),
  body('description').optional().isString()
]), update);

router.delete('/:id', validate([param('id').isInt({ min: 1 })]), destroy);

export default router;
