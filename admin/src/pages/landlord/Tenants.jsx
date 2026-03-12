import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, X, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const emptyForm = {
  name: '', email: '', phone: '', password: '',
  rentAmount: '', rentDueDate: '', leaseStart: '', leaseEnd: '',
  houseId: '',
};

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [tr, hr] = await Promise.all([
        axios.get(`${backendUrl}${API.tenants}`),
        axios.get(`${backendUrl}${API.houses}`),
      ]);
      setTenants(tr.data.data || []);
      setHouses(hr.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await axios.post(`${backendUrl}${API.tenants}`, payload);
      toast.success('Tenant added successfully');
      setModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This will delete their account.`)) return;
    try {
      await axios.delete(`${backendUrl}${API.tenants}/${id}`);
      toast.success('Tenant removed');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const field = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Layout>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''}</p>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Tenant
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">No tenants yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">Name</th>
                    <th className="text-left px-6 py-3 font-medium">House</th>
                    <th className="text-right px-6 py-3 font-medium">Rent (TZS)</th>
                    <th className="text-right px-6 py-3 font-medium">Balance</th>
                    <th className="text-center px-6 py-3 font-medium">Due Day</th>
                    <th className="text-center px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{t.house?.name || '—'}</td>
                      <td className="px-6 py-3.5 text-right text-gray-900">{(t.rentAmount || 0).toLocaleString()}</td>
                      <td className={`px-6 py-3.5 text-right font-medium ${(t.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(t.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-center text-gray-500">{t.rentDueDate || '—'}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {t.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/tenants/${t._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => handleDelete(t._id, t.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Tenant Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">Add Tenant</h3>
                <button onClick={() => { setModal(false); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={(e) => field('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => field('email', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex">
                      <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-xs text-gray-500 select-none">+255</span>
                      <input
                        type="tel"
                        maxLength={9}
                        value={(form.phone || '').replace(/^\+255/, '')}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                          field('phone', digits ? `+255${digits}` : '');
                        }}
                        className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="712345678"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">House *</label>
                    <select required value={form.houseId} onChange={(e) => field('houseId', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Select house...</option>
                      {houses.map((h) => (
                        <option key={h._id} value={h._id}>{h.name} — {h.city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rent Amount (TZS) *</label>
                    <input required type="number" min="0" value={form.rentAmount} onChange={(e) => field('rentAmount', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="15000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rent Due Day (1–31) *</label>
                    <input required type="number" min="1" max="31" value={form.rentDueDate} onChange={(e) => field('rentDueDate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lease Start</label>
                    <input type="date" value={form.leaseStart} onChange={(e) => field('leaseStart', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lease End</label>
                    <input type="date" value={form.leaseEnd} onChange={(e) => field('leaseEnd', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password (optional — for tenant portal access)</label>
                    <input type="password" value={form.password} onChange={(e) => field('password', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 6 characters" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setModal(false); setForm(emptyForm); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {saving ? 'Adding...' : 'Add Tenant'}
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

export default Tenants;
