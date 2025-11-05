import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store, update, destroy } from '../controllers/customers.controller.js';

const router = Router();

router.use(authenticate);

const customerValidation = [
  body('first_name').isString().notEmpty(),
  body('last_name').isString().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('credit_limit').optional().isFloat({ min: 0 }),
  body('balance').optional().isFloat(),
  body('notes').optional().isString(),
  body('shop_id').optional().isInt({ min: 1 })
];

router.get('/', validate([
  query('shop_id').optional().isInt({ min: 1 })
]), index);
router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);
router.post('/', validate(customerValidation), store);
router.put('/:id', validate([param('id').isInt({ min: 1 }), ...customerValidation]), update);
router.delete('/:id', validate([param('id').isInt({ min: 1 })]), destroy);

export default router;
