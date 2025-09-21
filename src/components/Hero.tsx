import { Sparkles, ArrowUpRight } from 'lucide-react';

const Hero = () => (
  <section className="py-section">
    <div className="container-premium">
      <div className="section-shell bg-noise">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <span className="badge-premium">Signature Jocelyne K</span>
          <div className="flex items-center gap-3 text-sm text-sand-700">
            <Sparkles className="h-4 w-4 text-gold-500" />
            Verres hautes performances & styles iconiques
          </div>
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div className="space-y-8">
            <div>
              <span className="eyebrow">Collection Été 2024</span>
              <h1 className="text-4xl leading-[1.1] text-gradient-luxe sm:text-5xl lg:text-6xl">
                L&apos;élégance lumineuse pour vos instants les plus précieux
              </h1>
            </div>

            <p className="max-w-xl text-lg text-sand-900/80">
              Des montures façonnées main dans des matériaux nobles, des verres polarisés dorés
              et une signature maison inspirée de la Côte d&apos;Azur. Découvrez une nouvelle idée du
              luxe solaire.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#collection"
                className="btn-primary hover:translate-y-[-2px] focus-visible:translate-y-[-2px]"
              >
                Explorer la collection
                <ArrowUpRight className="ml-3 h-4 w-4" />
              </a>
              <a
                href="#experiences"
                className="btn-secondary hover:-translate-y-[2px] focus-visible:-translate-y-[2px]"
              >
                Prendre rendez-vous
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-y-0 w-full rounded-full bg-gradient-to-br from-gold-100 via-sand-100 to-transparent blur-3xl" />
            <div className="relative aspect-[3/4] w-4/5 overflow-hidden rounded-[3rem] border border-white/40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(246,237,225,0.65))] shadow-luxe">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center mix-blend-luminosity" />
              <div className="relative flex h-full flex-col justify-between p-8 text-white">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em]">
                  <span>Maison Riviera</span>
                  <span>Depuis 1987</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-4xl leading-none">Azur Nocturne</span>
                  <p className="mt-3 max-w-[12rem] text-sm text-white/80">
                    Monture titane, verres miroir sable doux, finition or champagne 24K.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
