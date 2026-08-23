import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { PageLoader } from '../../components/Loader';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

const sidebarLinks = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid, exact: true },
  { path: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { path: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { path: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { path: '/admin/banners', label: 'Banners', icon: HiOutlineTrendingUp },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 space-y-1">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">Admin Panel</h2>
            {sidebarLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-primary/10 text-primary-light'
                      : 'text-text-secondary hover:text-text hover:bg-glass-hover'}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-glass-border">
          <div className="flex items-center justify-around py-2">
            {sidebarLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all
                    ${isActive ? 'text-primary-light' : 'text-text-muted'}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: HiOutlineCurrencyRupee, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: HiOutlineShoppingCart, color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: HiOutlineCube, color: 'from-purple-500 to-violet-600' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: 'from-orange-500 to-amber-600' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <HiOutlineTrendingUp className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="card !p-5 animate-slideUp" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {(stats?.orderStatusCounts || []).map((item) => {
              const total = stats?.totalOrders || 1;
              const pct = Math.round((item.count / total) * 100);
              const colors = {
                Processing: 'bg-yellow-500',
                Shipped: 'bg-blue-500',
                Delivered: 'bg-green-500',
                Cancelled: 'bg-red-500',
              };
              return (
                <div key={item._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item._id}</span>
                    <span className="text-text-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-4 overflow-hidden">
                    <div className={`h-full rounded-full ${colors[item._id] || 'bg-primary'}`}
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {(stats?.recentOrders || []).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{order.totalPrice.toLocaleString()}</p>
                  <span className={`text-xs ${
                    order.status === 'Delivered' ? 'text-success' :
                    order.status === 'Shipped' ? 'text-info' :
                    order.status === 'Cancelled' ? 'text-danger' : 'text-warning'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
