<template>
  <aside class="hidden lg:flex lg:flex-col lg:bg-primary lg:text-white lg:py-8 lg:px-6 lg:space-y-10">
    <div>
      <div class="flex items-center space-x-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">JK</span>
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-white/80">Jocelyne K</p>
          <p class="text-base font-semibold">POS Manager</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-8 text-sm">
      <div>
        <p class="text-xs uppercase tracking-widest text-white/40 mb-3">Principal</p>
        <ul class="space-y-2">
          <li><a href="#" class="nav-link">Tableau de bord</a></li>
          <li><a href="#" class="nav-link">Caisse rapide</a></li>
          <li><a href="#" class="nav-link">Gestion des ventes</a></li>
          <li><a href="#" class="nav-link">Clients</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-white/40 mb-3">Inventaire</p>
        <ul class="space-y-2">
          <li><a href="#" class="nav-link">Produits</a></li>
          <li><a href="#" class="nav-link">Catégories</a></li>
          <li><a href="#" class="nav-link">Stocks</a></li>
          <li><a href="#" class="nav-link">Transferts</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-white/40 mb-3">Administration</p>
        <ul class="space-y-2">
          <li><a href="#" class="nav-link">Rapports</a></li>
          <li><a href="#" class="nav-link">Utilisateurs</a></li>
          <li><a href="#" class="nav-link">Paramètres</a></li>
        </ul>
      </div>
    </nav>

    <div class="rounded-2xl bg-white/10 p-4">
      <p class="text-xs text-white/60">Boutiques connectées</p>
      <p class="text-base font-semibold">Cocovico & Djorobité</p>
    </div>
  </aside>
</template>

<style scoped>
.nav-link {
  @apply flex items-center justify-between rounded-xl px-4 py-2 font-semibold text-white/80 transition hover:bg-white/10 hover:text-white;
}
</style>
