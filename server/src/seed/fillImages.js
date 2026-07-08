import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../lib/db.js';
import { Product } from '../models/Product.js';

function img(seed, suffix) {
  const keyword = String(suffix || 'product').trim().replace(/&/g, 'and');
  const query = encodeURIComponent(keyword);
  return `https://source.unsplash.com/900x900/?${query}&sig=${seed}`;
}

async function main() {
  await connectDB();

  const products = await Product.find();
  const updates = [];
  let updatedCount = 0;

  for (const p of products) {
    if (!p.images || (Array.isArray(p.images) && p.images.length === 0) || (typeof p.images === 'string' && p.images === '')) {
      const seed = Math.floor(Math.random() * 10000);
      p.images = [img(seed, p.category || 'Product')];
      updates.push(p.save());
      updatedCount++;
    }
  }

  if (updates.length > 0) await Promise.all(updates);

  // eslint-disable-next-line no-console
  console.log(`fillImages: updated ${updatedCount} products`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('fillImages failed', err);
  process.exit(1);
});
