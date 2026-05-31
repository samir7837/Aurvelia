const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, {
  collection: 'faqs',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Faq', FaqSchema);
