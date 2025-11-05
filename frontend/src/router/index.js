import { createRouter, createWebHistory } from 'vue-router';
import PosView from '../modules/pos/PosView.vue';

const routes = [
  { path: '/', redirect: '/pos' },
  { path: '/pos', component: PosView },
  { path: '/products', component: () => import('../modules/products/ProductsPlaceholder.vue') },
  { path: '/stock', component: () => import('../modules/stock/StockPlaceholder.vue') },
  { path: '/customers', component: () => import('../modules/customers/CustomersPlaceholder.vue') },
  { path: '/reports', component: () => import('../modules/reports/ReportsPlaceholder.vue') },
  { path: '/users', component: () => import('../modules/users/UsersPlaceholder.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
