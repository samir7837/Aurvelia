const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true },
  order_number: { type: String, required: true, index: true },
  items: [{ product_id: String, name: String, slug: String, category: String, price: Number, quantity: Number }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping_fee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment_method: { type: String },
  payment_status: { type: String, default: 'pending' },
  order_status: { type: String, default: 'pending' },
  transaction_id: { type: String },
  payment_id: { type: String },
  shipping_address: { type: Object },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'orders',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Order', OrderSchema);
