import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { HiOutlineTrash, HiMinus, HiPlus, HiArrowRight, HiOutlineShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Spinner } from '../components/Loader';

export default function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, loading } = useCart();

  const handleUpdateQty = async (itemId, newQty) => {
    try {
      await updateQuantity(itemId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const shippingPrice = totalPrice > 500 ? 0 : 50;
  const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;
  const grandTotal = Math.round((totalPrice + shippingPrice + taxPrice) * 100) / 100;

  if (loading) return <Spinner size="lg" />;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fadeIn">
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-surface-3 mb-6">
          <HiOutlineShoppingCart className="w-12 h-12 text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-text-secondary mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <HiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart <span className="text-text-secondary text-lg font-normal">({totalItems} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card flex gap-4 animate-slideUp">
              <Link to={`/products/${item.product?._id}`} className="shrink-0">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                  alt={item.product?.name}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`}
                      className="text-base font-semibold hover:text-primary-light transition-colors line-clamp-2">
                  {item.product?.name}
                </Link>
                <p className="text-lg font-bold mt-2">₹{(item.product?.price || 0).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-0 rounded-lg border border-glass-border overflow-hidden">
                    <button
                      onClick={() => handleUpdateQty(item._id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-surface-3 hover:bg-glass-hover transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center bg-surface-3 text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= (item.product?.stock || 10)}
                      className="w-8 h-8 flex items-center justify-center bg-surface-3 hover:bg-glass-hover transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <HiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="hidden sm:flex items-center">
                <span className="text-lg font-bold">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal ({totalItems} items)</span>
                <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className={`font-medium ${shippingPrice === 0 ? 'text-success' : ''}`}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax (18% GST)</span>
                <span className="font-medium">₹{taxPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-glass-border pt-3 flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-bold gradient-text">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            {totalPrice < 500 && (
              <p className="text-xs text-text-muted mt-3 text-center">
                Add ₹{(500 - totalPrice).toLocaleString()} more for free shipping!
              </p>
            )}
            <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
              Proceed to Checkout <HiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products" className="block text-center text-sm text-primary-light mt-3 hover:text-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
