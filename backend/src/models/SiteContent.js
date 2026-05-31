const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Object }
}, {
  collection: 'site_content',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
