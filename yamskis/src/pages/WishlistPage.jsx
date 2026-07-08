import { useContext } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import { WishlistContext } from '../state/WishlistContext.jsx';
import { categories } from '../data/catalog.js';

export default function WishlistPage() {
  const { wishlist, toggle, isWished } = useContext(WishlistContext);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-6 lg:px-6 xl:px-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Saved items</div>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Wishlist</h1>
          </div>
          <Link to="/search" className="text-sm font-bold text-brand-700">Continue shopping</Link>
        </div>

        <div className="mt-6">
          {wishlist.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-black">No saved products yet</h2>
              <p className="mt-2 text-sm text-slate-600">Tap the heart on a product to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <ProductCard key={product._id} product={product} wished={isWished(product._id)} onToggleWishlist={toggle} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
