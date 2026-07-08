import { Link, useNavigate } from 'react-router-dom';
import { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

import { AuthContext } from '../../state/AuthContext.jsx';

export default function Navbar({ categories = [] }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const searchSuggestions = useMemo(() => categories.slice(0, 6), [categories]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ q });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 lg:px-6">
        <Link to="/" className="text-xl font-black tracking-tight text-brand-600">
          yamskis
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <div className="relative" ref={null}>
            {/* Categories dropdown */}
            <CategoriesDropdown categories={categories} />
          </div>

          <Link className="text-sm font-semibold text-slate-700 hover:text-brand-600" to="/">
            Home
          </Link>
          <Link className="text-sm font-semibold text-slate-700 hover:text-brand-600" to="/search">
            Deals
          </Link>
          {user?.role === 'admin' ? (
            <Link className="text-sm font-semibold text-slate-700 hover:text-brand-600" to="/admin">
              Admin
            </Link>
          ) : null}
          <Link className="text-sm font-semibold text-slate-700 hover:text-brand-600" to="/wishlist">
            Wishlist
          </Link>
        </nav>

        <div className="flex-1" />

        <form onSubmit={onSubmit} className="relative hidden w-full max-w-xl md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands..."
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {/* Popular suggestions removed per request */}
        </form>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="hidden rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 md:inline-flex">
            Cart
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {user?.name?.split(' ')[0] || 'Account'}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-brand-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link className="rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700" to="/login">
                Login
              </Link>
              <Link className="rounded-full bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function CategoriesDropdown({ categories = [] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const goCategory = (c) => {
    setOpen(false);
    const params = new URLSearchParams({ category: c });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm font-semibold text-slate-700 hover:text-brand-600"
      >
        Categories
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No categories</div>
          ) : (
            categories.map((c) => (
              <button
                key={c}
                onClick={() => goCategory(c)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                {c}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

