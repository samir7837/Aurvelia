const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authJwt');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const NewsletterSubscriber = require('../models/NewsletterSubscriber');
    const Review = require('../models/Review');
    const Order = require('../models/Order');
    const subscribers = await NewsletterSubscriber.countDocuments();
    const reviews = await Review.countDocuments();
    const orders = await Order.countDocuments();
    res.json({ users, products, subscribers, reviews, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list all orders
router.get('/orders', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({}).sort({ created_at: -1 }).lean();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: update order status
router.patch('/orders/:id', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { order_status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { $set: { order_status } }, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: contact messages
router.get('/messages', async (req, res) => {
  try {
    const ContactMessage = require('../models/ContactMessage');
    const messages = await ContactMessage.find({}).sort({ created_at: -1 }).lean();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/messages/:id', async (req, res) => {
  try {
    const ContactMessage = require('../models/ContactMessage');
    const { status } = req.body;
    const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: newsletter subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const NewsletterSubscriber = require('../models/NewsletterSubscriber');
    const subs = await NewsletterSubscriber.find({}).sort({ subscribed_at: -1 }).lean();
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
