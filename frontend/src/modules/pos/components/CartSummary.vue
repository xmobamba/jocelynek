<template>
  <div class="flex h-full flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5">
    <header class="flex items-start justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-800">Panier</h2>
        <p class="text-sm text-slate-500">{{ items.length }} article(s) sélectionné(s)</p>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm"
      >
        Nouveau client
      </button>
    </header>

    <div v-if="!items.length" class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 text-center text-slate-400">
      Ajoutez des produits pour démarrer la vente.
    </div>

    <ul v-else class="flex-1 space-y-3 overflow-y-auto pr-2">
      <li
        v-for="item in items"
        :key="item.product_id"
        class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-slate-800">{{ item.name }}</h3>
            <p class="text-xs uppercase tracking-wide text-slate-400">SKU : {{ item.sku }}</p>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-red-500 transition hover:text-red-600"
            @click="$emit('remove', item.product_id)"
          >
            Retirer
          </button>
        </div>

        <div class="mt-4 flex items-center justify-between gap-4">
          <label class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>Qté</span>
            <input
              type="number"
              min="1"
              class="h-8 w-16 rounded-xl border-none bg-white px-2 text-sm font-semibold text-slate-700 shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
              :value="item.quantity"
              @input="$emit('quantity-change', item.product_id, Number($event.target.value))"
            />
          </label>
          <div class="text-right">
            <p class="text-xs uppercase tracking-wide text-slate-400">Total</p>
            <p class="text-lg font-semibold text-primary">{{ currency(item.quantity * item.unit_price) }}</p>
          </div>
        </div>
      </li>
    </ul>

    <footer class="space-y-4 rounded-2xl bg-slate-900/5 p-4">
      <dl class="space-y-3 text-sm text-slate-600">
        <div class="flex items-center justify-between">
          <dt>Sous-total</dt>
          <dd class="font-semibold text-slate-700">{{ currency(subtotal) }}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt>Remises</dt>
          <dd class="font-semibold text-emerald-600">-{{ currency(discount) }}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt>TVA</dt>
          <dd class="font-semibold text-slate-700">{{ currency(tax) }}</dd>
        </div>
        <div class="flex items-center justify-between text-base">
          <dt class="font-semibold text-slate-800">Total à payer</dt>
          <dd class="text-lg font-bold text-primary">{{ currency(total) }}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300"
        :disabled="!items.length"
        @click="$emit('checkout')"
      >
        Encaisser
      </button>
    </footer>
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

defineEmits(['quantity-change', 'remove', 'checkout']);

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value || 0);
</script>
