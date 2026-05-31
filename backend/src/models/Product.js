const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true },
  sub_category: { type: String },
  brand: { type: String, default: 'Aurvelia' },
  description: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  benefits: { type: [String], default: [] },
  how_to_use: { type: String, default: '' },
  images: { type: [String], default: [] },
  skin_types: { type: [String], default: [] },
  skin_concerns: { type: [String], default: [] },
  price: { type: Number, default: 0 },
  sale_price: { type: Number, default: null },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  best_seller: { type: Boolean, default: false },
  new_arrival: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'products',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', ProductSchema);
