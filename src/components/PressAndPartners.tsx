const pressMentions = [
  { name: 'Le Bon Look', tagline: 'Sélection coup de cœur' },
  { name: 'Madame Mode', tagline: 'Accessoires premium' },
  { name: 'Lunettes & Co', tagline: 'Innovation optique' },
  { name: 'Style.fr', tagline: 'Tendance été 2024' },
  { name: 'La Tribune', tagline: 'Savoir-faire français' },
  { name: 'Voyageurs', tagline: 'Indispensable en city-break' },
];

const PressAndPartners = () => (
  <section aria-labelledby="press-title" className="bg-white py-14">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">Ils parlent de nous</p>
        <h2 id="press-title" className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Presse & partenaires de confiance
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          De la presse lifestyle aux magazines spécialisés, la collection Jocelyne K séduit par son esthétique audacieuse et sa
          fabrication artisanale.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {pressMentions.map((mention) => (
          <div
            key={mention.name}
            className="flex h-28 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/40 text-center transition hover:border-amber-200 hover:bg-amber-50/60"
          >
            <span className="text-lg font-semibold uppercase tracking-[0.35em] text-slate-400 filter grayscale">
              {mention.name}
            </span>
            <span className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-300">
              {mention.tagline}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PressAndPartners;
