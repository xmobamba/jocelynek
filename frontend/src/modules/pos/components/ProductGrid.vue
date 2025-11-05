<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">Gestion des produits</h2>
          <p class="text-sm text-slate-500">Sélectionnez un article pour l'ajouter rapidement au panier.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-primary">+</span>
          Nouveau produit
        </button>
      </div>

      <div class="relative">
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
          v-model="localTerm"
          type="search"
          class="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="Rechercher un produit (nom, SKU, code-barres)"
        />
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="index in 6" :key="index" class="animate-pulse rounded-3xl bg-white/60 p-6 shadow-inner">
        <div class="mb-4 h-32 rounded-2xl bg-slate-200" />
        <div class="h-4 w-2/3 rounded bg-slate-200" />
        <div class="mt-2 h-3 w-1/2 rounded bg-slate-200" />
      </div>
    </div>

    <div v-else-if="!products.length" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 py-16 text-center shadow-sm">
      <p class="text-base font-semibold text-slate-600">Aucun produit trouvé</p>
      <p class="mt-2 max-w-sm text-sm text-slate-400">Ajustez la recherche ou sélectionnez une autre catégorie pour afficher des articles.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="product in products"
        :key="product.id"
        type="button"
        class="group relative flex flex-col gap-4 rounded-3xl border border-transparent bg-white/70 p-6 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
        @click="$emit('select', product)"
      >
        <div class="flex items-start justify-between">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {{ initials(product.name) }}
          </div>
          <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary/80">{{ product.category_name || 'Non classé' }}</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-800 group-hover:text-primary">{{ product.name }}</h3>
          <p class="text-xs uppercase tracking-wide text-slate-400">SKU : {{ product.sku || 'N/A' }}</p>
        </div>
        <div class="mt-auto flex items-center justify-between">
          <p class="text-sm text-slate-400">{{ stockLabel(product) }} en stock</p>
          <p class="text-lg font-bold text-primary">{{ currency(product.sale_price) }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  products: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  search: { type: String, default: '' }
});

const emit = defineEmits(['select', 'search']);

const localTerm = ref(props.search);

watch(
  () => props.search,
  (value) => {
    if (value !== localTerm.value) {
      localTerm.value = value;
    }
  }
);

const debouncedSearch = useDebounceFn((value) => {
  emit('search', value);
}, 250);

watch(localTerm, (value) => {
  debouncedSearch(value);
});

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value || 0);

const initials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const stockLabel = (product) => {
  const quantity = product.stock_quantity;
  if (quantity === null || quantity === undefined || Number.isNaN(Number(quantity))) {
    return '—';
  }
  return quantity;
};
</script>
