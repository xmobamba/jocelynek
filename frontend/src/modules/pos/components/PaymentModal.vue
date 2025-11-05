<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
    <div class="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">Encaissement</h2>
        <button type="button" class="text-slate-400 hover:text-slate-600" @click="$emit('close')">&times;</button>
      </div>

      <form class="space-y-5 px-6 py-4" @submit.prevent="submit">
        <div>
          <p class="text-sm text-slate-500">Total à payer</p>
          <p class="text-2xl font-semibold text-slate-900">{{ currency(total) }}</p>
          <p class="text-xs text-slate-400">Restant : {{ currency(balance) }}</p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="flex flex-col space-y-1 text-sm">
            <span class="text-slate-500">Méthode</span>
            <select v-model="state.method" class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40">
              <option value="cash">Espèces</option>
              <option value="card">Carte bancaire</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="credit">Crédit client</option>
            </select>
          </label>

          <label class="flex flex-col space-y-1 text-sm" v-if="state.method === 'mobile_money'">
            <span class="text-slate-500">Opérateur</span>
            <select v-model="state.provider" class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40">
              <option value="orange_money">Orange Money</option>
              <option value="mtn_money">MTN Money</option>
              <option value="moov_money">Moov Money</option>
              <option value="wave">Wave</option>
            </select>
          </label>

          <label class="flex flex-col space-y-1 text-sm" v-else>
            <span class="text-slate-500">Opérateur</span>
            <input v-model="state.provider" type="text" class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40" placeholder="Visa, Mastercard, ..." />
          </label>

          <label class="flex flex-col space-y-1 text-sm">
            <span class="text-slate-500">Montant encaissé</span>
            <input v-model.number="state.amount" type="number" min="0" step="0.01" class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40" required />
          </label>
        </div>

        <label class="flex flex-col space-y-1 text-sm">
          <span class="text-slate-500">Référence transaction</span>
          <input v-model="state.reference" type="text" class="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-primary/40" placeholder="ID transaction" />
        </label>

        <div class="flex justify-end space-x-3">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-dark">
            Valider
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  total: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }
});

const emit = defineEmits(['close', 'submit']);

const state = reactive({
  method: 'cash',
  provider: 'caisse',
  amount: props.balance > 0 ? props.balance : props.total,
  reference: ''
});

const submit = () => {
  const payment = {
    method: state.method,
    provider: state.provider,
    amount: state.amount,
    transaction_reference: state.reference
  };
  emit('submit', { payments: [payment], method: state.method });
};

const currency = (value) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF'
}).format(value);
</script>
