const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  product_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true, index: true },
  rating: { type: Number, required: true },
  title: { type: String },
  comment: { type: String },
  author_name: { type: String },
  verified_purchase: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'reviews',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Review', ReviewSchema);
