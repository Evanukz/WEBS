import { Router } from 'express';

import { authJwt } from '../middleware/authJwt.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { nanoid } from 'nanoid';

import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const ordersRouter = Router();

ordersRouter.get(
  '/me',
  authJwt,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ orders });
  })
);

ordersRouter.post(
  '/checkout',
  authJwt,
  asyncHandler(async (req, res) => {
    const { cart, totals, shippingAddress } = req.body;
    if (!Array.isArray(cart) || cart.length === 0) throw new AppError('Cart is empty');

    const validatedItems = [];
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError('Invalid product in cart');

      const qty = Number(item.qty || 1);
      validatedItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        qty,
        image: product.images?.[0] || ''
      });
    }

    const subtotal = validatedItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const shipping = Number(totals?.shipping || 0);
    const tax = Number(totals?.tax || 0);
    const grandTotal = subtotal + shipping + tax;

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      totals: { subtotal, shipping, tax, grandTotal },
      payment: { status: 'unpaid', provider: req.body?.paymentProvider || '', reference: nanoid(10) },
      status: 'processing',
      shippingAddress: shippingAddress || {}
    });

    res.status(201).json({ orderId: order._id, order });
  })
);

ordersRouter.get(
  '/:id',
  authJwt,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);

    const isOwner = String(order.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      throw new AppError('Forbidden', 403);
    }

    res.json({ order });
  })
);

export { ordersRouter };

