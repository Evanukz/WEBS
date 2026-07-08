import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './lib/db.js';
import { seedIfEmpty } from './seed/seed.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const port = process.env.PORT || 5000;

function startServer(portToTry, attempts = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(portToTry, () => {
      // eslint-disable-next-line no-console
      console.log(`yamskis server running on http://localhost:${portToTry}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts > 1) {
        // eslint-disable-next-line no-console
        console.warn(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
        startServer(portToTry + 1, attempts - 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

async function bootstrap() {
  await connectDB();

  // Seed dummy data on startup if collections are empty.
  await seedIfEmpty();

  app.use(notFoundHandler);
  app.use(errorHandler);

  await startServer(Number(port));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

