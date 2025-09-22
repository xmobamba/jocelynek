const brands = [
  {
    name: 'Gucci',
    description:
      'Sandales à brides sculpturales, signatures dorées et cuirs souples pour une allure affirmée du bureau au resort.',
  },
  {
    name: 'Dior',
    description:
      'Lignes épurées, finitions cousues main et confort haute couture pour les silhouettes les plus exigeantes.',
  },
  {
    name: 'Prada',
    description:
      'Minimalisme italien, matériaux techniques et palette ultra-raffinée pour les citadins visionnaires.',
  },
  {
    name: 'Versace',
    description:
      'Détails baroques, embossages iconiques et présence magnétique pour captiver chaque regard.',
  },
];

const reasons = [
  {
    title: 'Authenticité certifiée',
    description:
      'Chaque paire provient directement des circuits officiels des maisons de luxe. Provenance tracée, boîtes scellées.',
  },
  {
    title: 'Prix stratégiques',
    description: 'Le prestige des grandes marques dès 25 000 FCFA. Vous investissez dans le style, pas dans la majoration.',
  },
  {
    title: 'Style prêt à porter',
    description:
      'Modèles disponibles immédiatement pour vos rendez-vous décisifs, du boardroom au rooftop.',
  },
  {
    title: 'Service personnel',
    description:
      'Conseils de taille, réservation en direct via WhatsApp et retrait express à la boutique Jocelyne K.',
  },
];

const visualSuggestions = [
  'Ambiance lounge masculine avec fauteuil club en cuir et lumière dorée.',
  'Plan rapproché sur les logos embossés et les coutures main d’un modèle Gucci.',
  'Silhouette urbaine marchant sur un rooftop au coucher du soleil, sandales Prada en évidence.',
  'Moodboard matières : cuir grainé, métal poli, textures sable et pierre brute.',
];

const App = () => {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <span className="hero__badge">Collection capsule été</span>
          <h1 className="hero__title">Sandales signature pour hommes d’exception</h1>
          <p className="hero__subtitle">
            Sublimez chaque pas avec une sélection exclusive Gucci, Dior, Prada et plus encore. Pensée pour
            l’homme qui maîtrise son allure et exige l’excellence à prix maîtrisé.
          </p>
          <div className="hero__meta">
            <p className="hero__price">
              Prestige immédiat dès <strong>25 000 FCFA</strong>
            </p>
            <p className="hero__note">Disponibles en quantités ultra-limités au Marché Cocovico.</p>
          </div>
          <div className="hero__cta-group">
            <a className="button button--primary" href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
              Commander sur WhatsApp
            </a>
            <a className="button button--ghost" href="#boutique">
              Visiter la boutique
            </a>
          </div>
          <p className="hero__contact">
            WhatsApp direct :
            <a href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
              0779212054
            </a>
          </p>
        </div>
        <div className="hero__visual" aria-hidden>
          <div className="hero__visual-shape" />
          <p className="hero__visual-caption">Gucci • Dior • Prada • Versace</p>
        </div>
      </header>

      <main>
        <section className="section section--brands">
          <div className="section__header">
            <h2 className="section__title">Nos marques</h2>
            <p className="section__subtitle">Une curation serrée des maisons iconiques de la mode masculine.</p>
          </div>
          <ul className="brands__list">
            {brands.map((brand) => (
              <li key={brand.name} className="brands__item">
                <h3 className="brands__name">{brand.name}</h3>
                <p className="brands__description">{brand.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="section section--reasons" aria-labelledby="pourquoi-jocelyne-k">
          <div className="section__header">
            <h2 id="pourquoi-jocelyne-k" className="section__title">
              Pourquoi choisir Jocelyne K ?
            </h2>
            <p className="section__subtitle">
              Votre partenaire style pour dénicher les pièces de marque les plus désirées, sans compromis.
            </p>
          </div>
          <div className="reasons__grid">
            {reasons.map((reason) => (
              <article key={reason.title} className="reason">
                <h3 className="reason__title">{reason.title}</h3>
                <p className="reason__description">{reason.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--visuals">
          <div className="section__header">
            <h2 className="section__title">Visuels suggérés</h2>
            <p className="section__subtitle">
              Inspirez vos shootings et votre communication avec ces mises en scène haut de gamme.
            </p>
          </div>
          <ul className="visuals__list">
            {visualSuggestions.map((suggestion) => (
              <li key={suggestion} className="visuals__item">
                {suggestion}
              </li>
            ))}
          </ul>
        </section>

        <section className="section section--testimonial">
          <div className="testimonial__card">
            <p className="testimonial__quote">
              “Qualité irréprochable et service rapide. Je porte mes sandales Dior tous les week-ends et je
              reçois compliments sur compliments.”
            </p>
            <p className="testimonial__author">— Marc, entrepreneur à Abidjan</p>
          </div>
        </section>

        <section id="boutique" className="section section--contact">
          <div className="contact__card">
            <h2 className="contact__title">Votre adresse style à Abidjan</h2>
            <p className="contact__description">
              Essayez, comparez et repartez avec votre paire signature le jour même. Notre équipe vous accompagne
              pour choisir la taille idéale et les finitions adaptées à votre garde-robe.
            </p>
            <address className="contact__address">
              <span className="contact__label">Boutique Jocelyne K</span>
              Marché Cocovico — Abidjan, Côte d’Ivoire
            </address>
            <p className="contact__hours">Ouvert du mardi au dimanche, 9h - 20h.</p>
            <p className="contact__whatsapp">
              Réservez votre essayage :
              <a href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
                0779212054
              </a>
            </p>
          </div>
        </section>

        <section className="section section--final-cta">
          <div className="final-cta__card">
            <h2 className="final-cta__title">Prêt à posséder la sandale de vos rêves ?</h2>
            <p className="final-cta__description">
              Les quantités fondent rapidement. Cliquez, échangez avec nous sur WhatsApp et verrouillez votre paire
              avant qu’elle ne disparaisse.
            </p>
            <a className="button button--primary" href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
              Commander sur WhatsApp
            </a>
            <p className="final-cta__note">Whatsapp 0779212054 • Réponse en moins de 10 minutes.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer__text">© {new Date().getFullYear()} Jocelyne K — Accessoires de mode pour hommes.</p>
      </footer>
    </div>
  );
};

export default App;
