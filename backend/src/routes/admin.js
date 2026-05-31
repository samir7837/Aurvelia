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
    res.json({ users, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
