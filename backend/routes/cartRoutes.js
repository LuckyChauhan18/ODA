const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

router.use(protect); // All cart routes require authentication

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:itemId').put(updateCartItem).delete(removeCartItem);

module.exports = router;
