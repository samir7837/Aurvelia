const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurvelia';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch((err) => console.error('MongoDB connect error', err));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Placeholder routes (to be implemented)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/auth/me', require('./src/routes/authMe'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/faqs', require('./src/routes/faqs'));
app.use('/api/wishlist', require('./src/routes/wishlist'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/site_content', require('./src/routes/siteContent'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/newsletter', require('./src/routes/newsletter'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/admin', require('./src/routes/admin'));

module.exports = app;
