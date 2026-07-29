import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../lib/db.js';
import { Product } from '../models/Product.js';

function getImageKeywordFromTitle(title) {
  const titleLower = String(title).toLowerCase();
  if (titleLower.includes('air fryer')) return 'air-fryer-kitchen-appliance';
  if (titleLower.includes('blender')) return 'hand-blender-kitchen';
  if (titleLower.includes('kettle')) return 'electric-kettle';
  if (titleLower.includes('mixer')) return 'kitchen-mixer';
  if (titleLower.includes('shoe') || titleLower.includes('runner') || titleLower.includes('runflex')) return 'running-shoes-sneakers';
  if (titleLower.includes('yoga')) return 'yoga-mat';
  if (titleLower.includes('snack') || titleLower.includes('pantry') || titleLower.includes('breakfast')) return 'snack-food-mix';
  if (titleLower.includes('phone') || titleLower.includes('nova') || titleLower.includes('orbit') || titleLower.includes('pulse max') || titleLower.includes('echo')) return 'smartphone-5g';
  if (titleLower.includes('laptop') || titleLower.includes('book air') || titleLower.includes('book pro') || titleLower.includes('pulsebook') || titleLower.includes('vector') || titleLower.includes('atlas') || titleLower.includes('core station') || titleLower.includes('edgebook') || titleLower.includes('workpad') || titleLower.includes('nanopc') || titleLower.includes('workmate') || titleLower.includes('studiodeck')) return 'laptop-computer';
  if (titleLower.includes('chair') || titleLower.includes('ergo')) return 'office-chair-ergonomic';
  if (titleLower.includes('lamp') || titleLower.includes('desk')) return 'desk-lamp-office';
  if (titleLower.includes('shelf') || titleLower.includes('storage')) return 'shelf-storage';
  if (titleLower.includes('desk mat')) return 'desk-mat';
  if (titleLower.includes('serum') || titleLower.includes('glow') || titleLower.includes('mask') || titleLower.includes('cleanser')) return 'skincare-beauty-products';
  if (titleLower.includes('hair') || titleLower.includes('silk')) return 'hair-care-products';
  if (titleLower.includes('shirt') || titleLower.includes('tee') || titleLower.includes('knit')) return 't-shirt-fashion';
  if (titleLower.includes('streetwear') || titleLower.includes('cargo') || titleLower.includes('coat') || titleLower.includes('jacket')) return 'fashion-clothing-outfit';
  return String(suffix || 'product').trim().replace(/&/g, 'and');
}

function img(seed, suffix) {
  const titleLower = String(suffix).toLowerCase();
  if (titleLower.includes('family essentials')) {
    return 'https://www.zenmart.co.ug/storage/family-essentials-1.jpg';
  }

  const keyword = getImageKeywordFromTitle(suffix);
  const query = encodeURIComponent(keyword);
  return `https://images.unsplash.com/900x900/?${query}&sig=${seed}`;
}

function buildProductImages(seed, title, category) {
  const titleText = String(title || category || 'product');
  const titleLower = titleText.toLowerCase();

  if (titleLower.includes('family essentials')) {
    return [
      'https://www.zenmart.co.ug/storage/family-essentials-1.jpg',
      'https://images.unsplash.com/900x900/?family-essentials-grocery-basket&sig=1001',
      'https://images.unsplash.com/900x900/?household-essentials-store&sig=1002'
    ];
  }

  const keyword = getImageKeywordFromTitle(titleText);
  const baseQuery = encodeURIComponent(keyword);
  return [
    `https://images.unsplash.com/900x900/?${baseQuery}&sig=${seed}`,
    `https://images.unsplash.com/900x900/?${encodeURIComponent(`${keyword} product view`)}&sig=${seed + 1}`,
    `https://images.unsplash.com/900x900/?${encodeURIComponent(`${keyword} lifestyle`)}&sig=${seed + 2}`
  ];
}

async function main() {
  await connectDB();

  const products = await Product.find();
  const updates = [];
  let updatedCount = 0;

  for (const p of products) {
    const hasValidImages = Array.isArray(p.images) && p.images.filter(Boolean).length >= 3;
    if (!hasValidImages) {
      const seed = Math.floor(Math.random() * 10000);
      p.images = buildProductImages(seed, p.title || p.category || 'Product', p.category);
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