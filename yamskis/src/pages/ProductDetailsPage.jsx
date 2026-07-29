import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShoppingCart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import placeholderImage, { imgFallback } from '../utils/imagePlaceholder.js';
import { CartContext } from '../state/CartContext.jsx';
import { WishlistContext } from '../state/WishlistContext.jsx';
import { AuthContext } from '../state/AuthContext.jsx';
import { apiAddReview, apiProductById, apiProducts, apiReviews } from '../api/client.js';
import { categories, money } from '../data/catalog.js';

function Stars({ value = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar key={index} className={index < Math.round(value) ? 'text-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [qty, setQty] = useState(1);
  const { addToCart } = useContext(CartContext);
  const { toggle, isWished } = useContext(WishlistContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const data = await apiProductById(productId);
        if (!active) return;
        setProduct(data.product || null);

        const [reviewData, relatedData] = await Promise.all([
          apiReviews(productId),
          apiProducts({ category: data.product?.category })
        ]);

        if (!active) return;
        setReviews(reviewData.reviews || []);
        setRelated((relatedData.products || []).filter((item) => item._id !== data.product?._id).slice(0, 4));
      } catch (error) {
        if (!active) return;
        toast.error(error?.response?.data?.message || 'Failed to load product');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const mainImage = product.images?.[0] || placeholderImage(product.title || product.category || 'Product');
    addToCart({ productId: product._id, title: product.title, price: product.price, image: mainImage, qty });
    toast.success('Added to cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!product) return;

    try {
      setSubmittingReview(true);
      await apiAddReview(product._id, { rating: reviewRating, comment: reviewComment });
      const [reviewData, productData] = await Promise.all([apiReviews(product._id), apiProductById(product._id)]);
      setReviews(reviewData.reviews || []);
      setProduct(productData.product || product);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review saved');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewAverage = useMemo(() => {
    if (!reviews.length) return product?.ratingAvg || 0;
    return reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;
  }, [product?.ratingAvg, reviews]);

  const ratingBreakdown = useMemo(
    () => [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((item) => Number(item.rating) === rating).length })),
    [reviews]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar categories={categories} />
        <main className="mx-auto max-w-[96rem] px-4 py-10 lg:px-6 xl:px-8">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">Loading product...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar categories={categories} />
        <main className="mx-auto max-w-[96rem] px-4 py-10 lg:px-6 xl:px-8">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
            <h1 className="text-2xl font-black text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-600">The product may have been removed or the link is invalid.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar categories={categories} />
      <main className="mx-auto max-w-[96rem] px-4 py-6 lg:px-6 xl:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
            <img src={product.images?.[0] || placeholderImage(product.title || product.category || 'Product')} alt={product.title} className="h-[420px] w-full object-cover" onError={imgFallback(product.title || product.category || 'Product')} />
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-600">{product.category}</div>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{product.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{product.description}</p>

            <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1 text-brand-700"><FiStar /> {product.ratingAvg.toFixed(1)}</span>
              <span>{product.ratingCount} reviews</span>
              <span>{product.stock} in stock</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <div className="text-3xl font-black text-brand-700">{money(product.price)}</div>
              {product.compareAtPrice ? <div className="pb-1 text-sm text-slate-400 line-through">{money(product.compareAtPrice)}</div> : null}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
                <Stars value={reviewAverage} />
                <span>{reviewAverage.toFixed(1)} avg</span>
                <span>{reviews.length || product.ratingCount} reviews</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                {ratingBreakdown.map((item) => (
                  <div key={item.rating} className="flex items-center gap-3">
                    <span className="w-10 font-bold">{item.rating} stars</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${reviews.length ? (item.count / reviews.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">
                Qty
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="ml-3 w-24 rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <button onClick={handleAddToCart} className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white">
                <FiShoppingCart /> Add to cart
              </button>
              <button
                onClick={() => toggle(product._id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-800"
              >
                <FiHeart className={isWished(product._id) ? 'fill-brand-500 text-brand-600' : ''} /> Wishlist
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {isAuthenticated ? `Signed in as ${user?.name || 'customer'} and ready to leave a review.` : 'Login to add reviews, manage your cart, and save wishlist items.'}
            </div>
          </section>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-brand-600">
              <FiMessageCircle /> Reviews
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">What buyers are saying</h2>
            <div className="mt-5 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No reviews yet. Be the first to leave feedback.</div>
              ) : (
                reviews.map((review) => (
                  <article key={review._id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-black text-slate-950">{review.user?.name || 'Verified buyer'}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2"><Stars value={review.rating} /></div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment || 'No comment added.'}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm font-black uppercase tracking-[0.25em] text-brand-600">Leave a review</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Rate this product</h2>

            {isAuthenticated ? (
              <form onSubmit={submitReview} className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Rating
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} stars</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Comment
                  <textarea
                    rows="5"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other shoppers what you thought about the product."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <button
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                >
                  {submittingReview ? 'Saving...' : 'Submit review'}
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                Sign in to leave a review and join the conversation.
                <div className="mt-4">
                  <Link to="/login" className="inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">Sign in</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">Related products</h2>
            <Link to="/search" className="text-sm font-bold text-brand-700">View all</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((item) => (
              <Link key={item._id} to={`/product/${item._id}`} className="rounded-2xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                <img src={item.images?.[0] || placeholderImage(item.title || item.category || 'Product')} alt={item.title} className="aspect-[4/3] w-full rounded-xl object-cover" onError={imgFallback(item.title || item.category || 'Product')} />
                <div className="mt-3 text-sm font-extrabold text-slate-950">{item.title}</div>
                <div className="mt-1 text-sm font-black text-brand-700">{money(item.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
