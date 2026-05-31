const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const UserRole = require('../models/UserRole');

const router = express.Router();

// GET /api/auth/me
router.get('/', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(200).json({ user: null, isAdmin: false });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(200).json({ user: null, isAdmin: false });
    const profile = await Profile.findById(user._id).lean();
    const roles = await UserRole.find({ user_id: user._id }).lean();
    const isAdmin = roles.some((r) => r.role === 'admin');
    // Transform user to JSON-friendly shape
    const safeUser = { id: user._id, email: user.email };
    res.json({ user: safeUser, profile, isAdmin });
  } catch (err) {
    return res.status(200).json({ user: null, isAdmin: false });
  }
});

module.exports = router;
