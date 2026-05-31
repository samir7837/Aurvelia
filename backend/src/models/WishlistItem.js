const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true },
  product_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'wishlist_items',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);
