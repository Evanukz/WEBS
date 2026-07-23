import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

const seedCredentials = {
  adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@yamskis.com',
  adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  userEmail: process.env.SEED_USER_EMAIL || 'user@yamskis.com',
  userPassword: process.env.SEED_USER_PASSWORD || 'user123'
};

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
  return `https://source.unsplash.com/900x900/?${query}&sig=${seed}`;
}

function buildProductImages(seed, title, category) {
  const titleText = String(title || category || 'product');
  const titleLower = titleText.toLowerCase();

  if (titleLower.includes('family essentials')) {
    return [
      'https://www.zenmart.co.ug/storage/family-essentials-1.jpg',
      'https://source.unsplash.com/900x900/?family-essentials-grocery-basket&sig=1001',
      'https://source.unsplash.com/900x900/?household-essentials-store&sig=1002'
    ];
  }

  const keyword = getImageKeywordFromTitle(titleText);
  const baseQuery = encodeURIComponent(keyword);
  return [
    `https://source.unsplash.com/900x900/?${baseQuery}&sig=${seed}`,
    `https://source.unsplash.com/900x900/?${encodeURIComponent(`${keyword} product view`)}&sig=${seed + 1}`,
    `https://source.unsplash.com/900x900/?${encodeURIComponent(`${keyword} lifestyle`)}&sig=${seed + 2}`
  ];
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
      images: buildProductImages(productIndex, title, category),
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
      const hasValidImages = Array.isArray(p.images) && p.images.filter(Boolean).length >= 3;
      if (!hasValidImages) {
        const seed = Math.floor(Math.random() * 1000);
        p.images = buildProductImages(seed, p.title || p.category || 'Product', p.category);
        updates.push(p.save());
      }
    }
    if (updates.length > 0) await Promise.all(updates);
  }

  await ensureProductImages();
}

export { seedIfEmpty };

