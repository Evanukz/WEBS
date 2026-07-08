import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { User } from '../models/User.js';
import { authJwt } from '../middleware/authJwt.js';

const jwtSecret = process.env.JWT_SECRET || 'yamskis-dev-secret';

const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new AppError('name, email, password are required');

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new AppError('Email already in use', 409);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash, role: 'user' });

    const token = jwt.sign({ sub: user._id, role: user.role }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('Invalid credentials', 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign({ sub: user._id, role: user.role }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

authRouter.get(
  '/me',
  authJwt,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export { authRouter };

