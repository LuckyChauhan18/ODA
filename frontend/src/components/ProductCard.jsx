import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingCart, HiStar } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useState } from 'react';

export default function ProductCard({ product, wishlist = [], onWishlistChange }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(
    wishlist.some((id) => id === product._id)
  );
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
      if (onWishlistChange) onWishlistChange();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card !p-0 overflow-hidden card-hover hover:!-translate-y-2 block"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-surface-3">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-secondary), #FF7043)' }}>
            -{discount}%
          </span>
        )}
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                     glass-strong opacity-0 group-hover:opacity-100 transition-all duration-300
                     hover:scale-110 cursor-pointer"
        >
          {isWishlisted ? (
            <HiHeart className="w-5 h-5 text-secondary" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-text" />
          )}
        </button>
        {/* Add to Cart Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                       glass-strong hover:bg-primary/80 transition-all duration-200
                       flex items-center justify-center gap-2 cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'rgba(108, 99, 255, 0.8)' }}
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-light font-medium mb-1">{product.category}</p>
        <h3 className="text-sm font-semibold text-text line-clamp-2 mb-2 group-hover:text-primary-light transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <HiStar
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.round(product.ratings) ? 'text-yellow-400' : 'text-surface-4'}`}
            />
          ))}
          <span className="text-xs text-text-muted ml-1">({product.numReviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-text">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-text-muted line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
