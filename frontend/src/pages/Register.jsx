import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Account created! Welcome to ODA 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--color-accent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--color-primary)' }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="card glass-strong !p-8 animate-scaleIn">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="ODA Logo" className="w-14 h-14 mx-auto rounded-full object-cover border border-glass-border shadow-md mb-4" />
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-text-secondary text-sm mt-1">Join ODA and start shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                       className="input-field !pl-10" placeholder="John Doe" />
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                       className="input-field !pl-10" placeholder="you@example.com" />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                       className="input-field !pl-10" placeholder="••••••••" />
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                       className="input-field !pl-10" placeholder="••••••••" />
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light font-semibold hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
