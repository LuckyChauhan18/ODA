import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { PageLoader } from '../../components/Loader';

export default function ManageBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [highlight, setHighlight] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('');
  const [bg, setBg] = useState('linear-gradient(135deg, #FF6B54, #FF8E8E)');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/promo-banners');
      setBanners(data.data || []);
    } catch (err) {
      toast.error('Failed to load promo banners');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setHighlight('');
    setSubtitle('');
    setTag('');
    setBg('linear-gradient(135deg, #FF6B54, #FF8E8E)');
    setImage('');
    setLink('');
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setHighlight(banner.highlight);
    setSubtitle(banner.subtitle);
    setTag(banner.tag || '');
    setBg(banner.bg || 'linear-gradient(135deg, #FF6B54, #FF8E8E)');
    setImage(banner.image);
    setLink(banner.link);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, highlight, subtitle, tag, bg, image, link };

    try {
      if (editingBanner) {
        // Edit Banner
        const { data } = await api.put(`/promo-banners/${editingBanner._id}`, payload);
        if (data.success) {
          toast.success('Promo banner updated successfully');
          setBanners(banners.map(b => b._id === editingBanner._id ? data.data : b));
        }
      } else {
        // Add Banner
        const { data } = await api.post('/promo-banners', payload);
        if (data.success) {
          toast.success('Promo banner added successfully');
          setBanners([...banners, data.data]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo banner?')) return;

    try {
      const { data } = await api.delete(`/promo-banners/${id}`);
      if (data.success) {
        toast.success('Promo banner deleted successfully');
        setBanners(banners.filter(b => b._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Promo Banners</h1>
          <p className="text-text-secondary text-sm">Create and modify the trending carousel cards displayed on the Products page</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary !py-2.5 !px-4 flex items-center gap-2 text-sm"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : banners.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📢</p>
          <h3 className="text-lg font-semibold mb-1">No Promo Banners</h3>
          <p className="text-text-secondary text-sm mb-4">Add your first promotional slider card to display on the Products page</p>
          <button onClick={openAddModal} className="btn-primary">Add Banner</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="card relative flex flex-col justify-between overflow-hidden group shadow-md"
              style={{ minHeight: '240px' }}
            >
              {/* Preview Layer */}
              <div
                className="absolute inset-0 flex transition-all duration-300 opacity-90 group-hover:opacity-100"
                style={{ background: banner.bg }}
              >
                {/* Left Content */}
                <div className="w-7/12 p-6 flex flex-col justify-center text-white text-left select-none">
                  <div className="inline-block self-start px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-yellow-400 text-black mb-2 shadow-sm">
                    {banner.highlight}
                  </div>
                  <h2 className="text-lg font-black mb-1 leading-tight">{banner.title}</h2>
                  <p className="text-xs font-semibold opacity-90">{banner.subtitle}</p>
                  {banner.tag && <p className="text-[10px] opacity-75 mt-1">{banner.tag}</p>}
                </div>
                {/* Right Image */}
                <div
                  className="w-5/12 relative h-full overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </div>

              {/* Edit/Delete Overlay Actions */}
              <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(banner)}
                  className="p-2 bg-white/95 text-text hover:text-primary rounded-lg shadow-md transition-colors cursor-pointer"
                  title="Edit Banner"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 bg-white/95 text-danger hover:bg-danger hover:text-white rounded-lg shadow-md transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="card w-full max-w-lg relative !p-6 animate-scaleIn">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text cursor-pointer"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">{editingBanner ? 'Edit Promo Banner' : 'Add Promo Banner'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rakhi Specials"
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Highlight Tag</label>
                  <input
                    type="text"
                    required
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. Under ₹399"
                    className="input-field py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Clogs & sandals"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Description Line (Optional)</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. Step up now or miss out!"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Redirection Link / Category</label>
                  <input
                    type="text"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. /products?category=Rakhi"
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Background Gradient/Color</label>
                  <input
                    type="text"
                    required
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    placeholder="e.g. linear-gradient(...)"
                    className="input-field py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5 text-sm"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
