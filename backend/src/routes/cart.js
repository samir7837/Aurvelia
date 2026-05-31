const express = require('express');
const CartItem = require('../models/CartItem');
const { authenticate } = require('../middleware/authJwt');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const items = await CartItem.find({ user_id: req.user.sub }).lean();
    // Enrich with product details
    const productIds = items.map((i) => i.product_id);
    const Product = require('../models/Product');
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const byId = new Map(products.map((p) => [p._id, p]));
    const enriched = items.map((it) => ({ ...it, product: byId.get(it.product_id) })).filter((it) => it.product);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const item = await CartItem.create({ user_id: req.user.sub, product_id, quantity });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backwards-compatibility: POST /api/cart/add -> POST /api/cart
router.post('/add', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const item = await CartItem.create({ user_id: req.user.sub, product_id, quantity });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const updated = await CartItem.findOneAndUpdate({ _id: req.params.id, user_id: req.user.sub }, { $set: { quantity } }, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await CartItem.deleteOne({ _id: req.params.id, user_id: req.user.sub });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart for authenticated user
router.delete('/', async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.sub });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
