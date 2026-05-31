const express = require('express');
const SiteContent = require('../models/SiteContent');
const { authenticate, requireAdmin } = require('../middleware/authJwt');

const router = express.Router();

// GET /api/site_content?key=...  (public)
router.get('/', async (req, res) => {
  try {
    const key = req.query.key;
    if (key) {
      const item = await SiteContent.findOne({ key }).lean();
      return res.json(item || null);
    }
    const all = await SiteContent.find({}).lean();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin upsert
router.put('/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const key = req.params.key;
    const value = req.body.value;
    const updated = await SiteContent.findOneAndUpdate({ key }, { $set: { value } }, { upsert: true, new: true }).lean();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
