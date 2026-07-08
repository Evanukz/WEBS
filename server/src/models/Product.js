import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    category: { type: String, required: true, index: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: { type: Date }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export { Product };

