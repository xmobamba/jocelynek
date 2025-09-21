# Boutique Jocelyne K – Landing page Vite + React + Tailwind CSS

Cette version du projet met l&apos;accent sur une direction artistique premium (doré/sable/noir) avec des espacements adaptés aux sections et une typographie haut de gamme.

## Palette & thèmes Tailwind

Le fichier [`tailwind.config.js`](./tailwind.config.js) étend `theme.extend` avec :

- Une palette complète `gold`, `sand` et `charcoal` pour couvrir les besoins de contraste (CTA, fonds de cartes, textes).
- Des familles de polices premium (`fontFamily.sans = "Manrope"`, `fontFamily.display/signature = "Cormorant Garamond"`).
- Des espacements dédiés aux sections (`py-section`, `py-section-sm`, `py-section-lg`) pour garantir une respiration cohérente entre les blocs.
- Deux dégradés réutilisables (`bg-luxury-linear`, `bg-luxury-radial`) pour enrichir les arrière-plans.

## Styles globaux & classes clés

La feuille [`src/styles/global.css`](./src/styles/global.css) importe Tailwind et ajoute les styles suivants pour assurer la cohérence visuelle :

| Classe utilitaire | Rôle principal |
| --- | --- |
| `.container-premium` | Largeur de lecture contrôlée avec marges latérales adaptées (`max-w-6xl`). |
| `.section-shell` | Bloc principal des sections : fond translucide, bordure sable, `p-section` et `backdrop-blur` pour l&apos;effet verrier. |
| `.btn-primary` | CTA doré avec gradient, états `hover`/`focus-visible`, variations `md:`/`lg:` sur le padding et la typo. |
| `.btn-secondary` | Bouton secondaire en verre dépoli (bordure charbon, hover doré, focus contrasté). |
| `.card-luxe` + `.card-accent` | Carte produit/expérience avec effets `hover`/`focus-within` et accent lumineux. |
| `.badge-premium`, `.eyebrow` | Hiérarchie textuelle (accroches / badges). |
| `.shadow-luxe`, `.shadow-luxe-strong`, `.shadow-amber` | Ombres personnalisées pour CTA et cartes. |
| `.text-gradient-luxe` | Titre avec gradient doré. |
| `.bg-noise` | Texture subtile ajoutée sur certaines sections.

## Structure des composants

- `Hero` : présente la collection avec CTA primaire et secondaire (`hover`/`focus` + responsive `sm`/`md`/`lg`).
- `ProductShowcase` : grilles de cartes produits (`card-luxe`, boutons `btn-primary`/`btn-secondary`).
- `Experience` : détails des services premium avec boutons secondaires responsive.
- `CallToAction` : formulaire d&apos;inscription au club privé (CTA primaire + input stylisé).
- `Footer` : liens récurrents avec survol doré.

L&apos;entrée [`src/main.tsx`](./src/main.tsx) importe `src/styles/global.css` afin que toutes les pages bénéficient de ces styles dès le rendu initial.

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur de développement Vite est accessible sur `http://localhost:5173`.
