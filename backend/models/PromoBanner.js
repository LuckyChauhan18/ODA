const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a banner title'],
    trim: true,
  },
  highlight: {
    type: String,
    required: [true, 'Please enter a highlight tag (e.g. Under ₹399)'],
    trim: true,
  },
  subtitle: {
    type: String,
    required: [true, 'Please enter a banner subtitle'],
    trim: true,
  },
  tag: {
    type: String,
    trim: true,
  },
  bg: {
    type: String,
    default: 'linear-gradient(135deg, #FF6B54, #FF8E8E)',
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please enter an image URL'],
    trim: true,
  },
  link: {
    type: String,
    required: [true, 'Please enter a target category link path'],
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
