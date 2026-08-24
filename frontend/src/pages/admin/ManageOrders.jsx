import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/Loader';
import toast from 'react-hot-toast';

const statusOptions = ['Pending', 'Out for Delivery', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'badge-warning',
  'Out for Delivery': 'badge-info',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders?limit=100');
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      fetchOrders();
      return;
    }

    // Check if query is a 24-char Mongo ID
    if (/^[0-9a-fA-F]{24}$/.test(query)) {
      setIsSearching(true);
      setLoading(true);
      try {
        // 1. Try fetching by Order ID first
        try {
          const { data } = await api.get(`/orders/${query}`);
          if (data?.data) {
            setOrders([data.data]);
            toast.success('Found Order by Order ID!');
            setLoading(false);
            setIsSearching(false);
            return;
          }
        } catch (_) {
          // If not an order ID, try user ID
        }

        // 2. Try fetching by User ID
        const { data } = await api.get(`/orders/user/${query}`);
        setOrders(data.data || []);
        toast.success(`Found ${data.count || data.data?.length || 0} order(s) for User ID`);
      } catch (err) {
        toast.error('No matching order or user found for this ID');
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
      return;
    }

    // Otherwise, filter locally by Name, Email, or partial Order ID
    fetchOrders();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase().trim();
    const matchesId = o._id.toLowerCase().includes(term);
    const matchesUser = o.user?.name?.toLowerCase().includes(term);
    const matchesEmail = o.user?.email?.toLowerCase().includes(term);
    const matchesAddress = `${o.shippingAddress?.city} ${o.shippingAddress?.street}`.toLowerCase().includes(term);

    return matchesId || matchesUser || matchesEmail || matchesAddress;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm bg-surface-3 border border-glass-border text-text focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Unified Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3 max-w-2xl">
        <input
          type="text"
          placeholder="Search by Order ID, User ID, Customer Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field !py-2 text-sm flex-1"
        />
        <button type="submit" className="btn-primary !px-4 !py-2 text-sm cursor-pointer whitespace-nowrap">
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="btn-secondary !px-4 !py-2 text-sm cursor-pointer"
          >
            Clear
          </button>
        )}
      </form>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Total</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="hover:underline cursor-pointer text-left"
                      title="Click to view complete order details"
                    >
                      {order._id}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-text-muted">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={statusColors[order.status] || 'badge-warning'}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs bg-surface-3 border border-glass-border text-text cursor-pointer"
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-secondary !px-2.5 !py-1 text-xs cursor-pointer whitespace-nowrap"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-text-muted">No orders found matching your search.</div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-glass-border pb-4">
              <div>
                <h2 className="text-lg font-bold">Order Details</h2>
                <p className="text-xs font-mono text-text-muted select-all">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary !px-3 !py-1 text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-surface-3/50 p-4 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1">CUSTOMER INFO</p>
                <p className="font-medium">{selectedOrder.user?.name || 'N/A'}</p>
                <p className="text-text-muted">{selectedOrder.user?.email}</p>
                {selectedOrder.user?._id && (
                  <p className="text-xs font-mono text-text-muted mt-1 select-all">User ID: {selectedOrder.user._id}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1">SHIPPING ADDRESS</p>
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zip}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm p-4 bg-surface-3/50 rounded-xl">
              <div>
                <span className="text-xs text-text-muted">Payment: </span>
                <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                <span className={`ml-2 text-xs ${selectedOrder.isPaid ? 'text-success font-semibold' : 'text-warning'}`}>
                  ({selectedOrder.isPaid ? 'Paid' : 'Unpaid'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Status: </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                  className="px-3 py-1 rounded-lg text-xs bg-surface-2 border border-glass-border font-medium cursor-pointer"
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <p className="text-xs font-semibold text-text-muted mb-3">ITEMS ORDERED</p>
              <div className="space-y-2">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-glass-border pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold">Total Amount</span>
              <span className="text-xl font-bold text-primary">₹{selectedOrder.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
