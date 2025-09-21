import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import Experience from './components/Experience';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

const App = () => (
  <div className="min-h-screen bg-luxury-linear">
    <header className="py-6">
      <div className="container-premium flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/60 bg-white/70 px-6 py-4 backdrop-blur">
        <a href="#" className="font-display text-2xl text-charcoal-900">
          Jocelyne K
        </a>
        <nav className="flex flex-wrap items-center gap-6 text-sm uppercase tracking-[0.4em] text-sand-700">
          <a href="#collection" className="transition hover:text-gold-500 focus-visible:text-gold-500">
            Collection
          </a>
          <a href="#experiences" className="transition hover:text-gold-500 focus-visible:text-gold-500">
            Services
          </a>
          <a href="#cta" className="btn-secondary px-5 py-2 text-xs tracking-[0.3em]">
            Club privé
          </a>
        </nav>
      </div>
    </header>

    <main className="space-y-section">
      <Hero />
      <ProductShowcase />
      <Experience />
      <CallToAction />
    </main>

    <Footer />
  </div>
);

export default App;
