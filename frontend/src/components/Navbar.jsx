import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineLocationMarker,
} from 'react-icons/hi';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 shadow-md">
      {/* Upper Header (Main Bar) */}
      <div className="bg-surface-2 border-b border-glass-border py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img src="/logo.jpg" alt="ODA Logo" className="w-9 h-9 rounded-full object-cover border border-glass-border shadow-sm group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg font-logo gradient-text animate-gradient group-hover:scale-105 group-hover:tracking-widest transition-all duration-300 hidden sm:block mt-1">
              ODA
            </span>
          </Link>

          {/* Search Bar (Amazon style) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2">
            <div className="relative flex items-center rounded-xl overflow-hidden border border-glass-border focus-within:ring-2 focus-within:ring-primary/50 bg-surface-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ODA..."
                className="w-full pl-3 pr-12 py-2 text-sm bg-transparent text-text placeholder-text-muted focus:outline-none"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-primary hover:bg-primary-dark text-white transition-colors duration-200 cursor-pointer flex items-center justify-center">
                <HiOutlineSearch className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Links (Amazon style) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
            {/* Account & Lists */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-left px-2 py-1.5 rounded-md hover:outline hover:outline-1 hover:outline-glass-border cursor-pointer transition-all"
                >
                  <p className="text-[10px] text-text-muted leading-tight">Hello, {user?.name?.split(' ')[0]}</p>
                  <p className="text-xs font-bold text-text leading-tight flex items-center gap-0.5">Account & Lists</p>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block text-left px-2 py-1.5 rounded-md hover:outline hover:outline-1 hover:outline-glass-border transition-all"
                >
                  <p className="text-[10px] text-text-muted leading-tight">Hello, sign in</p>
                  <p className="text-xs font-bold text-text leading-tight">Account & Lists</p>
                </Link>
              )}

              {/* User Dropdown */}
              {userMenuOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl glass-strong shadow-2xl shadow-black/30 animate-scaleIn overflow-hidden"
                     style={{ transformOrigin: 'top right' }}>
                  <div className="px-4 py-3 border-b border-glass-border">
                    <p className="text-sm font-semibold text-text">{user?.name}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-glass-hover transition-all"
                    >
                      <HiOutlineUser className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-glass-hover transition-all"
                    >
                      <HiOutlineClipboardList className="w-4 h-4" /> My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-glass-hover transition-all"
                    >
                      <HiOutlineHeart className="w-4 h-4" /> Wishlist
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-light hover:text-primary hover:bg-glass-hover transition-all"
                      >
                        <HiOutlineViewGrid className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-glass-hover transition-all cursor-pointer"
                    >
                      <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              to="/orders"
              className="text-left px-2 py-1.5 rounded-md hover:outline hover:outline-1 hover:outline-glass-border transition-all"
            >
              <p className="text-[10px] text-text-muted leading-tight">Returns</p>
              <p className="text-xs font-bold text-text leading-tight">& Orders</p>
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 rounded-md hover:outline hover:outline-1 hover:outline-glass-border text-text hover:text-secondary transition-all"
            >
              <HiOutlineHeart className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-end gap-1 px-2 py-1.5 rounded-md hover:outline hover:outline-1 hover:outline-glass-border text-text hover:text-primary transition-all relative"
            >
              <div className="relative">
                <HiOutlineShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 left-2 w-5 h-5 rounded-full text-[10px] font-bold
                                   flex items-center justify-center text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold mb-0.5">Cart</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Lower Header (Sub Navigation Bar) */}
      <div className="bg-surface-3 border-b border-glass-border py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary transition-colors"
          >
            <HiOutlineMenu className="w-4 h-4" /> All
          </Link>
          <Link
            to="/products?category=Toys"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Toys
          </Link>
          <Link
            to="/products?category=Home%20Decoration"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Home Decoration
          </Link>
          <Link
            to="/products?category=Rakhi"
            className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Rakhi
          </Link>

          {/* Optional right text info like Amazon */}
          <div className="ml-auto text-xs text-text-muted">
            Free shipping on orders over ₹500
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-strong border-t border-glass-border animate-slideDown">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                             bg-surface-3 border border-glass-border text-text placeholder-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              </div>
            </form>

            <Link to="/products" onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
              All
            </Link>
            <Link to="/products?category=Toys" onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
              Toys
            </Link>
            <Link to="/products?category=Home%20Decoration" onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
              Home Decoration
            </Link>
            <Link to="/products?category=Rakhi" onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
              Rakhi
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
                  <span>Cart</span>
                  {totalItems > 0 && <span className="badge-primary">{totalItems}</span>}
                </Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
                  Wishlist
                </Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
                  My Orders
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text hover:bg-glass-hover transition-all">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-primary-light hover:text-primary hover:bg-glass-hover transition-all">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-danger hover:bg-glass-hover transition-all cursor-pointer">
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary !py-2 text-sm flex-1 text-center">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary !py-2 text-sm flex-1 text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }}
        />
      )}
    </nav>
  );
}
