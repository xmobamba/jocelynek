<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white font-bold">JK</span>
          <div>
            <h1 class="text-xl font-semibold text-slate-800">POS Jocelyne K</h1>
            <p class="text-sm text-slate-500">Cocovico &amp; Djorobité</p>
          </div>
        </div>
        <nav class="hidden md:flex space-x-4 text-sm">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 rounded-md font-medium"
            :class="isActive(link.to) ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const links = [
  { to: '/pos', label: 'Caisse' },
  { to: '/products', label: 'Produits' },
  { to: '/stock', label: 'Stocks' },
  { to: '/customers', label: 'Clients' },
  { to: '/reports', label: 'Rapports' },
  { to: '/users', label: 'Utilisateurs' }
];

const isActive = (path) => route.path.startsWith(path);
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
}
</style>
