import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-[96rem] px-4 py-10 lg:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-lg font-black text-brand-600">yamskis</div>
            <p className="mt-2 text-sm text-slate-600">Modern e-commerce demo for 2026.</p>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">Support</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">Social</div>
            <div className="mt-3 flex items-center gap-3">
              <Link className="rounded-full bg-slate-50 p-2 text-slate-700 hover:text-brand-600" to="/search" aria-label="Facebook">
                <FaFacebookF />
              </Link>
              <Link className="rounded-full bg-slate-50 p-2 text-slate-700 hover:text-brand-600" to="/wishlist" aria-label="Instagram">
                <FaInstagram />
              </Link>
              <Link className="rounded-full bg-slate-50 p-2 text-slate-700 hover:text-brand-600" to="/profile" aria-label="Twitter">
                <FaTwitter />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} yamskis. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

