import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { ProductGridSkeleton } from '../components/Loader';
import { HiOutlineFilter, HiOutlineX, HiStar } from 'react-icons/hi';

function PromoCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/promo-banners');
        setBanners(data.data || []);
      } catch (err) {
        console.error('Failed to load promo banners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    // Initial 2s timeout, then 5s intervals
    const initialTimeout = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, [banners]);

  if (loading) {
    return (
      <div className="w-full h-44 sm:h-56 rounded-2xl bg-surface-3 animate-pulse mb-8" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden mb-8 shadow-lg border border-glass-border">
      {banners.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide._id}
            className={`absolute inset-0 w-full h-full flex transition-all duration-700 ease-in-out transform ${
              isActive ? 'opacity-100 translate-x-0' : 
              index < currentSlide ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-0 translate-x-full pointer-events-none'
            }`}
            style={{ background: slide.bg }}
          >
            {/* Left Content */}
            <div className="w-7/12 sm:w-1/2 p-4 sm:p-8 flex flex-col justify-center text-white text-left select-none">
              <div className="inline-block self-start px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-400 text-black mb-2 animate-pulse">
                {slide.highlight}
              </div>
              <h2 className="text-xl sm:text-3xl font-black mb-1.5 leading-tight">{slide.title}</h2>
              <p className="text-xs sm:text-sm font-semibold opacity-90">{slide.subtitle}</p>
              <p className="text-[10px] sm:text-xs opacity-75 mt-1 hidden sm:block">{slide.tag}</p>
              <Link
                to={slide.link}
                className="mt-3 sm:mt-4 self-start px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-colors shadow-md"
              >
                Shop Now
              </Link>
            </div>
            {/* Right Image */}
            <div className="w-5/12 sm:w-1/2 relative h-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        );
      })}
      
      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-5' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (rating) params.set('rating', rating);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || minPrice || maxPrice || rating || keyword;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Promo Carousel Banner */}
      {!category && !keyword && (
        <PromoCarousel />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {keyword ? (
              <>Results for "<span className="gradient-text">{keyword}</span>"</>
            ) : category ? (
              <span className="gradient-text">{category}</span>
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-text-secondary text-sm mt-1">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm bg-surface-3 border border-glass-border
                       text-text focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary !px-3 !py-2.5 flex items-center gap-2 text-sm"
          >
            <HiOutlineFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-surface/90 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-64 shrink-0`}>
          <div className={`${showFilters ? 'absolute right-0 top-0 h-full w-72 bg-surface-2 p-6 overflow-y-auto animate-slideInRight' : ''} lg:relative lg:w-auto lg:bg-transparent lg:p-0`}>
            {/* Mobile close */}
            {showFilters && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-glass-hover cursor-pointer">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-6">

              {/* Price Range */}
              <div className="card">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input-field !py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input-field !py-2 text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="card">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Minimum Rating</h3>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateFilter('rating', rating === String(r) ? '' : String(r))}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                        ${rating === String(r) ? 'bg-primary/10' : 'hover:bg-glass-hover'}`}
                    >
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} className={`w-4 h-4 ${i < r ? 'text-yellow-400' : 'text-surface-4'}`} />
                        ))}
                      </div>
                      <span className="text-text-secondary">& Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary w-full !py-2 text-sm">
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </aside>
        {/* Product Grid */}
        <main className="flex-1">
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {keyword && (
                <span className="badge-primary flex items-center gap-1">
                  Search: {keyword}
                  <button onClick={() => updateFilter('keyword', '')} className="hover:text-white cursor-pointer">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="badge-primary flex items-center gap-1">
                  {category}
                  <button onClick={() => updateFilter('category', '')} className="hover:text-white cursor-pointer">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="badge-primary flex items-center gap-1">
                  ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                  <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} className="hover:text-white cursor-pointer">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {rating && (
                <span className="badge-primary flex items-center gap-1">
                  {rating}★ & up
                  <button onClick={() => updateFilter('rating', '')} className="hover:text-white cursor-pointer">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-text-secondary mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <div key={product._id} className="animate-slideUp" style={{ animationDelay: `${i * 0.03}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={(p) => updateFilter('page', String(p))}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
