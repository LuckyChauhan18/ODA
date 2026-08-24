import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Loader';
import {
  HiOutlineGift,
  HiOutlineHome,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiArrowRight,
} from 'react-icons/hi';

const categoryIcons = {
  'Toys': HiOutlineGift,
  'Home Decoration': HiOutlineHome,
  'Rakhi': HiOutlineSparkles,
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products?sort=newest&limit=8'),
          api.get('/products/categories'),
        ]);
        setFeaturedProducts(featuredRes.data.data);
        setLatestProducts(latestRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style={{ background: 'var(--color-primary)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
               style={{ background: 'var(--color-accent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
               style={{ background: 'var(--color-accent-2)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-slideDown">
              <HiOutlineLightningBolt className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-text-secondary">New arrivals every week</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-slideUp">
              Shop the{' '}
              <span className="gradient-text">Future</span>
              <br />
              of E-Commerce
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Discover thousands of premium products at unbeatable prices.
              From premium toys to handcrafted home decoration and festive rakhis — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <Link to="/products" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
                Explore Products <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products?category=Toys" className="btn-secondary text-lg !px-8 !py-4">
                Shop Toys
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mt-12 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              {[
                { num: '10K+', label: 'Products' },
                { num: '50K+', label: 'Customers' },
                { num: '4.8', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.num}</p>
                  <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
          <p className="section-subtitle">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[cat] || HiOutlineSparkles;
            return (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="card !p-6 text-center group card-hover hover:!-translate-y-1 animate-slideUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3
                               bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-primary-light group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-semibold text-text group-hover:text-primary-light transition-colors">{cat}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title">🔥 Trending Now</h2>
            <p className="text-text-secondary">The products everyone is talking about</p>
          </div>
          <Link to="/products" className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-1 hidden sm:flex">
            View All <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <div key={product._id} className="animate-slideUp h-full" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 animate-gradient"
             style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2), var(--color-accent))' }}>
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Free Shipping on Orders Over ₹500
              </h3>
              <p className="text-white/80">
                Shop now and save on delivery. Limited time offer!
              </p>
            </div>
            <Link to="/products" className="bg-white text-primary font-semibold px-8 py-3 rounded-xl
                                          hover:bg-white/90 transition-all duration-300 hover:shadow-lg whitespace-nowrap">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title">✨ New Arrivals</h2>
            <p className="text-text-secondary">Fresh drops you don't want to miss</p>
          </div>
          <Link to="/products?sort=newest" className="btn-secondary !px-4 !py-2 text-sm items-center gap-1 hidden sm:flex">
            View All <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestProducts.map((product, i) => (
              <div key={product._id} className="animate-slideUp h-full" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
