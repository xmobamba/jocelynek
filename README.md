# Gestionnaire de ventes – Jocelyne K

Application web responsive permettant de gérer les ventes, le stock et les avances des boutiques **Jocelyne K** et **Jocelyne K 2**. Le projet fonctionne entièrement hors ligne en utilisant le `localStorage` du navigateur (HTML, CSS et JavaScript).

## ✨ Fonctionnalités principales

- Tableau de bord consolidé (ventes du jour, ventes du mois, stocks critiques, avances)
- Gestion des boutiques, vendeuses, produits, ventes et avances
- Numérotation automatique des ventes (`VENT0001`, `VENT0002`, ...)
- Mise à jour automatique du stock lors des ventes
- Prix unitaires ajustables, saisie d'avances et calcul du reste à payer par vente
- Facture professionnelle imprimable (A4 ou ticket thermique) avec avances et soldes
- Modification, réimpression et export des ventes existantes
- Recherche en temps réel dans les tables
- Export CSV des ventes
- Statistiques visuelles : chiffre d'affaires, top produits, top vendeuses
- Personnalisation des paramètres (devise, seuil de stock, format de reçu, boutique/vendeuse par défaut, identité visuelle et coordonnées)
- Impression d'un rapport de clôture quotidien (totaux, avances, restes à payer) pour la date sélectionnée
- Tableau de bord détaillant stocks actuels et quantités vendues du jour

## 🗂 Structure du projet

```
/gestionnaire-ventes
├── index.html
├── css/
│   ├── style.css
│   └── dashboard.css
├── js/
│   ├── main.js
│   ├── utils.js
│   ├── shops.js
│   ├── sellers.js
│   ├── products.js
│   ├── sales.js
│   ├── advances.js
│   └── stats.js
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## 🚀 Utilisation

1. Télécharger ou cloner le dépôt.
2. Ouvrir `index.html` dans un navigateur récent.
3. Commencer à enregistrer les boutiques, vendeuses, produits et ventes. Toutes les données sont conservées localement.

## 💾 Sauvegarde des données

Les informations sont stockées dans `localStorage` sous la clé `jkManagerData`. Pour remettre l'application à zéro, ouvrir l'onglet **Paramètres** puis cliquer sur **Réinitialiser les données**.

## 🎨 Design

- Palette principale : orange `#FFA500` et vert `#00A86B`
- Police : [Inter](https://fonts.google.com/specimen/Inter)
- Interface moderne, responsive, optimisée pour bureau, tablette et mobile.

## 📄 Licence

Projet conçu pour les boutiques Jocelyne K (Abidjan, Côte d'Ivoire). Usage interne.
