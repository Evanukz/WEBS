import { Router } from 'express';

import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { authJwt } from '../middleware/authJwt.js';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

const reviewsRouter = Router();

reviewsRouter.get(
  '/product/:productId',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ reviews });
  })
);

reviewsRouter.post(
  '/product/:productId',
  authJwt,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating) throw new AppError('rating is required');

    const productId = req.params.productId;

    const existing = await Review.findOne({ user: req.user._id, product: productId });

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, product: productId },
      { rating, comment: comment || '' },
      { new: true, upsert: true }
    );

    // Recompute product rating summary
    const agg = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const summary = agg[0] || { avg: 0, count: 0 };

    await Product.findByIdAndUpdate(productId, {
      ratingAvg: summary.avg,
      ratingCount: summary.count
    });

    res.json({ review });
  })
);

export { reviewsRouter };

