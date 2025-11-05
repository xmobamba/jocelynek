<template>
  <div class="border-b border-slate-200 p-6">
    <div class="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
      <div class="relative flex-1">
        <input
          v-model="term"
          type="search"
          class="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/50"
          placeholder="Rechercher un produit (nom, SKU, code-barres)"
          @input="handleSearch"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 013.866 9.39l3.122 3.122a.75.75 0 11-1.06 1.06l-3.122-3.121A5.5 5.5 0 119 3.5zm0 1.5a4 4 0 100 8 4 4 0 000-8z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
        @click="refresh"
      >
        Rafraîchir
      </button>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="product in store.products"
        :key="product.id"
        type="button"
        class="rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-primary hover:shadow transition"
        @click="$emit('select', product)"
      >
        <h3 class="font-semibold text-slate-800">{{ product.name }}</h3>
        <p class="text-xs text-slate-500">SKU : {{ product.sku }}</p>
        <p class="mt-2 text-sm font-medium text-primary">{{ currency(product.sale_price) }}</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { usePosStore } from '../../../stores/pos.js';

defineEmits(['select']);

const store = usePosStore();
const term = ref('');

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value);

const search = useDebounceFn((value) => {
  store.loadProducts(value);
}, 300);

const handleSearch = () => {
  search(term.value);
};

const refresh = () => {
  term.value = '';
  store.loadProducts();
};
</script>
