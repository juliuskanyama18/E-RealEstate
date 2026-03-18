import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Trash2, Eye, Search, Users, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const Landlords = () => {
  const [landlords, setLandlords] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');

  const fetchLandlords = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.admin.landlords}`);
      setLandlords(res.data.data || []);
    } catch {
      toast.error('Failed to load landlords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLandlords(); }, []);

  const handleToggle = async (id, name, currentlyActive) => {
    setToggling(id);
    try {
      await axios.put(`${backendUrl}${API.admin.landlords}/${id}/toggle`);
      toast.success(`${name} ${currentlyActive ? 'suspended' : 'activated'}`);
      setLandlords(prev => prev.map(l => l._id === id ? { ...l, isActive: !currentlyActive } : l));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?\n\nThis will permanently remove all their houses, tenants, and rent records. This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`${backendUrl}${API.admin.landlords}/${id}`);
      toast.success(`${name} deleted`);
      setLandlords(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = useMemo(() =>
    landlords.filter(l => {
      const matchSearch = !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && l.isActive) ||
        (filter === 'suspended' && !l.isActive);
      return matchSearch && matchFilter;
    }),
  [landlords, search, filter]);

  const counts = useMemo(() => ({
    total:     landlords.length,
    active:    landlords.filter(l => l.isActive).length,
    suspended: landlords.filter(l => !l.isActive).length,
  }), [landlords]);

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Landlord Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">View, suspend, or remove landlords from the platform</p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all',       label: 'All',       count: counts.total,     badge: 'bg-gray-100 text-gray-700' },
            { key: 'active',    label: 'Active',    count: counts.active,    badge: 'bg-green-100 text-green-700' },
            { key: 'suspended', label: 'Suspended', count: counts.suspended, badge: 'bg-red-100 text-red-600' },
          ].map(({ key, label, count, badge }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                filter === key
                  ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${badge}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              {search || filter !== 'all' ? (
                <>
                  <p className="text-sm font-medium text-gray-400">No results match your filter</p>
                  <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-xs text-blue-600 hover:underline mt-2">
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <Users size={28} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No landlords registered yet</p>
                  <p className="text-xs text-gray-300 mt-1">Landlords self-register via the Register page</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-6 py-3 font-medium">Landlord</th>
                    <th className="text-left px-6 py-3 font-medium">Phone</th>
                    <th className="text-center px-6 py-3 font-medium">Houses</th>
                    <th className="text-center px-6 py-3 font-medium">Tenants</th>
                    <th className="text-center px-6 py-3 font-medium">Member Since</th>
                    <th className="text-center px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-gray-900">{l.name}</p>
                        <p className="text-xs text-gray-400">{l.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{l.phone || '—'}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          <Building2 size={11} className="text-gray-400" /> {l.houseCount ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          <Users size={11} className="text-gray-400" /> {l.tenantCount ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                        {new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {l.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/landlords/${l._id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View landlord details"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => handleToggle(l._id, l.name, l.isActive)}
                            disabled={toggling === l._id}
                            title={l.isActive ? 'Suspend landlord' : 'Activate landlord'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              l.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {toggling === l._id
                              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : l.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(l._id, l.name)}
                            disabled={deleting === l._id}
                            title="Delete landlord"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {deleting === l._id
                              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
                <p className="text-xs text-gray-400">
                  Showing {filtered.length} of {landlords.length} landlord{landlords.length !== 1 ? 's' : ''}
                  {(search || filter !== 'all') && ' (filtered)'}
                </p>
              </div>
            </div>
          )}
        </div>

        </div>
      </main>
    </Layout>
  );
};

export default Landlords;
