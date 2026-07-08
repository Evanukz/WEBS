import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        image: { type: String }
      }
    ],
    totals: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true }
    },
    payment: {
      status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
      provider: { type: String, default: '' },
      reference: { type: String, default: '' }
    },
    status: { type: String, default: 'processing' },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      country: String
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export { Order };

