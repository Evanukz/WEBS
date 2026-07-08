import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import SkeletonGrid from '../components/common/SkeletonGrid.jsx';
import { apiProducts } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function ProductListPage() {
  const { category: routeCategory } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = routeCategory || searchParams.get('category') || '';
  const flash = searchParams.get('flash') === 'true';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiProducts({ q: q || undefined, category: category || undefined, flash: flash ? 'true' : undefined });
        setProducts(data.products || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load products');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [q, category, flash]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-6 lg:px-6 xl:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Catalog</div>
            <h1 className="mt-1 text-3xl font-black text-slate-950">{category || 'Browse products'}</h1>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
            {products.length} results
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm font-black text-slate-900">Filters</div>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/search" className="block rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                All products
              </Link>
              <Link to="/search?flash=true" className="block rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                Flash sales
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  to={`/search?category=${encodeURIComponent(item)}`}
                  className="block rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  {item}
                </Link>
              ))}
            </div>
          </aside>

          <section>
            {loading ? (
              <SkeletonGrid count={8} />
            ) : products.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
                <h2 className="text-xl font-black text-slate-950">No matching products</h2>
                <p className="mt-2 text-sm text-slate-600">Try a different search term or browse another category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
