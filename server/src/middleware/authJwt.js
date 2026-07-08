import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../lib/errors.js';

const jwtSecret = process.env.JWT_SECRET || 'yamskis-dev-secret';

async function authJwt(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw new AppError('Unauthorized', 401);

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, jwtSecret);

    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) throw new AppError('Unauthorized', 401);

    req.user = user;
    next();
  } catch (e) {
    next(new AppError(e.message || 'Unauthorized', 401));
  }
}

export { authJwt };

