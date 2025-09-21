# Jocelyne K — Landing page

Cette application Vite + React propose une landing page pour la boutique de lunettes de soleil Jocelyne K et un formulaire d'inscription à la newsletter connecté à Supabase.

## Prérequis

- Node.js 18+
- Variables d'environnement :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Démarrer le projet

```bash
npm install
npm run dev
```

Le site est disponible sur [http://localhost:5173](http://localhost:5173).

## Tests manuels & mocks

Pour valider les scénarios de succès et d'échec du formulaire sans dépendre du réseau, vous pouvez utiliser le mock fourni :

```ts
import NewsletterForm from './components/NewsletterForm';
import { createSupabaseNewsletterMock } from './lib/mocks/supabaseClientMock';

const failingClient = createSupabaseNewsletterMock({
  error: { message: 'Simulation de coupure réseau' },
});

<NewsletterForm client={failingClient} />;
```

Scénarios conseillés :

1. **Validation client** — Soumettre sans remplir les champs, puis avec un e-mail invalide.
2. **Succès** — Remplir tous les champs et vérifier le message de confirmation.
3. **Erreur réseau** — Injecter le mock en erreur pour afficher le message d'échec et l'état réinitialisable.

## Production

Avant la mise en production, exécutez :

```bash
npm run build
```

Cela génère les fichiers optimisés dans `dist/`.
