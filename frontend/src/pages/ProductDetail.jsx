import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiHeart,
  HiMinus,
  HiPlus,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from 'react-icons/hi';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);

      // Fetch related products
      const relRes = await api.get(`/products?category=${encodeURIComponent(data.data.category)}&limit=4`);
      setRelatedProducts(relRes.data.data.filter((p) => p._id !== id));

      // Check wishlist
      if (isAuthenticated) {
        const profileRes = await api.get('/auth/profile');
        setIsWishlisted(profileRes.data.data.wishlist.some((w) => w._id === id));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    try {
      await addToCart(product._id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please login to use wishlist');
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
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to review');
    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="text-center py-20"><h2 className="text-2xl">Product not found</h2></div>;

  const hasReviewed = product.reviews?.some((r) => r.user?._id === user?._id || r.user === user?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-text transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-text transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-text transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="card !p-2 aspect-square overflow-hidden">
            <img
              src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                    ${selectedImage === i ? 'border-primary shadow-lg shadow-primary/20' : 'border-glass-border hover:border-primary/50'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="badge-primary mb-3">{product.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{product.name}</h1>
            {product.brand && <p className="text-text-secondary mt-1">by <span className="font-medium text-text">{product.brand}</span></p>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.ratings} />
            <span className="text-text-secondary text-sm">
              {product.ratings} ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-text-muted line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="badge-success">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-text-secondary leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <span className="text-success font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-danger font-medium">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0 rounded-xl border border-glass-border overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-surface-3 hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  <HiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center bg-surface-3 font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center bg-surface-3 hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <HiOutlineShoppingCart className="w-5 h-5" /> Add to Cart
              </button>

              <button
                onClick={handleToggleWishlist}
                className="w-12 h-12 rounded-xl border border-glass-border flex items-center justify-center
                           hover:bg-glass-hover transition-all cursor-pointer"
              >
                {isWishlisted ? (
                  <HiHeart className="w-5 h-5 text-secondary" />
                ) : (
                  <HiOutlineHeart className="w-5 h-5 text-text-secondary" />
                )}
              </button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-glass-border">
            {[
              { icon: HiOutlineTruck, label: 'Free Shipping', sub: 'Orders ₹500+' },
              { icon: HiOutlineShieldCheck, label: 'Secure Payment', sub: '100% Protected' },
              { icon: HiOutlineRefresh, label: 'Easy Returns', sub: '7 Day Policy' },
            ].map((feat) => (
              <div key={feat.label} className="text-center">
                <feat.icon className="w-6 h-6 mx-auto text-primary-light mb-1" />
                <p className="text-xs font-semibold">{feat.label}</p>
                <p className="text-[10px] text-text-muted">{feat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            {!isAuthenticated ? (
              <p className="text-text-secondary text-sm">
                Please <Link to="/login" className="text-primary-light font-medium">login</Link> to write a review.
              </p>
            ) : hasReviewed ? (
              <p className="text-text-secondary text-sm">You have already reviewed this product.</p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} size="lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                    required
                    placeholder="Share your experience..."
                    className="input-field resize-none"
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Customer Reviews ({product.reviews?.length || 0})</h3>
          {product.reviews?.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-text-muted">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map((review) => (
                <div key={review._id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                           style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' }}>
                        {review.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{review.name}</p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
