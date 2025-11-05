import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import shopRoutes from './shops.routes.js';
import categoryRoutes from './categories.routes.js';
import productRoutes from './products.routes.js';
import customerRoutes from './customers.routes.js';
import stockRoutes from './stock.routes.js';
import saleRoutes from './sales.routes.js';
import reportRoutes from './reports.routes.js';
import cashRegisterRoutes from './cash-register.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shops', shopRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/stock', stockRoutes);
router.use('/sales', saleRoutes);
router.use('/reports', reportRoutes);
router.use('/cash-registers', cashRegisterRoutes);

export default router;
