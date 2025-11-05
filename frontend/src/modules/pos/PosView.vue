<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-emerald-50">
    <div class="grid min-h-screen lg:grid-cols-[240px_1fr_420px]">
      <PosNavigation />

      <main class="flex flex-col">
        <header class="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Boutique Cocovico</p>
              <h1 class="text-2xl font-semibold text-slate-800">Caisse rapide</h1>
            </div>
            <div class="flex items-center gap-3">
              <div class="rounded-2xl bg-white px-4 py-2 text-right shadow">
                <p class="text-xs text-slate-400">Total du jour</p>
                <p class="text-lg font-semibold text-primary">{{ currency(store.total) }}</p>
              </div>
              <div class="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">IK</span>
                <div>
                  <p>Inès Kouadio</p>
                  <p class="text-xs text-primary/70">Caissière</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-[240px]">
              <svg
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 3.5a5.5 5.5 0 013.866 9.39l3.122 3.122a.75.75 0 11-1.06 1.06l-3.122-3.121A5.5 5.5 0 119 3.5zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                v-model="search"
                type="search"
                class="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Rechercher un produit (nom, SKU, code-barres)"
              />
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-primary hover:text-white"
                @click="store.loadProducts()"
              >
                Rafraîchir
              </button>
              <button
                type="button"
                class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg hover:bg-primary-dark"
              >
                Nouvelle vente
              </button>
            </div>
          </div>
        </header>

        <div class="flex flex-1 flex-col overflow-hidden">
          <div class="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3 text-sm text-slate-500 xl:hidden">
            <span class="font-semibold">Catégories :</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in store.categories"
                :key="category.id"
                type="button"
                class="rounded-full px-4 py-1 text-xs font-semibold transition"
                :class="store.activeCategory === category.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'"
                @click="store.setActiveCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </div>
          </div>

          <div class="flex flex-1 overflow-hidden">
            <CategoryList
              :categories="store.categories"
              :active="store.activeCategory"
              @select="store.setActiveCategory"
            />
            <section class="flex-1 overflow-y-auto px-6 py-8">
              <ProductGrid
                :products="store.filteredProducts"
                :is-loading="store.isLoading"
                :search="store.searchTerm"
                @select="handleProductSelect"
                @search="handleSearch"
              />
            </section>
          </div>
        </div>
      </main>

      <aside class="hidden lg:flex lg:flex-col lg:gap-6 lg:bg-slate-50 lg:px-6 lg:py-8">
        <div class="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg">
          <p class="text-xs uppercase tracking-widest text-white/70">Encaissement</p>
          <p class="mt-2 text-3xl font-semibold">{{ currency(store.total) }}</p>
          <p class="mt-2 text-sm text-white/80">Solde client : {{ currency(store.balance) }}</p>
          <button
            type="button"
            class="mt-6 w-full rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            @click="openPayment"
          >
            Ajouter un paiement
          </button>
        </div>
        <CartSummary
          :items="store.cartItems"
          :subtotal="store.subtotal"
          :tax="store.tax"
          :discount="store.discount"
          :total="store.total"
          @quantity-change="store.updateQuantity"
          @remove="store.removeItem"
          @checkout="openPayment"
        />
      </aside>
    </div>

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
import { ref, onMounted, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { usePosStore } from '../../stores/pos.js';
import CartSummary from './components/CartSummary.vue';
import PaymentModal from './components/PaymentModal.vue';
import QuantitySelectorModal from './components/QuantitySelectorModal.vue';
import ProductGrid from './components/ProductGrid.vue';
import CategoryList from './components/CategoryList.vue';
import PosNavigation from './components/PosNavigation.vue';

const store = usePosStore();
const showPayment = ref(false);
const productToAdd = ref(null);
const search = ref(store.searchTerm);

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value || 0);

const debouncedSearch = useDebounceFn((value) => {
  store.setSearchTerm(value);
  store.loadProducts(value);
}, 250);

watch(search, (value) => {
  debouncedSearch(value);
});

watch(
  () => store.searchTerm,
  (value) => {
    if (value !== search.value) {
      search.value = value;
    }
  }
);

const handleProductSelect = (product) => {
  productToAdd.value = product;
};

const handleSearch = (value) => {
  search.value = value;
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
