import NewsletterForm from './components/NewsletterForm';

const App = () => {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Jocelyne K — Lunettes de soleil d'exception</p>
          <h1 className="hero__title">
            Brillez tout l'été avec un regard protégé et des montures iconiques
          </h1>
          <p className="hero__subtitle">
            Découvrez nos collections limitées inspirées de la Riviera et conçues en France avec des
            matériaux écoresponsables. Livraison express, garantie anti-rayures, et un style inimitable
            pour vos journées les plus lumineuses.
          </p>
          <a className="hero__cta" href="#newsletter">
            Voir les nouveautés
          </a>
        </div>
        <div className="hero__visual" aria-hidden>
          <div className="hero__badge">UV 400</div>
        </div>
      </header>

      <main>
        <section id="newsletter" className="cta">
          <div className="cta__content">
            <h2 className="cta__title">Rejoignez le cercle lumineux Jocelyne K</h2>
            <p className="cta__description">
              Chaque jeudi, recevez des lancements exclusifs, des conseils d'entretien et des invitations
              VIP à nos pop-up stores. Vos informations sont stockées sur une infrastructure Supabase
              sécurisée, hébergée dans l'Union européenne et pleinement conforme au RGPD.
            </p>
            <NewsletterForm />
            <p className="cta__security">
              <strong>Confidentialité garantie :</strong> nous chiffrons chaque contact, ne partageons jamais
              vos données et vous pouvez vous désinscrire en un clic.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__content">
          <h2 className="footer__title">Jocelyne K</h2>
          <p className="footer__text">
            Boutique parisienne de lunettes de soleil premium depuis 2009. Certifiées UV 400,
            garanties 3 ans et polarisées pour un confort optimal.
          </p>
          <div className="footer__security">
            <h3 className="footer__security-title">Sécurité &amp; conformité</h3>
            <ul className="footer__security-list">
              <li>Hébergement Supabase avec sauvegardes quotidiennes.</li>
              <li>Accès limité aux conseillers certifiés RGPD.</li>
              <li>Suppression automatique des données sur simple demande.</li>
            </ul>
          </div>
          <p className="footer__legal">© {new Date().getFullYear()} Jocelyne K. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
