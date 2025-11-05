<template>
  <div class="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-3">
    <section class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
      <ProductSearch @select="handleProductSelect" />
      <CartSummary
        :items="store.cartItems"
        :subtotal="store.subtotal"
        :tax="store.tax"
        :discount="store.discount"
        :total="store.total"
        @quantity-change="store.updateQuantity"
        @remove="store.removeItem"
      />
    </section>

    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">Récapitulatif</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">Sous-total</dt>
            <dd class="font-medium">{{ currency(store.subtotal) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Remises</dt>
            <dd class="font-medium">-{{ currency(store.discount) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">TVA</dt>
            <dd class="font-medium">{{ currency(store.tax) }}</dd>
          </div>
          <div class="flex justify-between text-lg">
            <dt class="text-slate-700">Total</dt>
            <dd class="font-semibold text-slate-900">{{ currency(store.total) }}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-slate-600 uppercase">Paiements</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="(payment, index) in store.payments" :key="index" class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span class="capitalize">{{ payment.method }} - {{ payment.provider }}</span>
            <span class="font-medium">{{ currency(payment.amount) }}</span>
          </li>
          <li v-if="!store.payments.length" class="text-slate-400 text-center py-6 text-sm">
            Aucun paiement enregistré
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="w-full rounded-lg bg-primary text-white py-3 font-semibold shadow hover:bg-primary-dark transition"
        @click="openPayment"
      >
        Enregistrer le paiement
      </button>

      <p class="text-xs text-slate-400">
        Mode hors ligne à venir : les ventes seront synchronisées automatiquement lors du retour de la connexion.
      </p>
    </section>

    <PaymentModal
      v-if="showPayment"
      :total="store.total"
      :paid="store.paidAmount"
      :balance="store.balance"
      @close="showPayment = false"
      @submit="handlePayment"
    />
    <QuantitySelectorModal
      v-if="productToAdd"
      :product="productToAdd"
      @close="closeQuantityModal"
      @confirm="confirmAddItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePosStore } from '../../stores/pos.js';
import ProductSearch from './components/ProductSearch.vue';
import CartSummary from './components/CartSummary.vue';
import PaymentModal from './components/PaymentModal.vue';
import QuantitySelectorModal from './components/QuantitySelectorModal.vue';

const store = usePosStore();
const showPayment = ref(false);
const productToAdd = ref(null);

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value);

const handleProductSelect = (product) => {
  productToAdd.value = product;
};

const openPayment = () => {
  if (!store.cartItems.length) return;
  showPayment.value = true;
};

const confirmAddItem = ({ product, quantity }) => {
  store.addItem(product, quantity);
  productToAdd.value = null;
};

const closeQuantityModal = () => {
  productToAdd.value = null;
};

const handlePayment = async ({ payments, method }) => {
  payments.forEach((payment) => store.addPayment(payment));
  showPayment.value = false;
  const payload = {
    shop_id: 1,
    cash_register_id: 1,
    customer_id: null,
    subtotal: store.subtotal,
    discount_amount: store.discount,
    tax_amount: store.tax,
    total: store.total,
    paid_amount: store.paidAmount,
    balance: store.balance,
    items: store.cartItems,
    payments,
    status: method === 'credit' && store.balance > 0 ? 'completed' : 'completed'
  };
  await store.submitSale(payload);
};

onMounted(() => {
  store.loadProducts();
});
</script>
