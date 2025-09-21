const Footer = () => (
  <footer className="py-12">
    <div className="container-premium flex flex-col gap-6 border-t border-sand-200/60 pt-10 text-sm text-sand-700 md:flex-row md:items-center md:justify-between">
      <p>
        © {new Date().getFullYear()} Jocelyne K. Lunettes de soleil de luxe façonnées en France.
      </p>
      <div className="flex gap-6">
        <a href="#collection" className="transition hover:text-gold-500 focus-visible:text-gold-500">
          Collection
        </a>
        <a href="#experiences" className="transition hover:text-gold-500 focus-visible:text-gold-500">
          Expériences
        </a>
        <a href="#cta" className="transition hover:text-gold-500 focus-visible:text-gold-500">
          Club privé
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
