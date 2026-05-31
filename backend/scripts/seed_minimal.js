require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const UserRole = require('../src/models/UserRole');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');
const Order = require('../src/models/Order');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  // Admin user
  let admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    const hashed = await bcrypt.hash('adminpass', 10);
    admin = await User.create({ email: 'admin@example.com', password: hashed });
    await Profile.create({ _id: admin._id, full_name: 'Admin User' });
    await UserRole.create({ user_id: admin._id, role: 'admin' });
    console.log('Created admin user');
  } else {
    console.log('Admin user exists');
  }

  // Customer user
  let customer = await User.findOne({ email: 'customer@example.com' });
  if (!customer) {
    const hashed = await bcrypt.hash('custpass', 10);
    customer = await User.create({ email: 'customer@example.com', password: hashed });
    await Profile.create({ _id: customer._id, full_name: 'Customer User' });
    await UserRole.create({ user_id: customer._id, role: 'customer' });
    console.log('Created customer user');
  } else {
    console.log('Customer user exists');
  }

  // Products (5)
  const existingCount = await Product.countDocuments();
  if (existingCount < 5) {
    const base = [
      { sku: 'SKU-001', name: 'Glow Serum', slug: 'glow-serum', category: 'Skincare', price: 29.99, stock: 50 },
      { sku: 'SKU-002', name: 'Hydra Cream', slug: 'hydra-cream', category: 'Skincare', price: 24.99, stock: 40 },
      { sku: 'SKU-003', name: 'Silk Cleanser', slug: 'silk-cleanser', category: 'Cleansers', price: 19.99, stock: 60 },
      { sku: 'SKU-004', name: 'Radiant Toner', slug: 'radiant-toner', category: 'Toners', price: 14.99, stock: 30 },
      { sku: 'SKU-005', name: 'Night Balm', slug: 'night-balm', category: 'Treatments', price: 34.99, stock: 20 }
    ];
    for (const p of base) {
      const exists = await Product.findOne({ sku: p.sku });
      if (!exists) await Product.create(p);
    }
    console.log('Ensured 5 products');
  } else {
    console.log('Products already exist');
  }

  const products = await Product.find().limit(5);

  // Reviews (2)
  const reviewCount = await Review.countDocuments();
  if (reviewCount < 2) {
    await Review.create({ product_id: products[0]._id, user_id: customer._id, rating: 5, comment: 'Great product!', author_name: 'Customer' });
    await Review.create({ product_id: products[1]._id, user_id: customer._id, rating: 4, comment: 'Nice texture.', author_name: 'Customer' });
    console.log('Created 2 reviews');
  } else {
    console.log('Reviews already exist');
  }

  // Order (1) for customer
  const orderCount = await Order.countDocuments({ user_id: customer._id });
  if (orderCount < 1) {
    const item = { product_id: products[0]._id, name: products[0].name, slug: products[0].slug, category: products[0].category, price: products[0].price, quantity: 1 };
    await Order.create({ user_id: customer._id, order_number: `ORD-${Date.now()}`, items: [item], subtotal: products[0].price, total: products[0].price });
    console.log('Created 1 order');
  } else {
    console.log('Order exists for customer');
  }

  console.log('Seeding complete');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
