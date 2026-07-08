import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { apiLogin, setAuthTokenHeader } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function LoginPage() {
  const [email, setEmail] = useState('user@yamskis.com');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={submit} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <h1 className="text-3xl font-black text-slate-950">Login</h1>
          <p className="mt-2 text-sm text-slate-600">Use your account to manage cart, wishlist, and orders.</p>
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button disabled={loading} className="w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            No account? <Link className="font-bold text-brand-700" to="/register">Register</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
