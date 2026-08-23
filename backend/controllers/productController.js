const Product = require('../models/Product');

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search by keyword
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Filter by ageGroup (for Toys)
    if (req.query.ageGroup) {
      query.ageGroup = req.query.ageGroup;
    }

    // Filter by material (for Home Decoration)
    if (req.query.material) {
      query.material = req.query.material;
    }

    // Filter by decorType (for Home Decoration)
    if (req.query.decorType) {
      query.decorType = req.query.decorType;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Filter by rating
    if (req.query.rating) {
      query.ratings = { $gte: parseFloat(req.query.rating) };
    }

    // Sorting
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { ratings: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Protected
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories,
  getFeaturedProducts,
};
