import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Wrench, Search } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const STATUS_META = {
  open:        { label: 'Open',        cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700' },
  resolved:    { label: 'Resolved',    cls: 'bg-green-100 text-green-700' },
  closed:      { label: 'Closed',      cls: 'bg-gray-100 text-gray-500' },
};

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    axios.get(`${backendUrl}${API.admin.maintenance}`)
      .then(res => setRequests(res.data.data || []))
      .catch(() => toast.error('Failed to load maintenance requests'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    requests.filter(r => {
      const matchSearch = !search ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        r.house?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.landlord?.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        (filter === 'open'        && r.status === 'open') ||
        (filter === 'in_progress' && r.status === 'in_progress') ||
        (filter === 'resolved'    && r.status === 'resolved') ||
        (filter === 'closed'      && r.status === 'closed');
      return matchSearch && matchFilter;
    }),
  [requests, search, filter]);

  const counts = useMemo(() => ({
    total:       requests.length,
    open:        requests.filter(r => r.status === 'open').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    resolved:    requests.filter(r => r.status === 'resolved').length,
    closed:      requests.filter(r => r.status === 'closed').length,
  }), [requests]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-sm text-gray-400 mt-0.5">Platform-wide maintenance activity across all properties</p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all',         label: 'All',         count: counts.total,       badge: 'bg-gray-100 text-gray-700' },
              { key: 'open',        label: 'Open',        count: counts.open,        badge: 'bg-blue-100 text-blue-700' },
              { key: 'in_progress', label: 'In Progress', count: counts.in_progress, badge: 'bg-yellow-100 text-yellow-700' },
              { key: 'resolved',    label: 'Resolved',    count: counts.resolved,    badge: 'bg-green-100 text-green-700' },
              { key: 'closed',      label: 'Closed',      count: counts.closed,      badge: 'bg-gray-100 text-gray-500' },
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
                  placeholder="Search by title, category, property, or landlord…"
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
                    <Wrench size={28} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">No maintenance requests yet</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-6 py-3 font-medium">Request</th>
                      <th className="text-left px-6 py-3 font-medium">Property</th>
                      <th className="text-left px-6 py-3 font-medium">Landlord</th>
                      <th className="text-center px-6 py-3 font-medium">Submitted By</th>
                      <th className="text-center px-6 py-3 font-medium">Date</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const badge = STATUS_META[r.status] || STATUS_META.open;
                      return (
                        <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-gray-900">{r.title}</p>
                            <p className="text-xs text-gray-400">{r.category}</p>
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="text-sm text-gray-700">{r.house?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{r.house?.address || ''}</p>
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="text-sm text-gray-700">{r.landlord?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{r.landlord?.email || ''}</p>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              r.submittedBy === 'tenant'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {r.submittedBy === 'tenant'
                                ? r.tenant?.name || 'Tenant'
                                : 'Landlord'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                            {fmtDate(r.createdAt)}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
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

export default Maintenance;
