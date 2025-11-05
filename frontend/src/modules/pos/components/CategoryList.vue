<template>
  <aside class="hidden xl:flex xl:w-64 xl:flex-col xl:border-r xl:border-slate-200 xl:bg-white">
    <div class="px-6 pt-6 pb-4">
      <h2 class="text-sm font-semibold text-slate-700">Catégories</h2>
      <p class="text-xs text-slate-400">Filtrez rapidement les familles de produits</p>
    </div>
    <ul class="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
      <li v-for="category in categories" :key="category.id">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition"
          :class="active === category.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'"
          @click="$emit('select', category.id)"
        >
          <span>{{ category.name }}</span>
          <span class="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">
            {{ category.count }}
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  active: { type: String, default: 'all' }
});

defineEmits(['select']);
</script>
