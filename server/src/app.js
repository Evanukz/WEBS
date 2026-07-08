import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { authRouter } from './routes/auth.routes.js';
import { productsRouter } from './routes/products.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { wishlistRouter } from './routes/wishlist.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { adminRouter } from './routes/admin.routes.js';

const app = express();

app.use(helmet());
const clientOrigin = process.env.CLIENT_ORIGIN || '*';
const allowedOrigins = clientOrigin.split(',').map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

const clientDistPath = path.resolve(process.cwd(), '../yamskis/dist');
if (existsSync(clientDistPath)) {
	app.use(express.static(clientDistPath));
	app.get(/^(?!\/api).*/, (_req, res) => {
		res.sendFile(path.join(clientDistPath, 'index.html'));
	});
}

export { app };

