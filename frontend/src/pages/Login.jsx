import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--color-primary)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--color-accent-2)' }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="card glass-strong !p-8 animate-scaleIn">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="ODA Logo" className="w-14 h-14 mx-auto rounded-full object-cover border border-glass-border shadow-md mb-4" />
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-text-secondary text-sm mt-1">Sign in to your ODA account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10" placeholder="you@example.com"
                />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10" placeholder="••••••••"
                />
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-light font-semibold hover:text-primary">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-xl bg-surface-3/50 border border-glass-border">
            <p className="text-xs text-text-muted text-center mb-2">Demo Credentials</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEmail('user@oda.com'); setPassword('user123'); }}
                className="flex-1 text-xs py-1.5 rounded-lg bg-surface-4 text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => { setEmail('admin@oda.com'); setPassword('admin123'); }}
                className="flex-1 text-xs py-1.5 rounded-lg bg-surface-4 text-text-secondary hover:text-text transition-colors cursor-pointer"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
