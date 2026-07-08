import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import HeroCarousel from '../components/home/HeroCarousel.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import SkeletonGrid from '../components/common/SkeletonGrid.jsx';
import { WishlistContext } from '../state/WishlistContext.jsx';
import { apiProducts, setAuthTokenHeader } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function HomePage() {
  const { isWished, toggle, hydrated } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiProducts({});
        setProducts(data.products || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    setAuthTokenHeader();
    load();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const flashSales = useMemo(() => products.filter((product) => product.isFlashSale).slice(0, 4), [products]);
  const recommendedProducts = useMemo(() => products.slice(4, 8), [products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white text-slate-900">
      <Navbar categories={categories} />

      <main className="mx-auto max-w-[96rem] px-4 py-5 lg:px-6 xl:px-8">
        <section className="mx-auto max-w-6xl space-y-5">
          <HeroCarousel />

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: FiTruck, title: 'Fast delivery', text: 'Same-day dispatch for selected items.' },
              { icon: FiShield, title: 'Secure checkout', text: 'Designed for safe payments and order tracking.' },
              { icon: FiStar, title: 'Top rated picks', text: 'Popular products from trusted brands.' }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <item.icon className="text-xl text-brand-600" />
                <div className="mt-3 text-sm font-extrabold text-slate-900">{item.title}</div>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </section>
        </section>

        <section className="mx-auto mt-8 max-w-6xl space-y-5">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Featured</div>
                <h2 className="mt-1 text-2xl font-black">Featured products</h2>
              </div>
              <Link to="/search" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                View all <FiArrowRight />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading ? <SkeletonGrid count={4} /> : featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} wished={isWished(product._id)} onToggleWishlist={toggle} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">Flash sales</div>
                <h2 className="mt-1 text-2xl font-black">Limited-time offers</h2>
              </div>
              <Link to="/search?flash=true" className="inline-flex items-center gap-1 text-sm font-bold text-orange-300">
                Browse deals <FiArrowRight />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading ? <SkeletonGrid count={4} /> : flashSales.map((product) => (
                <ProductCard key={product._id} product={product} wished={isWished(product._id)} onToggleWishlist={toggle} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Recommended</div>
                <h2 className="mt-1 text-2xl font-black">Picked for you</h2>
              </div>
              <Link to="/wishlist" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Your wishlist <FiArrowRight />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading ? <SkeletonGrid count={4} /> : recommendedProducts.map((product) => (
                <ProductCard key={product._id} product={product} wished={isWished(product._id)} onToggleWishlist={toggle} />
              ))}
            </div>
          </section>
        </section>

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-brand-600 to-orange-500 px-6 py-7 text-white shadow-lg">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.25em] text-white/80">2026 storefront</div>
              <h2 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
                A complete modern e-commerce experience for yamskis.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
                Responsive storefront, product discovery, cart and checkout, authentication, reviews, and admin workflows.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              Explore now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
