const mongoose = require('mongoose');

const UserRoleSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true },
  role: { type: String, required: true, enum: ['admin', 'customer'] }
}, {
  collection: 'user_roles',
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  toObject: { virtuals: true }
});

UserRoleSchema.index({ user_id: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('UserRole', UserRoleSchema);
