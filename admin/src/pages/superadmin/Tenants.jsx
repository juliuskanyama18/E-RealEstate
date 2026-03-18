import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Users, Search, AlertTriangle } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const Tenants = () => {
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [filter,  setFilter]    = useState('all');

  useEffect(() => {
    axios.get(`${backendUrl}${API.admin.tenants}`)
      .then(res => setTenants(res.data.data || []))
      .catch(() => toast.error('Failed to load tenants'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    tenants.filter(t => {
      const matchSearch = !search ||
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.house?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.landlord?.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        (filter === 'active'    && t.isActive) ||
        (filter === 'suspended' && !t.isActive) ||
        (filter === 'overdue'   && (t.balance || 0) < 0);
      return matchSearch && matchFilter;
    }),
  [tenants, search, filter]);

  const counts = useMemo(() => ({
    total:     tenants.length,
    active:    tenants.filter(t => t.isActive).length,
    suspended: tenants.filter(t => !t.isActive).length,
    overdue:   tenants.filter(t => (t.balance || 0) < 0).length,
  }), [tenants]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Tenants</h1>
            <p className="text-sm text-gray-400 mt-0.5">Platform-wide tenant directory across all landlords</p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all',       label: 'All',       count: counts.total,     badge: 'bg-gray-100 text-gray-700' },
              { key: 'active',    label: 'Active',    count: counts.active,    badge: 'bg-green-100 text-green-700' },
              { key: 'suspended', label: 'Suspended', count: counts.suspended, badge: 'bg-red-100 text-red-600' },
              { key: 'overdue',   label: 'Overdue',   count: counts.overdue,   badge: 'bg-orange-100 text-orange-700' },
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
                  placeholder="Search by name, email, house, or landlord…"
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
                    <p className="text-sm font-medium text-gray-400">No tenants on the platform yet</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-6 py-3 font-medium">Tenant</th>
                      <th className="text-left px-6 py-3 font-medium">Landlord</th>
                      <th className="text-left px-6 py-3 font-medium">Property</th>
                      <th className="text-center px-6 py-3 font-medium">Rent (TZS)</th>
                      <th className="text-center px-6 py-3 font-medium">Balance</th>
                      <th className="text-center px-6 py-3 font-medium">Due Day</th>
                      <th className="text-center px-6 py-3 font-medium">Since</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-sm text-gray-700">{t.landlord?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{t.landlord?.email || ''}</p>
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 text-xs">
                          {t.house?.name || '—'}
                          {t.house?.address && <p className="text-gray-400">{t.house.address}</p>}
                        </td>
                        <td className="px-6 py-3.5 text-center font-medium text-gray-700">
                          {(t.rentAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`text-xs font-semibold ${(t.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(t.balance || 0) < 0 ? '-' : ''}TZS {Math.abs(t.balance || 0).toLocaleString()}
                          </span>
                          {(t.balance || 0) < 0 && (
                            <AlertTriangle size={11} className="inline ml-1 text-red-400" />
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-center text-xs text-gray-500">
                          {t.rentDueDate ? `Day ${t.rentDueDate}` : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                          {fmtDate(t.createdAt)}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {t.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
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

export default Tenants;
