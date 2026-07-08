import { useEffect, useState } from 'react';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { apiOrdersMe, setAuthTokenHeader } from '../api/client.js';
import { categories, money } from '../data/catalog.js';

export default function ProfilePage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setAuthTokenHeader();
        const data = await apiOrdersMe();
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[88rem] px-4 py-6 lg:px-6 xl:px-8">
        <h1 className="text-3xl font-black text-slate-950">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Track your order history and account activity.</p>
        <section className="mt-6 space-y-3">
          {orders.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
              <h2 className="text-xl font-black">No orders yet</h2>
              <p className="mt-2 text-sm text-slate-600">Your completed orders will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-950">Order {order._id}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{order.status}</div>
                  </div>
                  <div className="text-lg font-black text-brand-700">{money(order?.totals?.grandTotal || 0)}</div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  {order.items?.map((item) => (
                    <div key={item.product} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span>{item.title}</span>
                      <span>x{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
