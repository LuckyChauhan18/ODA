const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Protected routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);

// Admin routes
router.get('/', protect, admin, getAllOrders);

// Parameterized routes last
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
