import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Camille R.',
    role: 'Créatrice de contenu',
    rating: 5,
    quote:
      'Des montures incroyablement légères avec un style rétro que je n’ai trouvé nulle part ailleurs. Je me sens unique à chaque sortie.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Yacine B.',
    role: 'Entrepreneur',
    rating: 4,
    quote:
      'La personnalisation a été rapide et précise. On voit vraiment la différence avec une approche artisanale et sur-mesure.',
    image:
      'https://images.unsplash.com/photo-1522556189639-b15089575906?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Inès L.',
    role: 'Styliste freelance',
    rating: 5,
    quote:
      'Livraison express, emballage soigné et surtout des verres qui protègent parfaitement mes yeux sensibles. Une révélation !',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Mathis D.',
    role: 'Consultant',
    rating: 5,
    quote:
      'Je reçois des compliments à chaque réunion. Les matériaux sont premium et la tenue est impeccable toute la journée.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
  },
];

const Testimonials = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const interval = window.setInterval(() => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScrollLeft - 16) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      track.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' });
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const scroll = (direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const offset = track.clientWidth * 0.9;
    track.scrollBy({
      left: direction === 'next' ? offset : -offset,
      behavior: 'smooth',
    });
  };

  return (
    <section id="testimonials" className="bg-gradient-to-b from-white via-amber-50 to-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
              Avis clients
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Une communauté conquise par l’élégance artisanale
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Chaque paire est façonnée à la main dans notre atelier lyonnais. Découvrez les impressions de celles et ceux
              qui portent déjà nos solaires signature.
            </p>
          </div>
          <div className="flex gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => scroll('prev')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 transition hover:border-amber-400 hover:text-amber-700"
              aria-label="Voir le témoignage précédent"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('next')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 transition hover:border-amber-400 hover:text-amber-700"
              aria-label="Voir le témoignage suivant"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-50 via-amber-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-50 via-amber-50 to-transparent" />

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pr-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-amber-200/60 sm:pr-0 [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="relative flex min-w-[85%] max-w-sm flex-col justify-between rounded-3xl border border-amber-100 bg-white/80 p-7 shadow-[0_30px_60px_-30px_rgba(217,119,6,0.45)] backdrop-blur sm:min-w-[360px]"
              >
                <Quote className="absolute -top-5 right-6 h-10 w-10 rounded-full bg-amber-500/10 p-2 text-amber-500" />
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-md"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-amber-600">{testimonial.rating}.0</span>
                  </div>

                  <p className="mt-5 text-base text-slate-600">“{testimonial.quote}”</p>
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-amber-400">
                  <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  Client vérifié
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
