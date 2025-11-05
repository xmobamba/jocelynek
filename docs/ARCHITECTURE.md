# Architecture du Système POS Jocelyne K

## Vue d'ensemble
Le système de point de vente (POS) vise à couvrir deux boutiques physiques, Cocovico et Djorobité, en offrant une plateforme web responsive et utilisable hors ligne. La solution est organisée autour d'une architecture modulaire composée d'un frontend Vue 3 (PWA), d'une API RESTful sécurisée en Node.js/Express et d'une base de données MySQL 8.

### Principes clés
- **Multi-boutiques** : toutes les données métier sont contextualisées par boutique (`shop_id`).
- **Séparation des responsabilités** : frontend, API et base de données indépendants avec contrats d'API documentés.
- **Sécurité** : authentification JWT, validation forte des données, chiffrage des mots de passe, contrôle d'accès basé sur les rôles.
- **Résilience** : PWA avec cache offline et file d'attente des opérations; synchronisation automatique lorsque la connexion est restaurée.
- **Scalabilité** : services métier organisés en couches (contrôleurs → services → dépôts) et orchestrés par un bus d'évènements interne pour les tâches asynchrones (ex : notifications d'alerte stock).

## Frontend
- **Framework** : Vue 3 + Vite, Composition API, Pinia pour l'état global, Vue Router pour la navigation.
- **UI** : Tailwind CSS + composants maison pour la cohérence.
- **PWA** : service worker (Workbox) pour la mise en cache des assets critiques et file d'attente offline des requêtes.
- **Structure** :
  - `src/main.js` : bootstrap de l'application.
  - `src/App.vue` : layout global.
  - `src/router` : routes modulaires (POS, Produits, Stocks, Clients, Rapports, Utilisateurs).
  - `src/stores` : stores Pinia par domaine (ex : `usePosStore`, `useProductStore`).
  - `src/modules/pos` : composants du module caisse (vue principale, modals paiement, etc.).
  - `src/components` : composants génériques (boutons, formulaires, table).
  - `src/services/api.js` : client HTTP (Axios) avec interception JWT et gestion offline.

## Backend
- **Runtime** : Node.js 18+, Express 4, ORM Knex.js pour MySQL, bibliothèques standard (helmet, cors, compression).
- **Structure** :
  - `src/server.js` : point d'entrée du serveur HTTP.
  - `src/app.js` : configuration d'Express (middlewares, routes).
  - `src/config` : configuration de la base de données et des variables d'environnement.
  - `src/middlewares` : middlewares d'authentification, d'autorisation et de validation.
  - `src/routes` : définition des routes REST par module.
  - `src/controllers` : logique HTTP (conversion requête ↔ réponse).
  - `src/services` : logique métier et transactions.
  - `src/repositories` *(à ajouter ultérieurement)* : accès bas niveau à la base via Knex.
  - `src/utils` : utilitaires (gestion JWT, pagination, erreurs personnalisées, envoi e-mail/SMS ultérieur).
- **Sécurité** : JWT signés, politique CORS restrictive, mot de passe hashé (bcrypt), validation `express-validator`.
- **Tâches asynchrones** : bullmq/Redis pour jobs (export, synchronisation) — prévu dans roadmap.

## Base de données
- **MySQL 8** : tables normalisées pour stocker les utilisateurs, boutiques, produits, clients, ventes, paiements et stocks.
- **Gestion des stocks** : table `stock_movements` auditant chaque variation (achat, vente, transfert, inventaire). Les stocks par boutique sont matérialisés dans `stock` et recalculés via triggers.
- **Traçabilité** : colonnes `created_by`, `updated_by` sur les tables principales pour suivre les actions des utilisateurs.

## Synchronisation hors ligne
- **Frontend** : file d'attente locale (IndexedDB) pour les opérations critiques (ventes, paiements, mouvements de stock). Service worker synchronise via `Background Sync`.
- **Backend** : endpoints `/sync` acceptent lots d'opérations, identifiées via UUID client, avec idempotence.

## Déploiement
- **Environnements** : développement, staging, production.
- **CI/CD** : pipeline (GitHub Actions) pour lint/test/build, déploiement sur serveur Ubuntu (Nginx + PM2 + MySQL géré).
- **Monitoring** : logs structurés (Pino) et intégration Sentry.

## Roadmap
1. Mise en place des fondations (base de données, API authentification, POS minimal).
2. Intégration PWA et workflows offline.
3. Ajout progressif des modules (Stocks, Clients, Rapports, Utilisateurs) avec tests automatisés.
4. Internationalisation (français, anglais) et optimisation performance.
