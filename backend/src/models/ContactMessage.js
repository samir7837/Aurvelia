const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, default: 'open' },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'contact_messages',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
