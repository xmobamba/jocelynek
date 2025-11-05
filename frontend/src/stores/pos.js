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
  const searchTerm = ref('');
  const activeCategory = ref('all');

  const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0));
  const discount = computed(() => cartItems.value.reduce((sum, item) => sum + (item.discount_amount || 0), 0));
  const tax = computed(() => cartItems.value.reduce((sum, item) => sum + (item.tax_amount || 0), 0));
  const total = computed(() => subtotal.value - discount.value + tax.value);
  const paidAmount = computed(() => payments.value.reduce((sum, payment) => sum + payment.amount, 0));
  const balance = computed(() => total.value - paidAmount.value);

  const categories = computed(() => {
    const groups = new Map();
    products.value.forEach((product) => {
      const id = product.category_id ?? 'uncategorized';
      const name = product.category_name || product.category || 'Non classé';
      if (!groups.has(id)) {
        groups.set(id, { id: String(id), name, count: 0 });
      }
      groups.get(id).count += 1;
    });

    const sorted = Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
    return [
      { id: 'all', name: 'Tous les produits', count: products.value.length },
      ...sorted
    ];
  });

  const filteredProducts = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    return products.value.filter((product) => {
      const categoryId = String(product.category_id ?? 'uncategorized');
      const matchesCategory = activeCategory.value === 'all' || activeCategory.value === categoryId;
      if (!matchesCategory) return false;

      if (!term) return true;
      const fields = [product.name, product.sku, product.barcode];
      return fields.some((field) => field && String(field).toLowerCase().includes(term));
    });
  });

  const loadProducts = async (search = '') => {
    isLoading.value = true;
    searchTerm.value = search;
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/products', { params });
      products.value = data;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  };

  const setActiveCategory = (categoryId) => {
    activeCategory.value = categoryId;
  };

  const setSearchTerm = (value) => {
    searchTerm.value = value;
  };

  const addItem = (product, quantity = 1) => {
    const parsedQuantity = Number(quantity);
    const normalizedQuantity = Math.max(1, Number.isFinite(parsedQuantity) ? parsedQuantity : 1);
    const existing = cartItems.value.find((item) => item.product_id === product.id);
    if (existing) {
      existing.quantity += normalizedQuantity;
    } else {
      const taxRate = Number.isFinite(product.tax_rate) ? product.tax_rate : 0;
      cartItems.value.push({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: normalizedQuantity,
        unit_price: product.sale_price,
        discount_amount: 0,
        tax_amount: (taxRate / 100) * product.sale_price
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
    filteredProducts,
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
    categories,
    activeCategory,
    searchTerm,
    loadProducts,
    setActiveCategory,
    setSearchTerm,
    addItem,
    updateQuantity,
    removeItem,
    addPayment,
    submitSale,
    reset
  };
});
