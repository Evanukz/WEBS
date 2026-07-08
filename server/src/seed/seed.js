import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

const seedCredentials = {
  adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@yamskis.com',
  adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  userEmail: process.env.SEED_USER_EMAIL || 'user@yamskis.com',
  userPassword: process.env.SEED_USER_PASSWORD || 'user123'
};

function img(seed, suffix) {
  const keyword = String(suffix || 'product').trim().replace(/&/g, 'and');
  const query = encodeURIComponent(keyword);
  return `https://source.unsplash.com/900x900/?${query}&sig=${seed}`;
}

const storefrontCategories = [
  'Phones',
  'Computing',
  'Fashion',
  'Home & Office',
  'Appliances',
  'Beauty',
  'Sports',
  'Groceries'
];

const categoryTemplates = {
  'Phones': ['Nova X Pro', 'Orbit Lite', 'Pulse Max', 'Echo Fold'],
  'Computing': ['PulseBook Air', 'Vector Pro', 'Atlas Mini', 'Core Station'],
  'Fashion': ['Streetwear Set', 'Urban Knit Tee', 'Classic Runner', 'Signature Coat'],
  'Home & Office': ['Ergo Chair', 'Smart Desk Lamp', 'Oak Storage Shelf', 'Desk Mat Pro'],
  'Appliances': ['Air Fryer Max', 'Steam Blend', 'Smart Kettle', 'Kitchen Mixer'],
  'Beauty': ['Glow Serum', 'Hydra Mask', 'Daily Cleanser', 'Silk Hair Kit'],
  'Sports': ['RunFlex Shoes', 'Pro Yoga Mat', 'Hydra Bottle', 'Training Shorts'],
  'Groceries': ['Pantry Pack', 'Breakfast Box', 'Healthy Snack Mix', 'Family Essentials']
};

function buildCategoryProducts(category, startIndex, quantity) {
  return Array.from({ length: quantity }, (_, offset) => {
    const productIndex = startIndex + offset;
    const slot = (offset % 4) + 1;
    const isFlashSale = (productIndex + slot) % 4 === 0;
    const title = `${categoryTemplates[category]?.[slot - 1] || `${category} Item ${slot}`} ${productIndex}`;

    return {
      title,
      brand: productIndex % 3 === 0 ? 'Yamskis Brand' : 'Prime',
      description: `Featured ${category.toLowerCase()} pick from Yamskis with dependable quality and fast delivery.`,
      price: 18000 + productIndex * 1750,
      compareAtPrice: isFlashSale ? 24000 + productIndex * 1750 : undefined,
      images: [img(productIndex, category)],
      category,
      stock: 15 + productIndex,
      isFlashSale,
      flashSaleEndsAt: isFlashSale ? new Date(Date.now() + 1000 * 60 * 60 * 5) : undefined
    };
  });
}

async function seedMissingCategoryProducts() {
  const existingCount = await Product.countDocuments();
  const nextSeedIndex = existingCount + 1;
  const missingProducts = [];

  for (const category of storefrontCategories) {
    const categoryCount = await Product.countDocuments({ category });
    const needed = Math.max(0, 4 - categoryCount);
    if (needed > 0) {
      missingProducts.push(...buildCategoryProducts(category, nextSeedIndex + missingProducts.length, needed));
    }
  }

  if (missingProducts.length > 0) {
    await Product.insertMany(missingProducts);
  }
}

async function seedIfEmpty() {
  const existingProducts = await Product.countDocuments();
  const existingUsers = await User.countDocuments();
  const existingOrders = await Order.countDocuments();

  if (existingUsers === 0) {
    const bcrypt = await import('bcryptjs');
    await User.create([
      {
        name: 'Admin',
        email: seedCredentials.adminEmail,
        passwordHash: await bcrypt.default.hash(seedCredentials.adminPassword, 10),
        role: 'admin'
      },
      {
        name: 'Demo User',
        email: seedCredentials.userEmail,
        passwordHash: await bcrypt.default.hash(seedCredentials.userPassword, 10),
        role: 'user'
      }
    ]);
  }

  if (existingProducts === 0) {
    await Product.insertMany(buildCategoryProducts(storefrontCategories[0], 1, 4));
    let productIndex = 5;
    for (const category of storefrontCategories.slice(1)) {
      await Product.insertMany(buildCategoryProducts(category, productIndex, 4));
      productIndex += 4;
    }
  }

  await seedMissingCategoryProducts();

  if (existingOrders === 0) {
    const demoUser = await User.findOne({ email: seedCredentials.userEmail });
    const demoProducts = await Product.find().sort({ createdAt: 1 }).limit(2);

    if (demoUser && demoProducts.length > 0) {
      const subtotal = demoProducts.reduce((sum, product) => sum + product.price, 0);
      await Order.create({
        user: demoUser._id,
        items: demoProducts.map((product) => ({
          product: product._id,
          title: product.title,
          price: product.price,
          qty: 1,
          image: product.images?.[0] || ''
        })),
        totals: { subtotal, shipping: 0, tax: 0, grandTotal: subtotal },
        payment: { status: 'paid', provider: 'seed', reference: 'seed-order' },
        status: 'delivered',
        shippingAddress: {
          fullName: 'Demo User',
          phone: '08000000000',
          addressLine1: '1 Demo Street',
          city: 'Lagos',
          country: 'Nigeria'
        }
      });
    }
  }

  // Ensure every product has at least one image. Fill missing images with a generated SVG.
  async function ensureProductImages() {
    const products = await Product.find();
    const updates = [];
    for (const p of products) {
      if (!p.images || (Array.isArray(p.images) && p.images.length === 0) || (typeof p.images === 'string' && p.images === '')) {
        const seed = Math.floor(Math.random() * 1000);
        p.images = [img(seed, p.category || 'Product')];
        updates.push(p.save());
      }
    }
    if (updates.length > 0) await Promise.all(updates);
  }

  await ensureProductImages();
}

export { seedIfEmpty };

