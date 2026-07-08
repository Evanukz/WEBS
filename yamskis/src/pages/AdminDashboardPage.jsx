import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Button from '../components/common/Button.jsx';
import Select from '../components/common/Select.jsx';
import TextInput from '../components/common/TextInput.jsx';
import { apiAdminCreateProduct, apiAdminDashboard, apiAdminDeleteProduct, apiAdminUpdateOrderStatus, apiAdminUpdateProduct, setAuthTokenHeader } from '../api/client.js';
import { categories, money } from '../data/catalog.js';

const emptyProductForm = {
  title: '',
  category: 'Phones',
  brand: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  description: '',
  imagesText: '',
  isFlashSale: false,
  flashSaleEndsAt: ''
};

function productToForm(product) {
  return {
    title: product.title || '',
    category: product.category || 'Phones',
    brand: product.brand || '',
    price: product.price ?? '',
    compareAtPrice: product.compareAtPrice ?? '',
    stock: product.stock ?? '',
    description: product.description || '',
    imagesText: Array.isArray(product.images) ? product.images.join(', ') : '',
    isFlashSale: Boolean(product.isFlashSale),
    flashSaleEndsAt: product.flashSaleEndsAt ? String(product.flashSaleEndsAt).slice(0, 16) : ''
  };
}

function toProductPayload(form) {
  return {
    title: form.title.trim(),
    category: form.category,
    brand: form.brand.trim(),
    price: Number(form.price || 0),
    compareAtPrice: form.compareAtPrice === '' ? undefined : Number(form.compareAtPrice),
    stock: form.stock === '' ? undefined : Number(form.stock),
    description: form.description.trim(),
    images: form.imagesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    isFlashSale: Boolean(form.isFlashSale),
    flashSaleEndsAt: form.flashSaleEndsAt || undefined
  };
}

function PieChart({ data = [], total, title, isDarkMode = false }) {
  const colors = ['#2563eb', '#14b8a6', '#f97316', '#e11d48', '#8b5cf6'];
  const sum = total || data.reduce((acc, item) => acc + item.value, 0);
  let offset = 0;

  return (
    <div className={`rounded-3xl border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-100 bg-slate-50 text-slate-950'}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">{title}</h3>
        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Total {sum}</span>
      </div>
      <svg viewBox="0 0 120 120" className="mx-auto block h-44 w-44">
        {data.map((item, index) => {
          const value = sum === 0 ? 0 : (item.value / sum) * 100;
          const dash = value === 0 ? '0 999' : `${value} ${100 - value}`;
          const style = {
            stroke: colors[index % colors.length],
            strokeWidth: 32,
            strokeDasharray: dash,
            strokeDashoffset: offset,
            transition: 'stroke-dasharray 200ms ease'
          };
          offset -= value;
          return <circle key={item.label} cx="60" cy="60" r="24" fill="none" style={style} transform="rotate(-90 60 60)" />;
        })}
        <circle cx="60" cy="60" r="12" fill="#fff" />
      </svg>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3 text-sm text-slate-700">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="font-semibold">{item.label}</span>
            <span className="ml-auto text-slate-500">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data = [], title, isDarkMode = false }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={`rounded-3xl border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-100 bg-slate-50 text-slate-950'}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black">{title}</h3>
        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Top 5</span>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totals: { orders: 0, products: 0, reviews: 0, revenue: 0 }, orderStatus: [], topProducts: [], ratingDistribution: [] });
  const [form, setForm] = useState(emptyProductForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const rootThemeClass = isDarkMode
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-gradient-to-b from-[#e9f5e9] via-[#f7fbf7] to-[#e2efe2] text-slate-950';
  const sectionThemeClass = isDarkMode
    ? 'rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-sm'
    : 'rounded-3xl border border-slate-100 bg-white text-slate-950 shadow-sm';
  const panelThemeClass = isDarkMode
    ? 'rounded-2xl border border-slate-700 bg-slate-900 text-slate-100'
    : 'rounded-2xl border border-slate-100 bg-white text-slate-950';
  const textSoft = isDarkMode ? 'text-slate-300' : 'text-slate-500';
  const textStrong = isDarkMode ? 'text-slate-100' : 'text-slate-950';

  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  async function load() {
    try {
      setAuthTokenHeader();
      const data = await apiAdminDashboard();
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setReviews(data.reviews || []);
      setStats(data.stats || { totals: { orders: 0, products: 0, reviews: 0, revenue: 0 }, orderStatus: [], topProducts: [], ratingDistribution: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Admin data load failed');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await apiAdminCreateProduct(toProductPayload(form));
      setForm(emptyProductForm);
      toast.success('Product created');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditingForm(productToForm(product));
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editingForm) return;

    try {
      await apiAdminUpdateProduct(editingProduct._id, toProductPayload(editingForm));
      toast.success('Product updated');
      setEditingProduct(null);
      setEditingForm(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className={rootThemeClass}>
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-6 lg:px-6 xl:px-8">
        <div className={`rounded-[2rem] border ${isDarkMode ? 'border-slate-700 bg-slate-950/90' : 'border-slate-200 bg-white/95'} p-6 shadow-sm shadow-slate-900/5 backdrop-blur-lg`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Admin panel</span>
              <div>
                <h1 className={`text-4xl font-black ${textStrong}`}>Admin dashboard</h1>
                <p className={`mt-2 max-w-2xl text-sm ${textSoft}`}>Manage products, orders, and customer activity with a clean overview and fast controls.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
            >
              {isDarkMode ? <FiSun className="h-5 w-5 text-amber-500" /> : <FiMoon className="h-5 w-5 text-brand-700" />}
              Theme
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5">
              <div className="text-xs uppercase tracking-[0.32em] text-brand-700">Orders</div>
              <div className="mt-4 text-3xl font-black text-brand-900">{stats.totals.orders}</div>
              <div className="mt-2 text-sm text-slate-600">Orders processed</div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.32em] text-brand-700">Products</div>
              <div className="mt-4 text-3xl font-black text-brand-900">{stats.totals.products}</div>
              <div className="mt-2 text-sm text-slate-600">Products in catalog</div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.32em] text-brand-700">Reviews</div>
              <div className="mt-4 text-3xl font-black text-brand-900">{stats.totals.reviews}</div>
              <div className="mt-2 text-sm text-slate-600">Customer feedback</div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.32em] text-brand-700">Revenue</div>
              <div className="mt-4 text-3xl font-black text-brand-900">{money(stats.totals.revenue)}</div>
              <div className="mt-2 text-sm text-slate-600">Total income</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <PieChart title="Order Status" data={stats.orderStatus} total={stats.totals.orders} isDarkMode={isDarkMode} />
            <BarChart title="Top Products by Revenue" data={stats.topProducts} isDarkMode={isDarkMode} />
          </div>
          <div className={`${sectionThemeClass} p-5 ring-1 ${isDarkMode ? 'ring-slate-700' : 'ring-slate-100'}`}>
            <h2 className={`text-xl font-black ${textStrong}`}>Recent reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 ? (
                <div className={`rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-500'} p-4 text-sm`}>No reviews yet.</div>
              ) : (
                reviews.slice(0, 8).map((review) => (
                  <div key={review._id} className={`${panelThemeClass} p-4`}>
                    <div className={`flex items-center justify-between gap-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div>{review.user?.name || 'Anonymous'}</div>
                      <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{review.product?.title || 'Product'}</div>
                    </div>
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Rating: {review.rating} / 5</div>
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{review.comment || 'No comment provided.'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={createProduct} className={`${sectionThemeClass} p-5 ring-1 ${isDarkMode ? 'ring-slate-700' : 'ring-slate-100'} h-fit`}>
            <h2 className={`text-xl font-black ${textStrong}`}>Add product</h2>
            <div className="mt-4 space-y-3">
              <TextInput value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Title" />
              <TextInput value={form.brand} onChange={(e) => setForm((current) => ({ ...current, brand: e.target.value }))} placeholder="Brand" />
              <TextInput value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} placeholder="Price" type="number" min="0" />
              <TextInput value={form.compareAtPrice} onChange={(e) => setForm((current) => ({ ...current, compareAtPrice: e.target.value }))} placeholder="Compare at price" type="number" min="0" />
              <TextInput value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} placeholder="Stock" type="number" min="0" />
              <Select value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <textarea
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                placeholder="Description"
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <TextInput value={form.imagesText} onChange={(e) => setForm((current) => ({ ...current, imagesText: e.target.value }))} placeholder="Image URLs, comma separated" />
              <TextInput value={form.flashSaleEndsAt} onChange={(e) => setForm((current) => ({ ...current, flashSaleEndsAt: e.target.value }))} placeholder="Flash sale ends at" type="datetime-local" />
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={form.isFlashSale} onChange={(e) => setForm((current) => ({ ...current, isFlashSale: e.target.checked }))} /> Flash sale
              </label>
              <Button className="w-full">Create product</Button>
            </div>
          </form>

          <section className="space-y-6">
            <div className={`${sectionThemeClass} p-5 ring-1 ${isDarkMode ? 'ring-slate-700' : 'ring-slate-100'}`}>
              <h2 className={`text-xl font-black ${textStrong}`}>Products</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <div key={product._id} className={`${panelThemeClass} p-4`}>
                    <div className={`text-sm font-black ${textStrong}`}>{product.title}</div>
                    <div className={`mt-1 text-sm ${textSoft}`}>{product.category}</div>
                    <div className="mt-2 font-black text-brand-700">{money(product.price)}</div>
                    <div className="mt-4 flex gap-2 text-sm font-bold">
                      <button onClick={() => openEditProduct(product)} className={`rounded-xl px-3 py-2 ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900'}`}>Edit</button>
                      <button onClick={async () => { await apiAdminDeleteProduct(product._id); toast.success('Deleted'); load(); }} className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${sectionThemeClass} p-5 ring-1 ${isDarkMode ? 'ring-slate-700' : 'ring-slate-100'}`}>
              <h2 className={`text-xl font-black ${textStrong}`}>Orders</h2>
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className={`flex flex-col gap-3 ${panelThemeClass} p-4 md:flex-row md:items-center md:justify-between`}>
                    <div>
                      <div className={`text-sm font-black ${textStrong}`}>{order._id}</div>
                      <div className={`text-sm ${textSoft}`}>{order.status}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select defaultValue={order.status} onChange={async (e) => { await apiAdminUpdateOrderStatus(order._id, e.target.value); toast.success('Status updated'); load(); }} className={`rounded-xl px-3 py-2 text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <div className="font-black text-brand-700">{money(order?.totals?.grandTotal || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {editingProduct && editingForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8" onClick={() => { setEditingProduct(null); setEditingForm(null); }}>
            <div
              className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-950'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">Edit product</div>
                  <h2 className={`mt-1 text-2xl font-black ${textStrong}`}>{editingProduct.title}</h2>
                </div>
                <button type="button" onClick={() => { setEditingProduct(null); setEditingForm(null); }} className={`rounded-full px-3 py-1 text-sm font-bold transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Close</button>
              </div>

              <form onSubmit={updateProduct} className="mt-5 grid gap-3 md:grid-cols-2">
                <TextInput value={editingForm.title} onChange={(e) => setEditingForm((current) => ({ ...current, title: e.target.value }))} placeholder="Title" className="md:col-span-2" />
                <TextInput value={editingForm.brand} onChange={(e) => setEditingForm((current) => ({ ...current, brand: e.target.value }))} placeholder="Brand" />
                <Select value={editingForm.category} onChange={(e) => setEditingForm((current) => ({ ...current, category: e.target.value }))}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </Select>
                <TextInput value={editingForm.price} onChange={(e) => setEditingForm((current) => ({ ...current, price: e.target.value }))} placeholder="Price" type="number" min="0" />
                <TextInput value={editingForm.compareAtPrice} onChange={(e) => setEditingForm((current) => ({ ...current, compareAtPrice: e.target.value }))} placeholder="Compare at price" type="number" min="0" />
                <TextInput value={editingForm.stock} onChange={(e) => setEditingForm((current) => ({ ...current, stock: e.target.value }))} placeholder="Stock" type="number" min="0" />
                <TextInput value={editingForm.flashSaleEndsAt} onChange={(e) => setEditingForm((current) => ({ ...current, flashSaleEndsAt: e.target.value }))} placeholder="Flash sale ends at" type="datetime-local" className="md:col-span-2" />
                <textarea
                  value={editingForm.description}
                  onChange={(e) => setEditingForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Description"
                  className="md:col-span-2 min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <TextInput value={editingForm.imagesText} onChange={(e) => setEditingForm((current) => ({ ...current, imagesText: e.target.value }))} placeholder="Image URLs, comma separated" className="md:col-span-2" />
                <label className={`flex items-center gap-2 text-sm font-semibold md:col-span-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  <input type="checkbox" checked={editingForm.isFlashSale} onChange={(e) => setEditingForm((current) => ({ ...current, isFlashSale: e.target.checked }))} /> Flash sale
                </label>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => { setEditingProduct(null); setEditingForm(null); }} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                    Cancel
                  </button>
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
