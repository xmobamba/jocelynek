const products = [
  {
    name: 'Capri Solstice',
    description:
      'Acétate italien poli main, branches plaquées or rose 18K, verres dégradés sable lumineux.',
    price: '420€',
    badge: 'Édition limitée',
  },
  {
    name: 'Monaco Horizon',
    description:
      'Monture titane ultra-légère, cerclage noir laqué, traitement antireflet premium double-face.',
    price: '510€',
    badge: 'Best-seller',
  },
  {
    name: 'Saint-Tropez Dawn',
    description:
      'Forme papillon, placage palladium, dégradé rose doré, signature Jocelyne K gravée.',
    price: '465€',
    badge: 'Nouveauté',
  },
];

const ProductShowcase = () => (
  <section id="collection" className="py-section">
    <div className="container-premium">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Collection Maison</span>
          <h2 className="text-4xl text-charcoal-900 md:text-5xl">Des pièces sculptées pour capter la lumière</h2>
          <p className="mt-6 text-lg text-sand-900/80">
            Chaque monture est assemblée par nos artisans lunetiers en France, en séries limitées. Des
            détails dorés travaillés à la feuille et des finitions polies à la main garantissent un rendu
            éclatant.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.name} className="card-luxe group focus-within:outline-none">
              <span className="card-accent" aria-hidden="true" />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-sand-500">
                <span>{product.badge}</span>
                <span>{product.price}</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-charcoal-900 md:text-3xl">{product.name}</h3>
                <p className="mt-4 text-sm text-sand-800/90 md:text-base">{product.description}</p>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <a
                  href="#cta"
                  className="btn-secondary hover:bg-gold-50/60 focus-visible:bg-gold-50/80 focus-visible:text-gold-600"
                >
                  Détails
                </a>
                <button
                  type="button"
                  className="btn-primary px-6 py-2 text-xs uppercase hover:scale-[1.02] focus-visible:scale-[1.02] md:px-7"
                >
                  Ajouter au panier
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProductShowcase;
