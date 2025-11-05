import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '../services/api.js';

export const usePosStore = defineStore('pos', () => {
  const api = useApi();
  const cartItems = ref([]);
  const customer = ref(null);
  const payments = ref([]);
  const products = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0));
  const discount = computed(() => cartItems.value.reduce((sum, item) => sum + (item.discount_amount || 0), 0));
  const tax = computed(() => cartItems.value.reduce((sum, item) => sum + (item.tax_amount || 0), 0));
  const total = computed(() => subtotal.value - discount.value + tax.value);
  const paidAmount = computed(() => payments.value.reduce((sum, payment) => sum + payment.amount, 0));
  const balance = computed(() => total.value - paidAmount.value);

  const loadProducts = async (search = '') => {
    isLoading.value = true;
    try {
      const { data } = await api.get('/products', { params: { search } });
      products.value = data;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  };

  const addItem = (product) => {
    const existing = cartItems.value.find((item) => item.product_id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.value.push({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: product.sale_price,
        discount_amount: 0,
        tax_amount: (product.tax_rate / 100) * product.sale_price
      });
    }
  };

  const updateQuantity = (productId, quantity) => {
    const item = cartItems.value.find((i) => i.product_id === productId);
    if (!item) return;
    item.quantity = Math.max(1, quantity);
  };

  const removeItem = (productId) => {
    cartItems.value = cartItems.value.filter((item) => item.product_id !== productId);
  };

  const addPayment = (payment) => {
    payments.value.push(payment);
  };

  const reset = () => {
    cartItems.value = [];
    payments.value = [];
    customer.value = null;
  };

  const submitSale = async (payload) => {
    isLoading.value = true;
    try {
      const response = await api.post('/sales', payload);
      reset();
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    cartItems,
    products,
    customer,
    payments,
    subtotal,
    discount,
    tax,
    total,
    paidAmount,
    balance,
    isLoading,
    error,
    loadProducts,
    addItem,
    updateQuantity,
    removeItem,
    addPayment,
    submitSale,
    reset
  };
});
