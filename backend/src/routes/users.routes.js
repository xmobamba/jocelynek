import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store, update, destroy } from '../controllers/users.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

const userValidation = [
  body('first_name').isString().trim().notEmpty(),
  body('last_name').isString().trim().notEmpty(),
  body('email').isEmail(),
  body('phone').optional().isString(),
  body('password').optional().isLength({ min: 6 }),
  body('role').isIn(['admin', 'manager', 'cashier']),
  body('shop_id').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean()
];

router.get('/', index);
router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);
router.post('/', validate([...userValidation, body('password').isLength({ min: 6 })]), store);
router.put('/:id', validate([param('id').isInt({ min: 1 }), ...userValidation]), update);
router.delete('/:id', validate([param('id').isInt({ min: 1 })]), destroy);

export default router;
