<template>
  <div class="p-6 space-y-4">
    <header class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800">Panier</h2>
      <span class="text-sm text-slate-500">{{ items.length }} article(s)</span>
    </header>

    <div v-if="!items.length" class="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-400">
      Ajoutez des produits pour démarrer la vente.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="item in items"
        :key="item.product_id"
        class="rounded-lg border border-slate-200 p-4"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-slate-800">{{ item.name }}</h3>
            <p class="text-xs text-slate-500">SKU : {{ item.sku }}</p>
          </div>
          <button
            type="button"
            class="text-xs text-red-500 hover:text-red-600"
            @click="$emit('remove', item.product_id)"
          >
            Retirer
          </button>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
          <label class="flex flex-col space-y-1">
            <span class="text-slate-500 text-xs uppercase">Quantité</span>
            <input
              type="number"
              min="1"
              class="rounded border border-slate-200 px-2 py-1"
              :value="item.quantity"
              @input="$emit('quantity-change', item.product_id, Number($event.target.value))"
            />
          </label>
          <div class="text-right">
            <p class="text-xs text-slate-500 uppercase">Total</p>
            <p class="text-base font-semibold text-slate-800">{{ currency(item.quantity * item.unit_price) }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

defineEmits(['quantity-change', 'remove']);

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value);
</script>
