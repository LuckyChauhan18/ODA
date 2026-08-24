import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PageLoader } from '../components/Loader';
import { HiOutlineClipboardList, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'badge-warning',
  'Out for Delivery': 'badge-info',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      if (data.success) {
        toast.success('Order cancelled successfully');
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-surface-3 mb-4">
            <HiOutlineClipboardList className="w-10 h-10 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-text-secondary mb-6">Start shopping and your orders will appear here.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card animate-slideUp">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Order ID</p>
                    <p className="text-sm font-mono font-medium">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Date</p>
                    <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColors[order.status]}>{order.status}</span>
                  <span className="text-lg font-bold">₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 py-3 border-t border-glass-border">
                <div className="flex -space-x-2">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                         alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-surface-2" />
                  ))}
                </div>
                <span className="text-sm text-text-secondary ml-2">
                  {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="ml-auto text-sm text-primary-light hover:text-primary flex items-center gap-1 cursor-pointer"
                >
                  <HiOutlineEye className="w-4 h-4" />
                  {expandedOrder === order._id ? 'Hide' : 'Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="pt-4 border-t border-glass-border mt-3 animate-slideDown">
                  <div className="space-y-3">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                             alt="" className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-text-muted">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-glass-border grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted text-xs mb-1">Shipping Address</p>
                      <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                      <p>{order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-xs mb-1">Payment</p>
                      <p>{order.paymentMethod}</p>
                      <p className={order.isPaid ? 'text-success' : 'text-warning'}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {order.status === 'Pending' && (
                    <div className="mt-4 pt-3 border-t border-glass-border flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn-danger !px-4 !py-2 text-xs cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
