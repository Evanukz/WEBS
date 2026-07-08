import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { CartContext } from '../state/CartContext.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { categories, money } from '../data/catalog.js';
import { apiCheckout, setAuthTokenHeader } from '../api/client.js';

export default function CheckoutPage() {
  const { cart, totals, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const summary = totals();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    city: '',
    country: 'Nigeria'
  });
  const [paymentProvider, setPaymentProvider] = useState('paystack');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAuthTokenHeader();
      const data = await apiCheckout({ cart, totals: summary, shippingAddress: form, paymentProvider });
      clearCart();
      toast.success('Order placed successfully');
      navigate(`/order/${data.orderId}/confirmation`, { state: { order: data.order } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[88rem] px-4 py-6 lg:px-6 xl:px-8">
        <h1 className="text-3xl font-black text-slate-950">Checkout</h1>
        <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-xl font-black">Shipping details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {['fullName', 'phone', 'addressLine1', 'city', 'country'].map((field) => (
                <label key={field} className={field === 'addressLine1' ? 'md:col-span-2' : ''}>
                  <div className="mb-2 text-sm font-semibold text-slate-700">{field}</div>
                  <input
                    required
                    value={form[field]}
                    onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  />
                </label>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 h-fit">
            <h2 className="text-xl font-black">Payment</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <label className="flex items-center gap-2"><input type="radio" checked={paymentProvider === 'paystack'} onChange={() => setPaymentProvider('paystack')} /> Paystack</label>
              <label className="flex items-center gap-2"><input type="radio" checked={paymentProvider === 'flutterwave'} onChange={() => setPaymentProvider('flutterwave')} /> Flutterwave</label>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{money(summary.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Total</span><span className="font-black text-slate-950">{money(summary.grandTotal)}</span></div>
            </div>

            <button disabled={loading || cart.length === 0} className="mt-5 w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {loading ? 'Processing...' : 'Place order'}
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
