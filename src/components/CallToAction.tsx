import { ArrowRight } from 'lucide-react';

const CallToAction = () => (
  <section id="cta" className="py-section-sm">
    <div className="container-premium">
      <div className="section-shell bg-gradient-to-r from-gold-100/80 via-gold-50/90 to-sand-100/80">
        <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div className="space-y-4">
            <span className="eyebrow text-charcoal-900">Club Lumière</span>
            <h2 className="text-3xl text-charcoal-900 md:text-4xl lg:text-5xl">
              Rejoignez le cercle privé Jocelyne K
            </h2>
            <p className="text-sand-900/80">
              Invitations aux lancements exclusifs, accès aux précommandes et mise à disposition d&apos;une
              concierge personnelle pour toutes vos envies solaires.
            </p>
          </div>

          <form className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <label className="sr-only" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Votre e-mail premium"
              className="w-full rounded-full border border-sand-300 bg-white/90 px-6 py-3 text-sm text-charcoal-900 placeholder:text-sand-500 transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200 md:flex-1 md:py-4"
            />
            <button
              type="submit"
              className="btn-primary inline-flex w-full justify-center gap-2 md:w-auto md:px-8 md:py-4"
            >
              Rejoindre
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);

export default CallToAction;
