import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const emptyProduct = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  brand: '', images: [''], stock: '', featured: false,
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: product.description,
      price: product.price, originalPrice: product.originalPrice || '',
      category: product.category, brand: product.brand || '',
      images: product.images?.length ? product.images : [''],
      stock: product.stock, featured: product.featured,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: form.images.filter((img) => img.trim()),
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={openCreate} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Product</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Price</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">Stock</th>
                <th className="text-right px-4 py-3 text-text-muted font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt=""
                           className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                        {product.featured && <span className="badge-primary !text-[10px] !px-2 !py-0.5">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{product.category}</td>
                  <td className="px-4 py-3 font-semibold">₹{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                      {product.stock > 0 ? product.stock : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all cursor-pointer">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)}
                              className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all cursor-pointer">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto card glass-strong animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-glass-hover cursor-pointer">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                       className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea required rows={3} value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (₹)</label>
                  <input type="number" required min="0" value={form.price}
                         onChange={(e) => setForm({ ...form, price: e.target.value })}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Original Price (₹)</label>
                  <input type="number" min="0" value={form.originalPrice}
                         onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                         className="input-field" placeholder="For discount" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <input type="text" required value={form.category}
                         onChange={(e) => setForm({ ...form, category: e.target.value })}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Brand</label>
                  <input type="text" value={form.brand}
                         onChange={(e) => setForm({ ...form, brand: e.target.value })}
                         className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Image URL</label>
                <input type="url" value={form.images[0]}
                       onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                       className="input-field" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stock</label>
                  <input type="number" required min="0" value={form.stock}
                         onChange={(e) => setForm({ ...form, stock: e.target.value })}
                         className="input-field" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured}
                           onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                           className="w-4 h-4 accent-primary rounded" />
                    <span className="text-sm font-medium">Featured Product</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
