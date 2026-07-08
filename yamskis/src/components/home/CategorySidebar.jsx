import { Link } from 'react-router-dom';

export default function CategorySidebar({ categories = [] }) {
  return (
    <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="px-1 text-sm font-black text-slate-900">Categories</div>
      <div className="mt-3 space-y-2">
        {categories.map((c) => (
          <Link
            key={c}
            to={`/category/${encodeURIComponent(c)}`}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <span>{c}</span>
            <span className="text-xs text-slate-400">›</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

