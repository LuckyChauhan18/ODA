import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left px-4 py-3 text-text-muted font-semibold">User</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Role</th>
                <th className="text-right px-4 py-3 text-text-muted font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                           style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs bg-surface-3 border border-glass-border text-text cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all cursor-pointer"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
