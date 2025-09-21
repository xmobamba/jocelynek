import { Gem, HeartHandshake, Star } from 'lucide-react';

const experiences = [
  {
    title: 'Essayage privé',
    description:
      'Un expert styliste vous accueille en salon ou en visioconseil pour sélectionner les montures adaptées à votre carnation et votre style de vie.',
    icon: HeartHandshake,
  },
  {
    title: 'Optique sur-mesure',
    description:
      'Verres dégradés, miroirs dorés, traitements anti-reflet et teintes personnalisées pour sublimer votre regard en toute saison.',
    icon: Gem,
  },
  {
    title: 'Programme Signature',
    description:
      'Gravage de vos initiales, livraison internationale premium et suivi d’entretien offert pendant deux ans.',
    icon: Star,
  },
];

const Experience = () => (
  <section id="experiences" className="py-section-lg">
    <div className="container-premium">
      <div className="section-shell">
        <div className="grid gap-14 lg:grid-cols-[0.75fr,1fr] lg:items-start">
          <div className="space-y-6">
            <span className="eyebrow">Expériences sur mesure</span>
            <h2 className="text-4xl text-charcoal-900 md:text-5xl lg:text-6xl">
              Un accompagnement premium au-delà du soleil
            </h2>
            <p className="text-lg text-sand-900/85">
              La boutique Jocelyne K imagine un parcours d&apos;excellence pour chaque cliente : rendez-vous
              privatisé, conseil en colorimétrie, signature olfactive et ateliers créatifs autour de la
              lunetterie d&apos;art.
            </p>
            <a
              href="#cta"
              className="btn-secondary w-full justify-center hover:-translate-y-[3px] focus-visible:-translate-y-[3px] md:w-auto"
            >
              Réserver un moment privilégié
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {experiences.map(({ title, description, icon: Icon }) => (
              <article key={title} className="card-luxe group p-8 md:p-9">
                <span className="card-accent" aria-hidden="true" />
                <Icon className="h-10 w-10 text-gold-500" aria-hidden="true" />
                <h3 className="text-2xl text-charcoal-900">{title}</h3>
                <p className="text-sm text-sand-900/85 md:text-base">{description}</p>
                <a
                  href="#cta"
                  className="btn-secondary mt-6 w-fit bg-white/60 px-5 py-2 text-xs uppercase hover:bg-gold-50/60 focus-visible:bg-gold-50/80"
                >
                  En savoir plus
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Experience;
