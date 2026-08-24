import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/Loader';
import toast from 'react-hot-toast';

const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors = {
  Processing: 'badge-warning',
  Shipped: 'badge-info',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders?limit=50');
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
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    if (!searchUserId.trim()) {
      fetchOrders();
      return;
    }
    
    // Validate Mongo ID format
    if (!/^[0-9a-fA-F]{24}$/.test(searchUserId.trim())) {
      toast.error('Invalid User ID format. User ID must be a 24-character hex string.');
      return;
    }

    try {
      setIsSearching(true);
      setLoading(true);
      const { data } = await api.get(`/orders/user/${searchUserId.trim()}`);
      setOrders(data.data);
      toast.success(`Found ${data.count} order(s) for user`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to search orders for user');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchUserId('');
    fetchOrders();
  };

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm bg-surface-3 border border-glass-border text-text focus:outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <form onSubmit={handleUserSearch} className="mb-6 flex gap-3 max-w-lg">
        <input
          type="text"
          placeholder="Paste User ID here (24-character hex)..."
          value={searchUserId}
          onChange={(e) => setSearchUserId(e.target.value)}
          className="input-field !py-2 text-sm flex-1"
        />
        <button type="submit" className="btn-primary !px-4 !py-2 text-sm cursor-pointer whitespace-nowrap">
          Search User Orders
        </button>
        {searchUserId && (
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
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-text-muted">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={statusColors[order.status]}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs bg-surface-3 border border-glass-border text-text cursor-pointer"
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-text-muted">No orders found.</div>
      )}
    </div>
  );
}
