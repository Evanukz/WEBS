import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { apiOrderById } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (order) return;

      try {
        const data = await apiOrderById(orderId);
        if (active) setOrder(data.order || null);
      } catch (error) {
        if (active) toast.error(error?.response?.data?.message || 'Unable to load order');
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [order, orderId]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[84rem] px-4 py-12 text-center lg:px-6 xl:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl text-brand-700">✓</div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Order confirmed</h1>
          <p className="mt-2 text-sm text-slate-600">Your order has been placed successfully.</p>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            Order ID: {orderId}
            {order ? <div className="mt-1">Total: ₦{Number(order?.totals?.grandTotal || 0).toLocaleString()}</div> : <div className="mt-1 text-slate-500">Loading order details...</div>}
          </div>
          {order ? (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-950">{order.status}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-lg font-black text-brand-700">₦{Number(order?.totals?.grandTotal || 0).toLocaleString()}</div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {order.items?.map((item) => (
                  <div key={item.product} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>{item.title}</span>
                    <span>x{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/profile" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white">View orders</Link>
            <Link to="/search" className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-900">Continue shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
