import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import SkeletonGrid from '../components/common/SkeletonGrid.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { WishlistContext } from '../state/WishlistContext.jsx';
import { apiLogin, apiProducts, setAuthTokenHeader } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function LoginPage() {
  const [email, setEmail] = useState('user@yamskis.com');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { login } = useContext(AuthContext);
  const { isWished, toggle, hydrated } = useContext(WishlistContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      try {
        setAuthTokenHeader();
        const data = await apiProducts({});
        setFeaturedProducts((data.products || []).slice(0, 4));
      } catch {
        // silently fail
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await apiLogin({ email, password });
      login(data);
      setAuthTokenHeader();
      toast.success('Welcome back');
      navigate(data?.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white text-slate-900">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-8 lg:px-6 xl:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Login Form */}
          <div>
            <form onSubmit={submit} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <h1 className="text-3xl font-black text-slate-950">Login</h1>
              <p className="mt-2 text-sm text-slate-600">Use your account to manage cart, wishlist, and orders.</p>
              <div className="mt-6 space-y-4">
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
                <button disabled={loading} className="w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                No account? <Link className="font-bold text-brand-700" to="/register">Register</Link>
              </p>
            </form>

            {/* Trust badges below form on mobile */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:hidden">
              {[
                { emoji: '🚚', title: 'Fast delivery', text: 'Same-day dispatch for selected items.' },
                { emoji: '🔒', title: 'Secure checkout', text: 'Safe payments and order tracking.' },
                { emoji: '⭐', title: 'Top rated', text: 'Popular products from trusted brands.' }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="text-xl">{item.emoji}</div>
                  <div className="mt-2 text-sm font-extrabold text-slate-900">{item.title}</div>
                  <p className="mt-1 text-xs text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>

          {/* Product Showcase */}
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Featured</div>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Popular products</h2>
                </div>
                <Link to="/search" className="text-sm font-bold text-brand-700">View all</Link>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {productsLoading ? (
                  <SkeletonGrid count={2} />
                ) : (
                  featuredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wished={hydrated ? isWished(product._id) : false}
                      onToggleWishlist={toggle}
                    />
                  ))
                )}
              </div>

            {/* Category quick links */}
            <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Browse by category</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat}
                    to={`/search?category=${encodeURIComponent(cat)}`}
                    className="rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
          </div>
                </div>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
