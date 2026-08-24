import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/Loader';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">My Wishlist <span className="text-text-secondary text-lg font-normal">({wishlist.length} items)</span></h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-surface-3 mb-4">
            <HiOutlineHeart className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-text-secondary mb-6">Save your favourite items and come back to them later.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product, i) => (
            <div key={product._id} className="animate-slideUp h-full" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard
                product={product}
                wishlist={wishlist.map((w) => w._id)}
                onWishlistChange={fetchWishlist}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
