import type { LucideIcon } from 'lucide-react';
import { Palette, RefreshCcw, Truck } from 'lucide-react';

const services: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Livraison express & soignée',
    description:
      'Expédition en 48h partout en France métropolitaine, avec un écrin recyclé et des accessoires de soin inclus.',
    icon: Truck,
  },
  {
    title: 'Retours gratuits 30 jours',
    description:
      'Essayez vos lunettes en toute tranquillité : ajustements offerts et échanges facilités directement depuis votre espace client.',
    icon: RefreshCcw,
  },
  {
    title: 'Personnalisation signature',
    description:
      'Gravure des initiales, verres teintés sur mesure et ajustage à la morphologie réalisés par nos artisans lunetiers.',
    icon: Palette,
  },
];

const ServiceHighlights = () => (
  <section id="services" className="bg-slate-900 py-20 text-white">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-400">Services signature</span>
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Une expérience haut de gamme du clic à la rue</h2>
        <p className="mt-3 text-base text-slate-300 sm:text-lg">
          Notre équipe suit chaque commande de la sélection à l’entretien. Profitez d’un accompagnement personnalisé avant et
          après votre achat.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article
              key={service.title}
              className="group flex flex-col gap-4 rounded-3xl border border-slate-700/60 bg-slate-800/60 p-8 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-amber-400/80 hover:bg-slate-800/80"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300 transition group-hover:bg-amber-400/20 group-hover:text-amber-200">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{service.description}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default ServiceHighlights;
