import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: 'Flash deals every day',
    subtitle: 'Shop electronics, fashion & more',
    accent: 'from-brand-500/20 to-brand-300/20',
    img: 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#4fa75f'/><stop offset='1' stop-color='#1d4627'/></linearGradient></defs><rect width='1200' height='600' fill='url(#g)'/><text x='50%' y='52%' text-anchor='middle' font-family='Arial' font-size='64' fill='white'>yamskis</text><text x='50%' y='64%' text-anchor='middle' font-family='Arial' font-size='26' fill='white'>2026 e-commerce</text></svg>`)
  },
  {
    title: 'Free delivery on first order',
    subtitle: 'Limited time promo',
    accent: 'from-brand-300/20 to-brand-500/20',
    img: 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='1200' height='600' fill='#a9d9aa'/><circle cx='950' cy='180' r='120' fill='#f5fbf6'/><circle cx='890' cy='250' r='70' fill='#cfeccd'/><text x='50%' y='52%' text-anchor='middle' font-family='Arial' font-size='58' fill='white'>Shop smarter</text><text x='50%' y='64%' text-anchor='middle' font-family='Arial' font-size='24' fill='white'>with yamskis</text></svg>`)
  }
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((x) => (x + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative">
        <img src={slides[idx].img} alt="hero" className="h-[260px] w-full object-cover md:h-[320px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-6">
            <div className="inline-flex rounded-full bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 ring-1 ring-slate-200">
              Promotions
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900 md:text-4xl">{slides[idx].title}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-700 md:text-base">{slides[idx].subtitle}</p>
            <div className="mt-5 flex gap-3">
              <Link
                to="/search?flash=true"
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"
              >
                Shop now
              </Link>
              <Link
                to="/search"
                className="rounded-xl bg-white/70 px-5 py-3 text-sm font-bold text-slate-900 ring-1 ring-slate-200 hover:bg-white"
              >
                View deals
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2.5 w-10 rounded-full transition ${i === idx ? 'bg-brand-500' : 'bg-white/60 ring-1 ring-white/70'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

