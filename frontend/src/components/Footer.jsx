import { Link } from 'react-router-dom';
import { HiOutlineMail } from 'react-icons/hi';
import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-surface-2 border-t border-glass-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group shrink-0">
              <img src="/logo.jpg" alt="ODA Logo" className="w-9 h-9 rounded-full object-cover border border-glass-border shadow-sm group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-lg font-logo gradient-text animate-gradient group-hover:scale-105 group-hover:tracking-widest transition-all duration-300 mt-1">
                ODA
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Your one-stop destination for premium products at unbeatable prices.
              Shop smarter, live better.
            </p>
            <div className="flex gap-3 mt-4">
              {[FaGithub, FaTwitter, FaInstagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center
                             bg-surface-3 text-text-muted hover:text-primary hover:bg-glass-hover
                             transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              {['All Products', 'Toys', 'Home Decoration', 'Rakhi'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'All Products' ? '/products' : `/products?category=${encodeURIComponent(item)}`} 
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'My Profile', to: '/profile' },
                { label: 'Orders', to: '/orders' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Cart', to: '/cart' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-text-secondary hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-text-secondary mb-3">
              Get the latest deals and new arrivals straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm
                             bg-surface-3 border border-glass-border text-text placeholder-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              </div>
              <button className="btn-primary !px-4 !py-2.5 text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} ODA. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
