import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import placeholderImage, { imgFallback } from '../utils/imagePlaceholder.js';
import { CartContext } from '../state/CartContext.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { categories, money } from '../data/catalog.js';

export default function CartPage() {
  const { cart, removeFromCart, setQty, totals } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const summary = totals();

  const proceed = () => {
    if (!isAuthenticated) {
      toast('Please login to continue');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-6 lg:px-6 xl:px-8">
        <h1 className="text-3xl font-black text-slate-950">Cart</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
                <h2 className="text-xl font-black">Your cart is empty</h2>
                <p className="mt-2 text-sm text-slate-600">Browse products and add something you love.</p>
                <Link to="/search" className="mt-4 inline-flex rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white">
                  Continue shopping
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center">
                  <img src={item.image || placeholderImage(item.title || 'Product')} alt={item.title} className="h-24 w-24 rounded-2xl object-cover" onError={imgFallback(item.title || 'Product')} />
                  <div className="flex-1">
                    <div className="text-base font-black text-slate-950">{item.title}</div>
                    <div className="mt-1 text-sm font-semibold text-brand-700">{money(item.price)}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => setQty(item.productId, e.target.value)}
                        className="w-24 rounded-xl border border-slate-200 px-3 py-2"
                      />
                      <button onClick={() => removeFromCart(item.productId)} className="text-sm font-bold text-rose-600">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 h-fit">
            <div className="text-lg font-black text-slate-950">Order summary</div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{money(summary.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>{money(summary.shipping)}</span></div>
              <div className="flex items-center justify-between"><span>Tax</span><span>{money(summary.tax)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-black text-slate-950"><span>Total</span><span>{money(summary.grandTotal)}</span></div>
            </div>
            <button onClick={proceed} className="mt-5 w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white">
              Checkout
            </button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
