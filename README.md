# JOCELYNE K POS SYSTEM

Application de point de vente 100 % hors ligne, pensée pour les boutiques Jocelyne K. Le projet est un tableau de bord moderne en HTML, CSS et JavaScript pur avec stockage des données dans `localStorage`. Toutes les opérations (inventaire, encaissement, gestion des vendeuses, finances et paramètres) se font dans une seule page responsive.

## ✨ Fonctionnalités clés

- **Tableau de bord** : cartes de synthèse, fil d'activité et graphique animé des ventes des 7 derniers jours.
- **Inventaire** : ajout/modification/suppression, import/export CSV/JSON, alertes visuelles de stocks faibles, génération d'étiquettes 15×7 mm avec pseudo-QR code.
- **Ventes (POS)** : recherche rapide, panier interactif, sélection de la vendeuse, paiements espèces/mobile money/crédit, impression de reçu.
- **Vendeuses** : fiches de suivi des collaboratrices, stocks confiés, retours en boutique et historique des ventes réalisées.
- **Finances** : journal recettes/dépenses, synthèse mensuelle, export comptable CSV.
- **Paramètres** : identité de la boutique, devise FCFA (personnalisable), TVA, gestion du logo, export/import complet de la base JSON, remise à zéro.
<<<<<<< HEAD
- **Résumé intelligent** : synthèse automatique dans le dashboard couvrant inventaire, ventes, vendeuses et finances.
=======
- **Assistant IA local** : widget flottant avec réponses contextuelles pré-enregistrées sur les ventes, l'inventaire et la configuration.
>>>>>>> 0b0f04eea0e84e2726d5acc50d55fc930cf9bb85
- **Sécurité des données** : sauvegarde locale à la demande et auto-sauvegarde toutes les 10 minutes.

## 🗂️ Structure du projet

```
/ (racine du dépôt)
├── index.html
├── css/
│   ├── style.css
│   ├── dashboard.css
│   └── print.css
├── js/
│   ├── app.js
│   ├── inventory.js
│   ├── sales.js
│   ├── sellers.js
│   ├── finances.js
│   ├── settings.js
<<<<<<< HEAD
│   └── insights.js
=======
│   └── ai.js
>>>>>>> 0b0f04eea0e84e2726d5acc50d55fc930cf9bb85
├── assets/
│   ├── README.md
│   ├── icons/
│   └── images/
└── data/
    └── backup.json
```

> ℹ️ Les fichiers binaires (ex. PNG) ont été retirés de ce dépôt. Ajoutez vos propres logos ou icônes (format SVG recommandé) dans le dossier `assets/` avant le déploiement.

## 🚀 Démarrage

1. Cloner ou télécharger le dépôt.
2. Ouvrir `index.html` dans un navigateur récent (Chrome, Edge ou Safari).
3. Patienter le temps de l'écran de chargement puis utiliser le menu latéral pour naviguer.
4. Toutes les données sont enregistrées automatiquement dans `localStorage` (aucun backend requis).

## 💾 Sauvegarde et restauration

- Utiliser le bouton **Sauvegarder** du tableau de bord ou l'option **Exporter la base JSON** dans Paramètres pour créer un fichier `jk-backup.json`.
- Pour restaurer, importer le fichier via **Importer une base JSON**.
- Une sauvegarde automatique est également réalisée toutes les 10 minutes et la date de la dernière sauvegarde apparaît dans le pied de page.

## 🎨 Design & accessibilité

- Palette : blanc, orange `#FFA500`, vert `#00A86B` et accents verts/orange pour les états.
- Police : Inter et équivalents système.
- Layout responsive avec menu latéral fixe, transitions douces, badges et notifications accessibles.
- Feuilles de styles dédiées pour l'impression des reçus et étiquettes.

## 📄 Licence

Projet interne Jocelyne K – librement utilisable dans un contexte hors ligne.
