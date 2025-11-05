<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4">
    <div class="w-full max-w-xs rounded-xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-800">Quantité</h2>
      <p class="mt-1 text-sm text-slate-500">Combien d'articles de {{ product.name }} ajouter ?</p>

      <form class="mt-4 space-y-4" @submit.prevent="submit">
        <label class="flex flex-col space-y-1 text-sm">
          <span class="text-slate-500">Quantité</span>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40"
            autofocus
            required
          />
        </label>

        <div class="flex justify-end space-x-3">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-dark">
            Ajouter
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['confirm', 'close']);

const quantity = ref(1);

watch(
  () => props.product,
  () => {
    quantity.value = 1;
  }
);

const submit = () => {
  emit('confirm', { product: props.product, quantity: quantity.value });
};
</script>
