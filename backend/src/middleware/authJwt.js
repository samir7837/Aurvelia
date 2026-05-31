const jwt = require('jsonwebtoken');
const UserRole = require('../models/UserRole');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(403).json({ message: 'Forbidden' });
  const role = await UserRole.findOne({ user_id: userId, role: 'admin' });
  if (!role) return res.status(403).json({ message: 'Admin required' });
  next();
};

module.exports = { authenticate, requireAdmin };
