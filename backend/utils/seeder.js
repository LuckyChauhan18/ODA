const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const PromoBanner = require('../models/PromoBanner');

dotenv.config();

const sampleProducts = [
  // Toys
  {
    name: 'Remote Control Drift Racer Supercar',
    description: 'High-speed 1:16 scale remote control drift car with headlights, rechargeable battery, and high-performance tires. Perfect toy for kids and drift enthusiasts.',
    price: 1899,
    originalPrice: 2999,
    category: 'Toys',
    brand: 'ToyZone',
    images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500'],
    stock: 35,
    featured: true,
    ratings: 4.5,
    numReviews: 42,
    ageGroup: '8-12',
  },
  {
    name: '120-Piece Wooden Building Block Set',
    description: 'Classic educational wooden block set featuring various shapes, colors, and patterns. Helps develop motor skills, spatial reasoning, and creativity in toddlers.',
    price: 999,
    originalPrice: 1499,
    category: 'Toys',
    brand: 'EcoPlay',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
    stock: 50,
    featured: true,
    ratings: 4.8,
    numReviews: 24,
    ageGroup: '5-8',
  },
  {
    name: 'Electronic Talking Dancing Cactus',
    description: 'Funny interactive talking cactus plush toy that repeats what you say, sings multiple preloaded songs, dances, and glows. Perfect companion for infants.',
    price: 499,
    originalPrice: 999,
    category: 'Toys',
    brand: 'FunTime',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500'],
    stock: 120,
    featured: false,
    ratings: 4.2,
    numReviews: 110,
    ageGroup: 'less-5',
  },
  {
    name: 'DIY Mechanical Robot Arm Kit',
    description: 'Stem-based assembly robotic arm kit for older kids. Teaches basic engineering, physics, and robotics through hands-on building experience.',
    price: 2499,
    originalPrice: 3999,
    category: 'Toys',
    brand: 'STEMLab',
    images: ['https://images.unsplash.com/photo-1530685933966-224097f5f848?w=500'],
    stock: 15,
    featured: false,
    ratings: 4.6,
    numReviews: 18,
    ageGroup: '12+',
  },

  // Home Decoration
  {
    name: 'Nordic Style Ceramic Flower Vase (Beige)',
    description: 'Premium handcrafted minimalist matte ceramic vase. Perfect modern centerpiece for dried pampas grass, fresh flowers, and living room shelves.',
    price: 799,
    originalPrice: 1299,
    category: 'Home Decoration',
    brand: 'CasaDecor',
    images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500'],
    stock: 40,
    featured: true,
    ratings: 4.7,
    numReviews: 56,
    material: 'Ceramic',
    decorType: 'Vase',
  },
  {
    name: 'Ambient Magnetic Balancing LED Lamp',
    description: 'Unique modern levitating switch desk lamp. Two wooden balls act as the switch: lift the lower ball to attract the upper one and turn on the warm LED light.',
    price: 1999,
    originalPrice: 2999,
    category: 'Home Decoration',
    brand: 'HengBalance',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
    stock: 20,
    featured: true,
    ratings: 4.9,
    numReviews: 32,
    material: 'Wood',
    decorType: 'Lighting',
  },
  {
    name: 'Bohemian Handwoven Macrame Wall Hanging',
    description: 'Beautiful handwoven chic cotton tapestry with geometric designs. Adds a warm, cozy, boho-chic feel to bedrooms and gallery walls.',
    price: 649,
    originalPrice: 999,
    category: 'Home Decoration',
    brand: 'BohoVibe',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'],
    stock: 60,
    featured: false,
    ratings: 4.4,
    numReviews: 78,
    material: 'Fabric',
    decorType: 'Wall Art',
  },
  {
    name: 'Aromatic Soy Wax Scented Candles (Set of 4)',
    description: 'Eco-friendly soy wax candles in decorative metal tins. Scented with Lavender, Rose, Vanilla, and Lemon essential oils for aromatherapy and relaxation.',
    price: 499,
    originalPrice: 799,
    category: 'Home Decoration',
    brand: 'AromaPure',
    images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500'],
    stock: 100,
    featured: false,
    ratings: 4.5,
    numReviews: 120,
    material: 'Wax',
    decorType: 'Candle',
  },

  // Rakhi
  {
    name: 'Royal Kundan & Pearl Designer Rakhi',
    description: 'Exquisite traditional handcrafted Kundan rakhi detailed with red beads and high-quality pearls. Comes with complementary Roli and Chawal sachets.',
    price: 149,
    originalPrice: 299,
    category: 'Rakhi',
    brand: 'FestiveCraft',
    images: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500'],
    stock: 200,
    featured: true,
    ratings: 4.6,
    numReviews: 88,
  },
  {
    name: 'Sterling Silver Om Pendant Rakhi',
    description: 'Premium pure sterling silver Om element threaded on a strong red silk dori. The silver Om centerpiece can be repurposed as a pendant later.',
    price: 499,
    originalPrice: 899,
    category: 'Rakhi',
    brand: 'SilverShine',
    images: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500'],
    stock: 80,
    featured: true,
    ratings: 4.8,
    numReviews: 15,
  },
  {
    name: 'Eco-Friendly Clay Seed Rakhi (Set of 2)',
    description: '100% natural clay rakhi embedded with plant seeds. After the festival, plant the rakhi in soil to grow a beautiful organic flower/herb plant.',
    price: 199,
    originalPrice: 349,
    category: 'Rakhi',
    brand: 'GreenEarth',
    images: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500'],
    stock: 150,
    featured: false,
    ratings: 4.7,
    numReviews: 34,
  },
  {
    name: 'Handcrafted Sandalwood Ganesha Rakhi',
    description: 'Sandalwood beads thread rakhi featuring a beautifully carved wooden Ganesha emblem. Emits a soothing natural fragrance.',
    price: 129,
    originalPrice: 199,
    category: 'Rakhi',
    brand: 'SandalwoodSpells',
    images: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500'],
    stock: 250,
    featured: false,
    ratings: 4.3,
    numReviews: 45,
  },
];

const sampleBanners = [
  {
    title: 'Rakhi Specials',
    highlight: 'Under ₹399',
    subtitle: 'Clogs & sandals',
    tag: 'Step up now or miss out!',
    bg: 'linear-gradient(135deg, #FF6B54, #FF8E8E)',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500',
    link: '/products?category=Rakhi',
  },
  {
    title: 'Freshness that lasts',
    highlight: 'Up to 80% Off',
    subtitle: 'The Man Company',
    tag: 'Hustle all day, party all night',
    bg: 'linear-gradient(135deg, #0D0C1D, #161A22)',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    link: '/products?category=Home%20Decoration',
  },
  {
    title: 'Get hydrated skin',
    highlight: 'Up to 50% Off',
    subtitle: 'Nivea Specials',
    tag: 'Natural & improved formula',
    bg: 'linear-gradient(135deg, #1A365D, #3182CE)',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
    link: '/products?category=Toys',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await PromoBanner.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@oda.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@oda.com',
      password: 'user123',
      role: 'user',
    });

    // Create products
    await Product.insertMany(sampleProducts);

    // Create promo banners
    await PromoBanner.insertMany(sampleBanners);

    console.log('✅ Database seeded successfully!');
    console.log('   Admin: admin@oda.com / admin123');
    console.log('   User:  user@oda.com / user123');
    console.log(`   Products: ${sampleProducts.length} created`);
    console.log(`   Banners:  ${sampleBanners.length} created`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
