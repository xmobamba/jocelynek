const highlights = [
  {
    label: 'Edition limitée',
    description: 'Pièces artisanales en petites séries, disponibles en exclusivité chez Jocelyne K.',
  },
  {
    label: 'Qualité couture',
    description: 'Cuir pleine fleur, métaux hypoallergéniques et finitions certifiées premium.',
  },
  {
    label: 'Livraison express',
    description: 'Retrait boutique en 2h ou livraison sécurisée partout à Abidjan sous 24h.',
  },
];

const features = [
  {
    title: 'Design modulable',
    description:
      'Transformez le sac en pochette ou en bandoulière grâce aux chaînes interchangeables dorées ou gunmetal.',
  },
  {
    title: 'Compartiments intelligents',
    description: 'Poches RFID, emplacement smartphone XL et étui rigide pour lunettes de soleil.',
  },
  {
    title: 'Toucher luxueux',
    description: 'Cuir texturé italien, doublure en microsuède champagne et couture sellier contrastée.',
  },
  {
    title: 'Résistance quotidienne',
    description: 'Traitement anti-rayures et protection hydrofuge invisible pour rester impeccable longtemps.',
  },
];

const specs = [
  { label: 'Dimensions', value: '24 cm x 15 cm x 6 cm' },
  { label: 'Poids', value: '420 g' },
  { label: 'Matières', value: 'Cuir de veau italien, chaîne en acier inoxydable' },
  { label: 'Coloris', value: 'Noir Onyx, Bleu Minuit, Beige Sable' },
  { label: 'Garantie', value: '12 mois – retouches offertes' },
];

const lookbook = [
  'Duo sac & ceinture dans une ambiance soirée rooftop avec skyline en arrière-plan.',
  'Bracelet manchette posé sur une coupe de champagne et velours bleu nuit.',
  'Portrait studio : modèle féminine portant chapeau en feutre et sac bandoulière Saphir.',
  'Mise à plat éditoriale : gants en cuir, lunettes rétro, montre dorée, parfum et sac Signature.',
];

const faqs = [
  {
    question: 'Comment choisir la bonne longueur de bandoulière ?',
    answer:
      'Nos conseillères vous assistent via WhatsApp avec des photos portées. Chaque accessoire est livré avec deux chaînes ajustables (90 cm et 110 cm).',
  },
  {
    question: 'Puis-je réserver un article avant de me déplacer ?',
    answer:
      'Oui. Envoyez-nous un message, nous bloquons votre pièce 48h et organisons un essayage privé en boutique.',
  },
  {
    question: 'Proposez-vous des idées cadeaux ?',
    answer:
      'Nous préparons un coffret personnalisé avec rubans, carte manuscrite et livraison discrète le jour souhaité.',
  },
];

const App = () => {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__badge">Nouvelle capsule 2025</div>
        <div className="hero__layout">
          <div className="hero__content">
            <h1 className="hero__title">Accessoires signature Jocelyne K</h1>
            <p className="hero__subtitle">
              Sacs, ceintures et bijoux dessinés à Abidjan pour les femmes qui cultivent une allure magnétique.
              Notre pièce phare, le sac bandoulière Saphir, concentre tout le savoir-faire de la maison.
            </p>
            <div className="hero__price-card">
              <div>
                <p className="hero__price">À partir de 58 000 FCFA</p>
                <p className="hero__stock">Disponibilité immédiate — Quantités limitées par coloris.</p>
              </div>
              <a
                className="button button--primary"
                href="https://wa.me/225779212054"
                target="_blank"
                rel="noreferrer"
              >
                Commander sur WhatsApp
              </a>
            </div>
            <ul className="hero__highlights">
              {highlights.map((item) => (
                <li key={item.label}>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
            <p className="hero__contact">
              Service client premium :
              <a href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
                0779212054
              </a>
              · Réponse en moins de 10 minutes.
            </p>
          </div>
          <aside className="hero__product-card" aria-label="Présentation du sac Saphir">
            <div className="hero__product-visual">
              <div className="hero__product-glow" />
              <p className="hero__product-caption">Sac bandoulière Saphir — Bleu Minuit</p>
            </div>
            <ul className="hero__product-infos">
              <li>Bandoulière ajustable &amp; interchangeable</li>
              <li>Signature Jocelyne K gravée</li>
              <li>Pochette intérieure amovible</li>
            </ul>
            <a className="button button--ghost" href="#boutique">
              Visiter la boutique
            </a>
          </aside>
        </div>
      </header>

      <main>
        <section className="section section--features">
          <div className="section__header">
            <h2>Pourquoi vous allez l’adorer</h2>
            <p>Chaque détail a été pensé pour sublimer vos tenues du matin jusqu’aux soirées les plus élégantes.</p>
          </div>
          <div className="features__grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--specs" aria-labelledby="caracteristiques-techniques">
          <div className="section__header">
            <h2 id="caracteristiques-techniques">Caractéristiques et finitions</h2>
            <p>Le luxe quotidien dans une silhouette compacte mais généreuse en rangements.</p>
          </div>
          <div className="specs__layout">
            <ul className="specs__list">
              {specs.map((spec) => (
                <li key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </li>
              ))}
            </ul>
            <div className="specs__story">
              <h3>Fabriqué avec passion</h3>
              <p>
                Chaque sac est assemblé à la main dans notre atelier d’Angré. Nous sélectionnons un cuir pleine fleur
                durable puis le sublimons avec des pigments exclusifs. La doublure en microsuède protège vos essentiels
                et offre une sensation douce à chaque ouverture.
              </p>
              <p>
                Les métalleries sont polies une à une pour refléter la lumière sans ternir. Avant la mise en vente, nous
                effectuons 17 contrôles qualité afin de garantir une pièce irréprochable.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--lookbook">
          <div className="section__header">
            <h2>Ambiances à capturer</h2>
            <p>Utilisez ces idées de visuels pour votre communication ou vos shootings.</p>
          </div>
          <ul className="lookbook__ideas">
            {lookbook.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </section>

        <section className="section section--testimonial">
          <div className="testimonial__card">
            <p>
              « J’ai reçu tant de compliments sur le sac Saphir. La texture est incroyable et je passe du bureau au dîner
              sans changer d’accessoire. »
            </p>
            <span>— Vanessa, consultante à Abidjan</span>
          </div>
          <div className="testimonial__card testimonial__card--secondary">
            <p>
              « Service cinq étoiles : réservation par WhatsApp, essayage privé et coffret cadeau prêt à offrir. Une
              expérience digne des grandes maisons. »
            </p>
            <span>— Diane, fidèle cliente Jocelyne K</span>
          </div>
        </section>

        <section className="section section--faq" aria-labelledby="faq">
          <div className="section__header">
            <h2 id="faq">Questions fréquentes</h2>
            <p>Nous restons disponibles pour toute information complémentaire via WhatsApp.</p>
          </div>
          <div className="faq__list">
            {faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="boutique" className="section section--boutique">
          <div className="boutique__card">
            <h2>Essayez vos accessoires préférés</h2>
            <p>
              Rendez-vous à la boutique Jocelyne K au Marché Cocovico, Abidjan. Essayage privé, conseils style et
              personnalisation sur place.
            </p>
            <ul>
              <li>Mardi — Dimanche : 9h à 20h</li>
              <li>Réglages de bandoulière et perforation de ceinture offerts</li>
              <li>Parking sécurisé et espace lounge</li>
            </ul>
            <a className="button button--primary" href="https://wa.me/225779212054" target="_blank" rel="noreferrer">
              Réserver un essayage
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Jocelyne K — Accessoires de mode premium. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default App;
