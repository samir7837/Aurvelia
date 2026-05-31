const express = require('express');
const Review = require('../models/Review');
const { authenticate } = require('../middleware/authJwt');

const router = express.Router();

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, rating, title, body } = req.body;
    const review = await Review.create({ product_id, user_id: req.user.sub, rating, title, body });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
