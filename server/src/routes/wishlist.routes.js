import { Router } from 'express';

import { authJwt } from '../middleware/authJwt.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';

const wishlistRouter = Router();

wishlistRouter.get(
  '/',
  authJwt,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  })
);

wishlistRouter.post(
  '/toggle/:productId',
  authJwt,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new AppError('Product not found', 404);

    const user = await User.findById(req.user._id);
    const exists = user.wishlist.some((id) => id.toString() === req.params.productId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    } else {
      user.wishlist.push(product._id);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  })
);

export { wishlistRouter };

