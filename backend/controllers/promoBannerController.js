const PromoBanner = require('../models/PromoBanner');

// @desc    Get all promo banners
// @route   GET /api/promo-banners
// @access  Public
const getBanners = async (req, res, next) => {
  try {
    const banners = await PromoBanner.find().sort({ createdAt: 1 });
    res.json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new promo banner
// @route   POST /api/promo-banners
// @access  Private/Admin
const createBanner = async (req, res, next) => {
  try {
    const banner = await PromoBanner.create(req.body);
    res.status(201).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a promo banner
// @route   PUT /api/promo-banners/:id
// @access  Private/Admin
const updateBanner = async (req, res, next) => {
  try {
    let banner = await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: `Banner not found with id of ${req.params.id}`,
      });
    }

    banner = await PromoBanner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a promo banner
// @route   DELETE /api/promo-banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: `Banner not found with id of ${req.params.id}`,
      });
    }

    await banner.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
