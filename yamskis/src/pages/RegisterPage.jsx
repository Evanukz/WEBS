import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { apiRegister, setAuthTokenHeader } from '../api/client.js';
import { categories } from '../data/catalog.js';

export default function RegisterPage() {
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@yamskis.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await apiRegister({ name, email, password });
      login(data);
      setAuthTokenHeader();
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={submit} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <h1 className="text-3xl font-black text-slate-950">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Join yamskis for faster checkout and order tracking.</p>
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button disabled={loading} className="w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account? <Link className="font-bold text-brand-700" to="/login">Login</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
