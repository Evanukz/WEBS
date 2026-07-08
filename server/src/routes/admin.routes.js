import { Router } from 'express';

import { authJwt } from '../middleware/authJwt.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';

import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';

const adminRouter = Router();

adminRouter.use(authJwt, requireAdmin);

adminRouter.get(
  '/orders',
  asyncHandler(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    res.json({ orders });
  })
);

adminRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const [orders, products, reviews] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name').lean(),
      Product.find().sort({ createdAt: -1 }).limit(200).lean(),
      Review.find().populate('user', 'name').populate('product', 'title').sort({ createdAt: -1 }).limit(100).lean()
    ]);

    const [orderStatusAgg, topProductsAgg, ratingDistributionAgg] = await Promise.all([
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.title', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }, quantity: { $sum: '$items.qty' } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      Review.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);

    const orderStatus = orderStatusAgg.map((item) => ({ label: item._id || 'unknown', value: item.count }));
    const topProducts = topProductsAgg.map((item) => ({ label: item._id || 'Product', value: item.revenue, quantity: item.quantity }));
    const ratingDistribution = ratingDistributionAgg.map((item) => ({ rating: item._id, count: item.count }));
    const revenue = orders.reduce((sum, order) => sum + (order.totals?.grandTotal || 0), 0);

    res.json({
      orders,
      products,
      reviews,
      stats: {
        totals: {
          orders: orders.length,
          products: products.length,
          reviews: reviews.length,
          revenue
        },
        orderStatus,
        topProducts,
        ratingDistribution
      }
    });
  })
);

adminRouter.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) throw new AppError('status is required');

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) throw new AppError('Order not found', 404);

    res.json({ order });
  })
);

adminRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = req.body;
    const required = ['title', 'price', 'category'];
    for (const k of required) {
      if (data?.[k] === undefined || data?.[k] === '') throw new AppError(`${k} is required`);
    }

    const product = await Product.create({
      title: data.title,
      brand: data.brand || '',
      description: data.description || '',
      price: Number(data.price),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      images: Array.isArray(data.images) ? data.images : [],
      category: data.category,
      stock: data.stock !== undefined ? Number(data.stock) : 0,
      isFlashSale: Boolean(data.isFlashSale),
      flashSaleEndsAt: data.flashSaleEndsAt ? new Date(data.flashSaleEndsAt) : undefined
    });

    res.status(201).json({ product });
  })
);

adminRouter.patch(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) throw new AppError('Product not found', 404);
    res.json({ product });
  })
);

adminRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.json({ ok: true });
  })
);

export { adminRouter };

// Admin: Fill missing product images on demand
adminRouter.post(
  '/images/fill-missing',
  asyncHandler(async (_req, res) => {
    // Small inline image generator to avoid extra imports
    function img(seed, suffix) {
      const color = seed % 2 === 0 ? '#ff7a18' : '#111827';
      const bg = encodeURIComponent(color);
      const text = encodeURIComponent('YAMSKIS');
      const label = encodeURIComponent(suffix);
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
        <rect width="100%" height="100%" fill="${bg}"/>
        <text x="50%" y="45%" font-family="Arial" font-size="64" text-anchor="middle" fill="#ffffff">${text}</text>
        <text x="50%" y="60%" font-family="Arial" font-size="34" text-anchor="middle" fill="#ffffff">${label}</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    const products = await Product.find();
    const updated = [];

    for (const p of products) {
      if (!p.images || (Array.isArray(p.images) && p.images.length === 0) || (typeof p.images === 'string' && p.images === '')) {
        const seed = Math.floor(Math.random() * 10000);
        p.images = [img(seed, p.category || 'Product')];
        await p.save();
        updated.push(p._id);
      }
    }

    res.json({ updatedCount: updated.length, updatedIds: updated });
  })
);

