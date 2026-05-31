const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// List products (with optional query)
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  try {
    const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { category: new RegExp(q, 'i') }, { slug: new RegExp(q, 'i') }] } : {};
    const products = await Product.find(filter).limit(100);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
