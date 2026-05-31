const express = require('express');
const Faq = require('../models/Faq');
const { authenticate, requireAdmin } = require('../middleware/authJwt');

const router = express.Router();

// Public: list FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find({ is_active: true }).sort({ sort_order: 1 }).lean();
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin create
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const f = await Faq.create(req.body);
    res.json(f);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Faq.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
