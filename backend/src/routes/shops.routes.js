import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { index, show, store, update, destroy } from '../controllers/shops.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

const shopValidation = [
  body('name').isString().notEmpty(),
  body('code').isString().notEmpty(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('country').optional().isString()
];

router.get('/', index);
router.get('/:id', validate([param('id').isInt({ min: 1 })]), show);
router.post('/', validate(shopValidation), store);
router.put('/:id', validate([param('id').isInt({ min: 1 }), ...shopValidation]), update);
router.delete('/:id', validate([param('id').isInt({ min: 1 })]), destroy);

export default router;
