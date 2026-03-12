import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const emptyForm = { name: '', address: '', city: '', rentAmount: '', bedrooms: 1, bathrooms: 1, description: '' };

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchHouses = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.houses}`);
      setHouses(res.data.data || []);
    } catch {
      toast.error('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (h) => { setForm({ name: h.name, address: h.address, city: h.city, rentAmount: h.rentAmount, bedrooms: h.bedrooms, bathrooms: h.bathrooms, description: h.description || '' }); setEditId(h._id); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`${backendUrl}${API.houses}/${editId}`, form);
        toast.success('House updated');
      } else {
        await axios.post(`${backendUrl}${API.houses}`, form);
        toast.success('House added');
      }
      closeModal();
      fetchHouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this house? This cannot be undone.')) return;
    try {
      await axios.delete(`${backendUrl}${API.houses}/${id}`);
      toast.success('House deleted');
      fetchHouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const field = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Layout>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{houses.length} propert{houses.length === 1 ? 'y' : 'ies'}</p>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add House
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : houses.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">No houses yet. Add your first property.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Location</th>
                  <th className="text-right px-6 py-3 font-medium">Rent (TZS)</th>
                  <th className="text-center px-6 py-3 font-medium">Beds / Baths</th>
                  <th className="text-center px-6 py-3 font-medium">Status</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((h) => (
                  <tr key={h._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link to={`/houses/${h._id}`} className="font-medium text-gray-900 hover:text-blue-600">{h.name}</Link>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{h.address}, {h.city}</td>
                    <td className="px-6 py-3.5 text-right text-gray-900">{(h.rentAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-center text-gray-500">{h.bedrooms} / {h.bathrooms}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${h.isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {h.isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(h)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(h._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">{editId ? 'Edit House' : 'Add House'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input required value={form.name} onChange={(e) => field('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sunrise Apartments" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                    <input required value={form.address} onChange={(e) => field('address', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123 Main Street" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                    <input required value={form.city} onChange={(e) => field('city', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dar es Salaam" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rent (TZS) *</label>
                    <input required type="number" min="0" value={form.rentAmount} onChange={(e) => field('rentAmount', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="15000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input type="number" min="1" value={form.bedrooms} onChange={(e) => field('bedrooms', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input type="number" min="1" value={form.bathrooms} onChange={(e) => field('bathrooms', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={form.description} onChange={(e) => field('description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional notes..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add House'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Houses;
