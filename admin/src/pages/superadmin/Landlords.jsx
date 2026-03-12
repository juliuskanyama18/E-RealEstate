import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const Landlords = () => {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchLandlords = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.admin.landlords}`);
      setLandlords(res.data.data || []);
    } catch { toast.error('Failed to load landlords'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLandlords(); }, []);

  const handleToggle = async (id, name, currentlyActive) => {
    setToggling(id);
    try {
      await axios.put(`${backendUrl}${API.admin.landlords}/${id}/toggle`);
      toast.success(`${name} ${currentlyActive ? 'suspended' : 'activated'}`);
      fetchLandlords();
    } catch (err) { toast.error(err.response?.data?.message || 'Toggle failed'); } finally { setToggling(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete landlord "${name}"? This will permanently remove all their houses, tenants, and rent records.`)) return;
    try {
      await axios.delete(`${backendUrl}${API.admin.landlords}/${id}`);
      toast.success(`${name} deleted`);
      fetchLandlords();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <Layout>
      <main className="flex-1 p-6">
        <p className="text-sm text-gray-500 mb-6">{landlords.length} landlord{landlords.length !== 1 ? 's' : ''} registered</p>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : landlords.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">No landlords registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">Landlord</th>
                    <th className="text-left px-6 py-3 font-medium">Phone</th>
                    <th className="text-center px-6 py-3 font-medium">Houses</th>
                    <th className="text-center px-6 py-3 font-medium">Tenants</th>
                    <th className="text-center px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {landlords.map((l) => (
                    <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-gray-900">{l.name}</p>
                        <p className="text-xs text-gray-400">{l.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{l.phone || '—'}</td>
                      <td className="px-6 py-3.5 text-center text-gray-600">{l.houseCount ?? 0}</td>
                      <td className="px-6 py-3.5 text-center text-gray-600">{l.tenantCount ?? 0}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {l.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggle(l._id, l.name, l.isActive)} disabled={toggling === l._id} title={l.isActive ? 'Suspend landlord' : 'Activate landlord'} className={`p-1.5 rounded-lg transition-colors ${l.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'} disabled:opacity-50`}>
                            {l.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => handleDelete(l._id, l.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete landlord">
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
      </main>
    </Layout>
  );
};

export default Landlords;
