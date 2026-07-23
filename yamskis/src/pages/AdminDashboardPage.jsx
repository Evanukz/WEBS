import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit2,
  FiEye,
  FiImage,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
  FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import Button from '../components/common/Button.jsx';
import Select from '../components/common/Select.jsx';
import TextInput from '../components/common/TextInput.jsx';
import AdminShell from '../components/admin/AdminShell.jsx';
import MetricCard from '../components/admin/MetricCard.jsx';
import { ChartCard } from '../components/admin/ChartCard.jsx';
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

function statusClasses(status, isDarkMode) {
  const map = {
    delivered: isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700',
    shipped: isDarkMode ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700',
    processing: isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700',
    cancelled: isDarkMode ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-50 text-rose-700'
  };
  return map[status] || (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700');
}

function getViewFromPath(pathname) {
  if (pathname.includes('/products')) return 'products';
  if (pathname.includes('/orders')) return 'orders';
  if (pathname.includes('/customers')) return 'customers';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/payments')) return 'payments';
  if (pathname.includes('/settings')) return 'settings';
  return 'overview';
}

function buildConicGradient(items, valueKey, colors) {
  const total = items.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0);

  if (!total) {
    return `${colors[0]} 0 100%`;
  }

  let start = 0;
  const segments = items.map((item, index) => {
    const value = Number(item[valueKey] || 0);
    const end = start + (value / total) * 100;
    const segment = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

export default function AdminDashboardPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totals: { orders: 0, products: 0, reviews: 0, revenue: 0 }, orderStatus: [], topProducts: [], ratingDistribution: [] });
  const [form, setForm] = useState(emptyProductForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState(getViewFromPath(location.pathname));
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [settings, setSettings] = useState({ maintenance: false, autoApprove: true, lowStockAlert: true, emailDigest: true });
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const navigate = useNavigate();

  const viewMode = useMemo(() => getViewFromPath(location.pathname), [location.pathname]);

  useEffect(() => {
    setView(viewMode);
  }, [viewMode]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) return;

    const map = {
      'new-product': 'products',
      'inventory': 'products',
      'orders-table': 'orders',
      'fulfillment': 'orders',
      'customers-panel': 'customers',
      'analytics-panel': 'analytics',
      'revenue-metrics': 'analytics',
      'store-settings': 'settings'
    };

    if (map[hash]) setView(map[hash]);
    requestAnimationFrame(() => {
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash, location.pathname]);

  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  async function load(silent = false) {
    try {
      setAuthTokenHeader();
      const data = await apiAdminDashboard();
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setReviews(data.reviews || []);
      setStats(data.stats || { totals: { orders: 0, products: 0, reviews: 0, revenue: 0 }, orderStatus: [], topProducts: [], ratingDistribution: [] });
      if (!silent) toast.success('Dashboard synced');
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    } catch (err) {
      if (!silent) toast.error(err?.response?.data?.message || 'Admin data load failed');
    }
  }

  useEffect(() => {
    load(true);
    const interval = window.setInterval(() => load(true), 15000);
    return () => window.clearInterval(interval);
  }, []);

  const customerActivity = useMemo(() => {
    const baseCustomers = orders.slice(0, 6).map((order, index) => ({
      id: order._id || `c-${index}`,
      name: order.user?.name || `Guest ${index + 1}`,
      email: `${(order.user?.name || 'guest').toLowerCase().replace(/\s+/g, '.')}@mail.com`,
      spent: order?.totals?.grandTotal || 0,
      status: order.status || 'processing'
    }));

    return baseCustomers;
  }, [orders]);

  const analyticsSeries = useMemo(() => {
    const days = 7;
    const dailySeries = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      return {
        key,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        orders: 0,
        revenue: 0
      };
    });

    orders.forEach((order) => {
      const created = new Date(order.createdAt || Date.now());
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`;
      const entry = dailySeries.find((item) => item.key === key);

      if (entry) {
        entry.orders += 1;
        entry.revenue += Number(order?.totals?.grandTotal || 0);
      }
    });

    return dailySeries;
  }, [orders]);

  const salesChartData = useMemo(() => {
    const active = analyticsSeries.filter((item) => Number(item.orders || 0) > 0);
    if (active.length) return active;
    return [{ key: 'empty-sales', day: 'No orders yet', orders: 1, revenue: 0 }];
  }, [analyticsSeries]);

  const revenueChartData = useMemo(() => {
    const active = analyticsSeries.filter((item) => Number(item.revenue || 0) > 0);
    if (active.length) return active;
    return [{ key: 'empty-revenue', day: 'No revenue yet', orders: 0, revenue: 1 }];
  }, [analyticsSeries]);

  const orderStatusData = useMemo(() => {
    const fallback = [
      { label: 'processing', value: 0 },
      { label: 'shipped', value: 0 },
      { label: 'delivered', value: 0 },
      { label: 'cancelled', value: 0 }
    ];

    const items = [...fallback, ...(stats.orderStatus || [])];
    const map = new Map();
    items.forEach((item) => map.set(item.label, (map.get(item.label) || 0) + (item.value || 0)));
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [stats.orderStatus]);

  const orderStatusChartData = useMemo(() => {
    const active = orderStatusData.filter((item) => Number(item.value || 0) > 0);
    if (active.length) return active;
    return [{ label: 'No orders yet', value: 1 }];
  }, [orderStatusData]);

  const lowStockProducts = useMemo(() => products.filter((product) => Number(product.stock || 0) < 8), [products]);

  const salesGradient = useMemo(() => buildConicGradient(salesChartData, 'orders', ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']), [salesChartData]);
  const orderMixGradient = useMemo(() => buildConicGradient(orderStatusChartData, 'value', ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444']), [orderStatusChartData]);
  const revenueGradient = useMemo(() => buildConicGradient(revenueChartData, 'revenue', ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6']), [revenueChartData]);

  const paymentSummary = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const paidCount = safeOrders.filter((order) => String(order?.payment?.status || '').toLowerCase() === 'paid').length;
    const pendingCount = safeOrders.filter((order) => String(order?.payment?.status || '').toLowerCase() !== 'paid').length;
    const providerMap = new Map();

    safeOrders.forEach((order) => {
      const provider = order?.payment?.provider || 'Manual';
      const current = providerMap.get(provider) || { count: 0, value: 0 };
      providerMap.set(provider, { count: current.count + 1, value: current.value + (order?.totals?.grandTotal || 0) });
    });

    return {
      paidCount,
      pendingCount,
      totalVolume: safeOrders.reduce((sum, order) => sum + (order?.totals?.grandTotal || 0), 0),
      providers: [...providerMap.entries()].map(([label, data]) => ({ label, count: data.count, value: data.value }))
    };
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = productQuery.toLowerCase();
      const matchesQuery = !query || product.title?.toLowerCase().includes(query) || product.category?.toLowerCase().includes(query) || product.brand?.toLowerCase().includes(query);
      const matchesCategory = productCategory === 'all' || product.category === productCategory;
      return matchesQuery && matchesCategory;
    });
  }, [productCategory, productQuery, products]);

  const pagedOrders = useMemo(() => {
    const filtered = orders.filter((order) => statusFilter === 'all' || order.status === statusFilter);
    const start = (currentPage - 1) * 5;
    return filtered.slice(start, start + 5);
  }, [currentPage, orders, statusFilter]);

  const totalPages = Math.max(1, Math.ceil((orders.filter((order) => statusFilter === 'all' || order.status === statusFilter).length || 1) / 5));

  const quickActions = [
    { title: 'Add Product', icon: FiPlus, description: 'Create a new SKU and publish it instantly', path: '/admin/products', hash: 'new-product' },
    { title: 'Add Category', icon: FiPackage, description: 'Introduce a new collection for launches', path: '/admin/settings', hash: 'store-settings' },
    { title: 'View Orders', icon: FiShoppingBag, description: 'Review live orders and fulfillment flow', path: '/admin/orders', hash: 'orders-table' },
    { title: 'Manage Users', icon: FiUsers, description: 'Adjust permissions and team access', path: '/admin/customers', hash: 'customers-panel' }
  ];

  const activityLog = useMemo(() => {
    const activities = [];

    orders.slice(0, 3).forEach((order) => {
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      activities.push({
        title: `Order ${order.status || 'received'}`,
        time: createdAt ? createdAt.toLocaleString() : 'Recently updated',
        detail: `${order.user?.name || 'Guest'} placed ${money(order?.totals?.grandTotal || 0)}`
      });
    });

    reviews.slice(0, 2).forEach((review) => {
      activities.push({
        title: 'Review submitted',
        time: review.createdAt ? new Date(review.createdAt).toLocaleString() : 'Recently added',
        detail: `${review.user?.name || 'Customer'} rated ${review.product?.title || 'the product'} ${review.rating}/5`
      });
    });

    if (lowStockProducts.length) {
      activities.push({
        title: 'Low stock alert',
        time: 'Needs attention',
        detail: `${lowStockProducts[0].title} is running low at ${lowStockProducts[0].stock} items`
      });
    }

    return activities.slice(0, 4);
  }, [lowStockProducts, orders, reviews]);

  const handleQuickAction = (action) => {
    navigate(`${action.path}${action.hash ? `#${action.hash}` : ''}`);
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await apiAdminCreateProduct(toProductPayload(form));
      setForm(emptyProductForm);
      toast.success('Product created');
      load(true);
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
      load(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then((results) => {
      const nextImages = [...(form.imagesText ? form.imagesText.split(',').map((item) => item.trim()).filter(Boolean) : []), ...results];
      setForm((current) => ({ ...current, imagesText: nextImages.join(', ') }));
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} ready to save`);
    });
  };

  const handleEditImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then((results) => {
      const nextImages = [...(editingForm?.imagesText ? editingForm.imagesText.split(',').map((item) => item.trim()).filter(Boolean) : []), ...results];
      setEditingForm((current) => current ? { ...current, imagesText: nextImages.join(', ') } : current);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added to the product`);
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} whileHover={{ y: -4, scale: 1.01 }}>
          <MetricCard title="Total Products" value={stats.totals.products} detail="Available in catalog" icon={FiPackage} accent="from-[#2f7a3e] to-[#ff8c42]" isDarkMode={isDarkMode} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} whileHover={{ y: -4, scale: 1.01 }}>
          <MetricCard title="Orders" value={stats.totals.orders} detail="Live fulfillment requests" icon={FiShoppingBag} accent="from-[#3d8f4c] to-[#ff8c42]" isDarkMode={isDarkMode} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }} whileHover={{ y: -4, scale: 1.01 }}>
          <MetricCard title="Revenue" value={money(stats.totals.revenue)} detail="Gross sales through store" icon={FiDollarSign} accent="from-[#2f7a3e] to-[#ff8c42]" isDarkMode={isDarkMode} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }} whileHover={{ y: -4, scale: 1.01 }}>
          <MetricCard title="Visitors" value="24.8k" detail="Unique sessions this month" icon={FiEye} accent="from-[#3d8f4c] to-[#ff8c42]" isDarkMode={isDarkMode} />
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <ChartCard title="Sales performance" subtitle="Weekly order volume and revenue" isDarkMode={isDarkMode}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/60 shadow-inner" style={{ background: salesGradient }}>
              <div className={`flex h-28 w-28 items-center justify-center rounded-full border text-center ${isDarkMode ? 'border-slate-700 bg-slate-900/90 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Orders</p>
                  <p className="mt-1 text-lg font-semibold">{salesChartData.reduce((sum, item) => sum + Number(item.orders || 0), 0)}</p>
                </div>
              </div>
            </div>
            <div className="mt-1 grid w-full gap-2 sm:grid-cols-2">
              {salesChartData.map((item, index) => (
                <div key={item.day} className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index % 6] }} />
                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.day}</span>
                  </div>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.orders} ord</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Order mix" subtitle="Live distribution by order state" isDarkMode={isDarkMode}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/60 shadow-inner" style={{ background: orderMixGradient }}>
              <div className={`flex h-28 w-28 items-center justify-center rounded-full border text-center ${isDarkMode ? 'border-slate-700 bg-slate-900/90 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Status</p>
                  <p className="mt-1 text-lg font-semibold">{orderStatusChartData.reduce((sum, item) => sum + Number(item.value || 0), 0)}</p>
                </div>
              </div>
            </div>
            <div className="mt-1 grid w-full gap-2">
              {orderStatusChartData.map((item, index) => (
                <div key={item.label} className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'][index % 4] }} />
                    <span className={`capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Recent orders</h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Latest fulfillment and payment activity</p>
            </div>
            <button className={`rounded-full px-3 py-1 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Filter</button>
          </div>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <motion.div key={order._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} whileHover={{ y: -2, scale: 1.005 }} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>#{String(order._id).slice(-6)}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.user?.name || 'Guest'}</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status, isDarkMode)}`}>{order.status}</div>
                <div className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(order?.totals?.grandTotal || 0)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Latest customers</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>High-value shoppers this week</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {customerActivity.map((customer, index) => (
                <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }} whileHover={{ y: -2, scale: 1.005 }} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{customer.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(customer.spent)}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{customer.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Low stock alerts</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Items that need replenishment</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {lowStockProducts.slice(0, 3).map((product) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} whileHover={{ y: -2, scale: 1.005 }} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{product.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.category}</p>
                  </div>
                  <div className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600">{product.stock} left</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Quick actions</h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Common admin workflows in one place</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.title} type="button" onClick={() => handleQuickAction(action)} className={`rounded-2xl border p-4 text-left transition ${isDarkMode ? 'border-slate-800 bg-slate-950/60 hover:border-brand-500/40' : 'border-slate-200 bg-slate-50 hover:border-brand-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-[#2f7a3e] to-[#ff8c42] p-2 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{action.title}</p>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Activity log</h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Recent admin actions and alerts</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {activityLog.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }} whileHover={{ y: -2, scale: 1.005 }} className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div className="rounded-2xl bg-emerald-500/15 p-2 text-emerald-600">
                  <FiActivity className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</p>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.detail}</p>
                  <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Product management</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add, search, filter, edit, and remove inventory with ease.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDarkMode ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
              <FiSearch className="h-4 w-4 text-slate-400" />
              <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} className={`bg-transparent text-sm outline-none ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} placeholder="Search products" />
            </label>
            <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className={`rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form id="new-product" onSubmit={createProduct} className={`rounded-[1.5rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Create product</h4>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Publish new inventory quickly.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <TextInput value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Title" />
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput value={form.brand} onChange={(e) => setForm((current) => ({ ...current, brand: e.target.value }))} placeholder="Brand" />
                <Select value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} placeholder="Price" type="number" min="0" />
                <TextInput value={form.compareAtPrice} onChange={(e) => setForm((current) => ({ ...current, compareAtPrice: e.target.value }))} placeholder="Compare at price" type="number" min="0" />
              </div>
              <TextInput value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} placeholder="Stock" type="number" min="0" />
              <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" className={`min-h-28 w-full rounded-2xl border px-4 py-3 outline-none focus:border-emerald-400 ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`} />
              <label className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                <FiImage className="h-4 w-4" />
                Upload images
                <input type="file" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              <TextInput value={form.imagesText} onChange={(e) => setForm((current) => ({ ...current, imagesText: e.target.value }))} placeholder="Image URLs or data URLs" />
              <TextInput value={form.flashSaleEndsAt} onChange={(e) => setForm((current) => ({ ...current, flashSaleEndsAt: e.target.value }))} placeholder="Flash sale ends at" type="datetime-local" />
              <label className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={form.isFlashSale} onChange={(e) => setForm((current) => ({ ...current, isFlashSale: e.target.checked }))} /> Flash sale
              </label>
              <Button className="w-full">Create product</Button>
            </div>
          </form>

          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className={`rounded-[1.5rem] border border-dashed p-5 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>No products match the current filters.</div>
            ) : filteredProducts.map((product) => (
              <div key={product._id} className={`flex flex-col gap-4 rounded-[1.5rem] border p-4 md:flex-row md:items-center md:justify-between ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
                <div>
                  <p className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{product.title}</p>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.category} • {product.brand || 'No brand'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{money(product.price)}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.stock < 8 ? 'bg-amber-500/15 text-amber-600' : isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{product.stock} in stock</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openEditProduct(product)} className={`rounded-2xl px-3 py-2 text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="inline-flex items-center gap-2"><FiEdit2 className="h-4 w-4" /> Edit</span>
                  </button>
                  <button onClick={async () => { await apiAdminDeleteProduct(product._id); toast.success('Deleted'); load(true); }} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                    <span className="inline-flex items-center gap-2"><FiTrash2 className="h-4 w-4" /> Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Order management</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Keep deliveries on track and keep customers updated.</p>
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className={`rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <option value="all">All orders</option>
              <option value="processing">processing</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>

        <div className={`mt-6 overflow-x-auto rounded-[1.5rem] border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className={`min-w-[640px] w-full text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <thead className={`${isDarkMode ? 'bg-slate-950/90' : 'bg-slate-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Order</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => (
                <tr key={order._id} className={`border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">#{String(order._id).slice(-6)}</td>
                  <td className="px-4 py-3">{order.user?.name || 'Guest'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status, isDarkMode)}`}>{order.status}</span></td>
                  <td className="px-4 py-3 font-semibold">{money(order?.totals?.grandTotal || 0)}</td>
                  <td className="px-4 py-3">
                    <select defaultValue={order.status} onChange={async (e) => { await apiAdminUpdateOrderStatus(order._id, e.target.value); toast.success('Status updated'); load(true); }} className={`rounded-xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className={`rounded-2xl px-3 py-2 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Previous</button>
            <button onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} className={`rounded-2xl px-3 py-2 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Customer intelligence</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>High-value relationships and recent interactions.</p>
          </div>
          <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-700">+18% retention</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {customerActivity.map((customer) => (
            <div key={customer.id} className={`rounded-[1.5rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{customer.name}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{customer.email}</p>
                </div>
                <div className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-700">VIP</div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lifetime spend</span>
                <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(customer.spent)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div id="revenue-metrics" className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Visitors" value="24.8k" detail="Monthly traffic" icon={FiEye} accent="from-[#2f7a3e] to-[#ff8c42]" isDarkMode={isDarkMode} />
        <MetricCard title="Page views" value="62.4k" detail="Engaged sessions" icon={FiTrendingUp} accent="from-[#3d8f4c] to-[#ff8c42]" isDarkMode={isDarkMode} />
        <MetricCard title="Conversion" value="4.8%" detail="Storewide rate" icon={FiRefreshCw} accent="from-[#2f7a3e] to-[#ff8c42]" isDarkMode={isDarkMode} />
        <MetricCard title="Top seller" value={stats.topProducts?.[0]?.label || 'N/A'} detail="Highest revenue item" icon={FiZap} accent="from-[#2f7a3e] to-[#ff8c42]" isDarkMode={isDarkMode} />
      </div>

      <div id="analytics-panel" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Revenue trend" subtitle="Order activity over the last 6 days" isDarkMode={isDarkMode}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/60 shadow-inner" style={{ background: revenueGradient }}>
              <div className={`flex h-28 w-28 items-center justify-center rounded-full border text-center ${isDarkMode ? 'border-slate-700 bg-slate-900/90 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Revenue</p>
                  <p className="mt-1 text-lg font-semibold">{money(revenueChartData.reduce((sum, item) => sum + Number(item.revenue || 0), 0))}</p>
                </div>
              </div>
            </div>
            <div className="mt-1 grid w-full gap-2 sm:grid-cols-2">
              {revenueChartData.map((item, index) => (
                <div key={item.day} className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'][index % 6] }} />
                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.day}</span>
                  </div>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Top-selling products</h3>
          <div className="mt-4 space-y-3">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.label} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{index + 1}. {product.label}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.quantity} units sold</p>
                </div>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(product.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Payments</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track completed, pending, and provider-based transactions.</p>
          </div>
          <div className="rounded-full bg-[#eaf6eb] px-3 py-1 text-sm font-semibold text-[#2f7a3e]">Live payment overview</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#eaf6eb] p-2 text-[#2f7a3e]">
                <FiCheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Completed</p>
                <p className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{paymentSummary.paidCount}</p>
              </div>
            </div>
          </div>
          <div className={`rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fff1e8] p-2 text-[#ff8c42]">
                <FiClock className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending</p>
                <p className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{paymentSummary.pendingCount}</p>
              </div>
            </div>
          </div>
          <div className={`rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#eaf6eb] p-2 text-[#2f7a3e]">
                <FiCreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Volume</p>
                <p className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{money(paymentSummary.totalVolume)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}">
          <table className={`min-w-[640px] w-full text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <thead className={`${isDarkMode ? 'bg-slate-950/90' : 'bg-slate-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Order</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Provider</th>
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className={`border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">#{String(order._id).slice(-6)}</td>
                  <td className="px-4 py-3">{order.user?.name || 'Guest'}</td>
                  <td className="px-4 py-3">{order.payment?.provider || 'Manual'}</td>
                  <td className="px-4 py-3">{order.payment?.reference || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{money(order?.totals?.grandTotal || 0)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${String(order?.payment?.status || '').toLowerCase() === 'paid' ? (isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700') : (isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700')}`}>{order.payment?.status || 'pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>Store settings</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tune operational behavior without leaving the dashboard.</p>
          </div>
          <button onClick={() => toast.success('Settings saved')} className="rounded-2xl bg-gradient-to-r from-[#2f7a3e] to-[#ff8c42] px-4 py-2 text-sm font-semibold text-white">Save changes</button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            { key: 'maintenance', title: 'Maintenance mode', description: 'Pause storefront access for scheduled updates.' },
            { key: 'autoApprove', title: 'Auto-approve reviews', description: 'Publish customer feedback automatically.' },
            { key: 'lowStockAlert', title: 'Low-stock alerts', description: 'Notify ops before inventory runs thin.' },
            { key: 'emailDigest', title: 'Weekly email digest', description: 'Share a summary of sales and orders.' },
            { key: 'flashSales', title: 'Flash sale visibility', description: 'Show featured campaigns in the storefront hero area.' },
            { key: 'freeShipping', title: 'Free shipping threshold', description: 'Enable free shipping above a set cart value.' },
            { key: 'inventorySync', title: 'Inventory sync', description: 'Keep stock counts aligned with live admin edits.' },
            { key: 'promoEmails', title: 'Promo email outreach', description: 'Send promotional updates to subscribed shoppers.' }
          ].map((item) => (
            <label key={item.key} className={`flex items-start justify-between rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</p>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
              </div>
              <input type="checkbox" checked={Boolean(settings[item.key])} onChange={(e) => setSettings((current) => ({ ...current, [item.key]: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className={`rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Store preferences</h4>
            <div className="mt-4 space-y-3">
              <label className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-white text-slate-700'}`}>
                <span>Default currency</span>
                <select className={`rounded-xl border px-2 py-2 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <option>NGN</option>
                  <option>USD</option>
                </select>
              </label>
              <label className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-white text-slate-700'}`}>
                <span>Featured collection</span>
                <select className={`rounded-xl border px-2 py-2 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <option>Phones</option>
                  <option>Accessories</option>
                  <option>Deals</option>
                </select>
              </label>
            </div>
          </div>

          <div className={`rounded-[1.4rem] border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className={`text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Operational notes</h4>
            <div className="mt-4 rounded-2xl border border-dashed border-[#2f7a3e]/30 bg-[#f7fcf7] p-4 text-sm text-slate-700">
              <p>• Review campaign schedule before launching new flash sales.</p>
              <p className="mt-2">• Keep notification preferences aligned with peak order times.</p>
              <p className="mt-2">• Confirm inventory sync before weekend promotions begin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const sectionMap = {
    overview: renderOverview(),
    products: renderProducts(),
    orders: renderOrders(),
    customers: renderCustomers(),
    analytics: renderAnalytics(),
    payments: renderPayments(),
    settings: renderSettings()
  };

  return (
    <AdminShell
      title={view === 'overview' ? 'Overview' : view.charAt(0).toUpperCase() + view.slice(1)}
      subtitle={view === 'overview' ? 'Premium operations center for your storefront' : `Manage ${view} with precision`}
      action={<button type="button" onClick={() => { load(true); toast.success('Dashboard synced'); }} className="rounded-2xl bg-gradient-to-r from-[#2f7a3e] to-[#ff8c42] px-4 py-2 text-sm font-semibold text-white">Sync now</button>}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
    >
      {sectionMap[view]}

      {editingProduct && editingForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8" onClick={() => { setEditingProduct(null); setEditingForm(null); }}>
          <div className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-950'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Edit product</p>
                <h3 className={`mt-1 text-2xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>{editingProduct.title}</h3>
              </div>
              <button type="button" onClick={() => { setEditingProduct(null); setEditingForm(null); }} className={`rounded-full px-3 py-1 text-sm font-bold ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Close</button>
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
              <textarea value={editingForm.description} onChange={(e) => setEditingForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" className="md:col-span-2 min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400" />
              <label className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm md:col-span-2 ${isDarkMode ? 'border-slate-800 bg-slate-950/60 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <FiImage className="h-4 w-4" />
                Add more images
                <input type="file" multiple className="hidden" onChange={handleEditImageUpload} />
              </label>
              <TextInput value={editingForm.imagesText} onChange={(e) => setEditingForm((current) => ({ ...current, imagesText: e.target.value }))} placeholder="Image URLs, comma separated" className="md:col-span-2" />
              <label className={`flex items-center gap-2 text-sm font-semibold md:col-span-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={editingForm.isFlashSale} onChange={(e) => setEditingForm((current) => ({ ...current, isFlashSale: e.target.checked }))} /> Flash sale
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setEditingProduct(null); setEditingForm(null); }} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">Cancel</button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
