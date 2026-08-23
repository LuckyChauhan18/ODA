import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil } from 'react-icons/hi';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = { name: form.name, email: form.email };
      if (form.password) updateData.password = form.password;
      await updateProfile(updateData);
      toast.success('Profile updated! ✅');
      setEditing(false);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="card">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-glass-border">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
               style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-text-secondary text-sm">{user?.email}</p>
            <span className={`text-xs font-medium mt-1 inline-block ${user?.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
                    className="ml-auto btn-secondary !px-3 !py-2 flex items-center gap-1 text-sm">
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <div className="relative">
                <input type="text" required value={form.name}
                       onChange={(e) => setForm({ ...form, name: e.target.value })}
                       className="input-field !pl-10" />
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <input type="email" required value={form.email}
                       onChange={(e) => setForm({ ...form, email: e.target.value })}
                       className="input-field !pl-10" />
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password <span className="text-text-muted">(leave empty to keep current)</span></label>
              <input type="password" value={form.password}
                     onChange={(e) => setForm({ ...form, password: e.target.value })}
                     className="input-field" placeholder="••••••••" minLength={6} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditing(false); setForm({ name: user.name, email: user.email, password: '' }); }}
                      className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-glass-border">
              <span className="text-text-secondary text-sm">Full Name</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-glass-border">
              <span className="text-text-secondary text-sm">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-glass-border">
              <span className="text-text-secondary text-sm">Role</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary text-sm">Member Since</span>
              <span className="font-medium">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
