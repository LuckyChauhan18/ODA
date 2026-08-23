const User = require('../models/User');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Protected
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Protected
const addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if already in wishlist
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: updatedUser.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Protected
const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: updatedUser.wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
