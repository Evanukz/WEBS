import { Router } from 'express';

import { authJwt } from '../middleware/authJwt.js';
import { asyncHandler } from '../lib/asyncHandler.js';

// Simple server-side cart stored on user document (embedded) would be ideal,
// but to keep schema small, we’ll accept cart items from client and echo validation.
// This provides endpoints structure for future refinement.

const cartRouter = Router();

cartRouter.get(
  '/',
  authJwt,
  asyncHandler(async (_req, res) => {
    res.json({ cart: [] });
  })
);

// Placeholder for syncing cart state.
cartRouter.post(
  '/sync',
  authJwt,
  asyncHandler(async (req, res) => {
    res.json({ cart: req.body?.cart || [] });
  })
);

export { cartRouter };

