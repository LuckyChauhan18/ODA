const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/promoBannerController');

// Public route
router.get('/', getBanners);

// Admin routes (requires authentication and admin privileges)
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
