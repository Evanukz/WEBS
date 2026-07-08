import { Router } from 'express';

import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { Product } from '../models/Product.js';

const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, flash } = req.query;

    const filter = {};
    if (category) filter.category = category;

    if (flash === 'true') {
      filter.isFlashSale = true;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(60);
    res.json({ products });
  })
);

productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.json({ product });
  })
);

export { productsRouter };

