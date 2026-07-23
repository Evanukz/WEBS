import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBarChart2,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiCreditCard,
  FiGrid,
  FiMenu,
  FiMoon,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiSun,
  FiTruck,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'overview', label: 'Overview', icon: FiGrid, path: '/admin' },
  { id: 'products', label: 'Inventory', icon: FiPackage, path: '/admin/products' },
  { id: 'orders', label: 'Orders', icon: FiShoppingBag, path: '/admin/orders' },
  { id: 'customers', label: 'Customers', icon: FiUsers, path: '/admin/customers' },
  { id: 'analytics', label: 'Reports', icon: FiBarChart2, path: '/admin/analytics' },
  { id: 'fulfillment', label: 'Fulfillment', icon: FiTruck, path: '/admin/orders' },
  { id: 'payments', label: 'Payments', icon: FiCreditCard, path: '/admin/payments' },
  { id: 'storefront', label: 'Storefront', icon: FiCompass, path: '/' },
  { id: 'settings', label: 'Settings', icon: FiSettings, path: '/admin/settings' }
];

export default function AdminShell({ children, title, subtitle, action, isDarkMode, setIsDarkMode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[radial-gradient(circle_at_top_left,_#f5fbf4,_#ffffff_50%,_#fff7ed_100%)] text-slate-950'}`}>
      <div className="flex min-h-screen">
        <div className={`fixed inset-0 z-20 transition lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-slate-950/60 transition ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        </div>

        <aside className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r px-4 py-5 transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isDarkMode ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/90 backdrop-blur-xl'}`} style={{ width: collapsed ? 88 : 260 }}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f7a3e] to-[#ff8c42] text-lg font-semibold text-white shadow-lg">
                Y
              </div>
              {!collapsed && <div>
                <p className="text-sm font-semibold">Yamskis</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin Console</p>
              </div>}
            </div>
            <button type="button" onClick={() => setCollapsed((value) => !value)} className={`rounded-full p-2 transition ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
              {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePath === item.path;
              return (
                <Link key={item.id} to={item.path} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${active ? 'bg-gradient-to-r from-[#2f7a3e] to-[#ff8c42] text-white shadow-lg' : isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`rounded-3xl border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f7a3e] to-[#ff8c42] text-sm font-semibold text-white">A</div>
              {!collapsed && <div>
                <p className="text-sm font-semibold">Yami</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Operations Lead</p>
              </div>}
            </div>
          </div>
        </aside>

        <div className="flex-1 pl-0 lg:pl-[260px]" style={{ paddingLeft: collapsed ? 88 : 260 }}>
          <header className={`sticky top-0 z-20 border-b px-4 py-4 sm:px-6 lg:px-8 ${isDarkMode ? 'border-slate-800 bg-slate-950/90 backdrop-blur' : 'border-slate-200 bg-white/80 backdrop-blur'}`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <button type="button" onClick={() => setMobileOpen((value) => !value)} className={`rounded-2xl p-2.5 ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                  {mobileOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Operations • {title}</p>
                <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>{subtitle}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                  <FiSearch className="h-4 w-4 text-slate-400" />
                  <input className={`bg-transparent text-sm outline-none ${isDarkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`} placeholder="Search" />
                </label>
                <div className="relative">
                  <button type="button" onClick={() => setShowNotifications((value) => !value)} className={`rounded-2xl p-2.5 transition ${notificationsEnabled ? (isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-700') : 'bg-[#fff1e8] text-[#ff8c42]'}`}>
                    <FiBell className="h-4 w-4" />
                  </button>
                  {showNotifications && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl border p-3 shadow-xl ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Notifications</p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage admin alerts</p>
                        </div>
                        <button type="button" onClick={() => setNotificationsEnabled((value) => !value)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${notificationsEnabled ? 'bg-[#eaf6eb] text-[#2f7a3e]' : 'bg-slate-200 text-slate-700'}`}>
                          {notificationsEnabled ? 'On' : 'Off'}
                        </button>
                      </div>
                      <div className={`mt-3 rounded-2xl border px-3 py-2 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                        {notificationsEnabled ? 'Live alerts are enabled for new orders and low-stock updates.' : 'Alerts are paused until you switch them back on.'}
                      </div>
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setIsDarkMode((value) => !value)} className={`rounded-2xl p-2.5 ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                  {isDarkMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                </button>
                {action}
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div key={activePath} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
