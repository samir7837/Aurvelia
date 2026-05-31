const express = require('express');
const WishlistItem = require('../models/WishlistItem');
const { authenticate } = require('../middleware/authJwt');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const items = await WishlistItem.find({ user_id: req.user.sub });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    const item = await WishlistItem.create({ user_id: req.user.sub, product_id });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await WishlistItem.deleteOne({ _id: req.params.id, user_id: req.user.sub });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
