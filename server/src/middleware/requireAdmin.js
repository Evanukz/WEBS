import { AppError } from '../lib/errors.js';

function requireAdmin(req, _res, next) {
  if (!req.user?.role || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: admin only', 403));
  }
  next();
}

export { requireAdmin };

