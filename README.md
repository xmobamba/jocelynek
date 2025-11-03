# JOCELYNE K POS SYSTEM

Application de caisse hors ligne construite en HTML, CSS et JavaScript pur. Tout est stocké dans le navigateur via `localStorage`. Le projet est fourni avec un tableau de bord synthétique, la gestion d'inventaire, un module de ventes flexible, le suivi des vendeuses, des finances et un panneau de réglages.

## Structure
```
index.html
css/
  style.css
  dashboard.css
  print.css
js/
  app.js
  inventory.js
  sales.js
  sellers.js
  finances.js
  settings.js
  insights.js
assets/
  README.md
  icons/
data/
  backup.json
```

## Fonctionnalités principales
- Navigation mono-page avec barre latérale et thèmes clair/sombre.
- Résumé intelligent regroupant inventaire, ventes, finances et vendeuses.
- Gestion d'inventaire : création automatique des références, alertes de stock et impression d'étiquettes.
- Module de ventes avec saisie libre des prix, sélection de la date de vente et génération de reçus imprimables.
- Gestion des vendeuses avec consignation de marchandises et suivi des retours.
- Section finances (recettes/dépenses) et export CSV.
- Paramètres : identité de la boutique, devise, TVA, bascule prix manuel et réinitialisation complète.
- Sauvegarde/restauration locale (JSON) et sauvegarde de secours (`data/backup.json`).

## Utilisation
Ouvrez `index.html` dans un navigateur moderne (Chrome, Edge, Safari). Toutes les données sont stockées localement.

Pour repartir d'un état propre, cliquez sur **Réinitialiser les données** dans l'onglet Paramètres ou supprimez l'entrée `jk-pos-state` du `localStorage`.

## Licence
Usage libre.
