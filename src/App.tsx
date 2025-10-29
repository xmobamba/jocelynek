import { ArrowUpRight, Sparkles } from 'lucide-react';
import PressAndPartners from './components/PressAndPartners';
import ServiceHighlights from './components/ServiceHighlights';
import Testimonials from './components/Testimonials';

const products = [
  {
    name: 'Monture Riviera 70’s',
    description: 'Acétate translucide champagne et verres ambrés anti-reflets.',
    price: '249 €',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Lunettes Solaris Bold',
    description: 'Monture oversized ébène avec branches martelées et verres dégradés.',
    price: '279 €',
    image:
      'https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Modèle Atelier 03',
    description: 'Ligne unisexe à pont keyhole, finitions dorées et verres polarisés.',
    price: '305 €',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
];

const App = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="overflow-hidden bg-gradient-to-br from-amber-100/60 via-white to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-16 px-4 py-24 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-amber-600">
              <Sparkles className="h-3.5 w-3.5" />
              Nouvelle collection
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Solaires d’exception façonnées dans notre atelier lyonnais
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Les créations Jocelyne K combinent matériaux responsables, lignes audacieuses et confort absolu. Chaque monture est
              imaginée pour sublimer les personnalités solaires.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#produits"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-amber-400"
              >
                Voir les modèles
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <span className="text-sm uppercase tracking-[0.35em] text-slate-400">Garantie atelier 2 ans</span>
            </div>
          </div>

          <div className="relative flex-1 self-stretch lg:h-[520px]">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-amber-200/50 via-amber-100 to-white blur-3xl" />
            <div className="relative h-full overflow-hidden rounded-[3rem] border border-amber-200/60 bg-white shadow-[0_60px_120px_-70px_rgba(217,119,6,0.9)]">
              <img
                src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80"
                alt="Collection Jocelyne K"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="produits" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.45em] text-amber-500">Modèles iconiques</span>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Des lignes sculptées pour capter la lumière</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-500 sm:text-base">
                Une sélection limitée produite en séries numérotées. Nos lunettes sont assemblées à la main et contrôlées
                minutieusement avant expédition.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="group overflow-hidden rounded-[2.5rem] border border-amber-100 bg-white shadow-[0_40px_90px_-60px_rgba(15,23,42,0.5)] transition hover:-translate-y-2 hover:border-amber-300/70"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                    <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-slate-700 shadow">
                      Atelier
                    </span>
                  </div>
                  <div className="space-y-3 px-6 pb-8 pt-6">
                    <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500 sm:text-base">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-amber-600">{product.price}</span>
                      <a
                        href="#cta"
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-600 transition hover:border-amber-400 hover:bg-amber-50"
                      >
                        Réserver
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        <PressAndPartners />
        <ServiceHighlights />

        <section id="cta" className="py-24">
          <div className="mx-auto max-w-4xl rounded-[3rem] bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-16 text-center text-white shadow-[0_60px_120px_-40px_rgba(217,119,6,0.7)]">
            <h2 className="text-3xl font-semibold sm:text-4xl">Prêt·e à révéler votre aura solaire ?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg">
              Prenez rendez-vous pour un essayage privé en visio ou à l’atelier Jocelyne K. Nos stylistes vous accompagnent pour
              trouver la monture qui vous ressemble.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:bonjour@jocelynek.com"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-amber-600 transition hover:bg-amber-50"
              >
                Réserver un rendez-vous
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#testimonials"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-white/10"
              >
                Découvrir les avis
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Jocelyne K — Atelier lunetier français</span>
          <div className="flex items-center gap-4 uppercase tracking-[0.35em]">
            <a href="#produits" className="hover:text-amber-500">
              Collection
            </a>
            <a href="#services" className="hover:text-amber-500">
              Services
            </a>
            <a href="mailto:bonjour@jocelynek.com" className="hover:text-amber-500">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
