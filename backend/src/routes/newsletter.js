const express = require('express');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const sub = await NewsletterSubscriber.findOneAndUpdate({ email }, { email }, { upsert: true, new: true });
    res.json(sub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
