const mongoose = require('mongoose');

const NewsletterSubscriberSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  email: { type: String, required: true, unique: true, index: true },
  subscribed_at: { type: Date, default: Date.now }
}, {
  collection: 'newsletter_subscribers',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
