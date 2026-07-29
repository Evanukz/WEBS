import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import placeholderImage, { imgFallback } from '../../utils/imagePlaceholder.js';

export default function ProductCard({ product, onToggleWishlist, wished = false }) {
  const fallbackLabel = product?.title || product?.category || 'Product';
  const img = product?.images?.[0] || placeholderImage(fallbackLabel);
  const price = product?.price ?? 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <Link to={`/product/${product._id}`}>
          <div className="aspect-[4/3] overflow-hidden bg-slate-50">
            <img src={img} alt={product.title} className="h-full w-full object-cover transition group-hover:scale-105" onError={imgFallback(fallbackLabel)} />
          </div>
        </Link>

        {product?.isFlashSale ? (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm">Flash</div>
        ) : null}

        <button
          onClick={() => onToggleWishlist?.(product._id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 ring-1 ring-slate-200 backdrop-blur hover:text-brand-600"
          aria-label="Toggle wishlist"
        >
          <FiHeart className={wished ? 'fill-brand-500 text-brand-600' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-brand-700">
          {product.category}
        </div>

        <Link to={`/product/${product._id}`} className="block min-h-[3rem] text-[15px] font-black leading-snug text-slate-950">
          {product.title}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-black text-brand-700">₦{price.toLocaleString()}</div>
            {product?.compareAtPrice ? (
              <div className="text-xs font-semibold text-slate-400 line-through">₦{product.compareAtPrice.toLocaleString()}</div>
            ) : null}
          </div>
          <div className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700">
            ⭐ {product.ratingAvg?.toFixed?.(1) || '0.0'}
          </div>
        </div>
      </div>
    </div>
  );
}

