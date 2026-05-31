const express = require('express');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/authJwt');

const router = express.Router();

router.use(authenticate);

router.post('/', async (req, res) => {
  try {
    const { items, total, shipping_address } = req.body;
    const order = await Order.create({ user_id: req.user.sub, items, total, shipping_address });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.sub }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
