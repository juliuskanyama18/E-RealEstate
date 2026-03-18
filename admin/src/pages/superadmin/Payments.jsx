import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { CreditCard, Search, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const STATUS_META = {
  paid:    { label: 'Paid',    cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-600' },
};

const Payments = () => {
  const [records,      setRecords]      = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [monthFilter,  setMonthFilter]  = useState('');

  // Build list of months for the selector (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  }, []);

  useEffect(() => {
    const params = {};
    if (monthFilter) params.month = monthFilter;
    if (filter !== 'all') params.status = filter;

    axios.get(`${backendUrl}${API.admin.rentRecords}`, { params })
      .then(res => {
        setRecords(res.data.data || []);
        setMonthlyStats(res.data.monthlyStats || []);
      })
      .catch(() => toast.error('Failed to load payment records'))
      .finally(() => setLoading(false));
  }, [monthFilter, filter]);

  const filtered = useMemo(() =>
    records.filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.tenant?.name?.toLowerCase().includes(q) ||
        r.tenant?.email?.toLowerCase().includes(q) ||
        r.landlord?.name?.toLowerCase().includes(q) ||
        r.house?.name?.toLowerCase().includes(q)
      );
    }),
  [records, search]);

  // Summarize current view
  const summary = useMemo(() => {
    const paid    = filtered.filter(r => r.status === 'paid');
    const pending = filtered.filter(r => r.status === 'pending');
    const overdue = filtered.filter(r => r.status === 'overdue');
    return {
      totalAmount:   paid.reduce((s, r)    => s + (r.amount || 0), 0),
      paidCount:     paid.length,
      pendingCount:  pending.length,
      overdueCount:  overdue.length,
      pendingAmount: pending.reduce((s, r) => s + (r.amount || 0), 0),
      overdueAmount: overdue.reduce((s, r) => s + (r.amount || 0), 0),
    };
  }, [filtered]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Payments</h1>
              <p className="text-sm text-gray-400 mt-0.5">Platform-wide rent payment records</p>
            </div>
            {/* Month selector */}
            <select
              value={monthFilter}
              onChange={e => { setMonthFilter(e.target.value); setLoading(true); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All months</option>
              {monthOptions.map(o => (
                <option key={o.val} value={o.val}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Collected</p>
              <p className="text-2xl font-bold text-gray-900">TZS {summary.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.paidCount} payment{summary.paidCount !== 1 ? 's' : ''} recorded</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">TZS {summary.pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.pendingCount} pending record{summary.pendingCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600">TZS {summary.overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.overdueCount} overdue record{summary.overdueCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all',     label: 'All',     badge: 'bg-gray-100 text-gray-700' },
              { key: 'paid',    label: 'Paid',    badge: 'bg-green-100 text-green-700' },
              { key: 'pending', label: 'Pending', badge: 'bg-yellow-100 text-yellow-700' },
              { key: 'overdue', label: 'Overdue', badge: 'bg-red-100 text-red-600' },
            ].map(({ key, label, badge }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); setLoading(true); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  filter === key
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
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
                  placeholder="Search by tenant, landlord, or property…"
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
                {search ? (
                  <>
                    <p className="text-sm font-medium text-gray-400">No results match your search</p>
                    <button onClick={() => setSearch('')} className="text-xs text-blue-600 hover:underline mt-2">Clear search</button>
                  </>
                ) : (
                  <>
                    <TrendingUp size={28} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">No payment records found</p>
                    <p className="text-xs text-gray-300 mt-1">Records appear when landlords log rent payments</p>
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
                      <th className="text-center px-6 py-3 font-medium">Month</th>
                      <th className="text-center px-6 py-3 font-medium">Amount (TZS)</th>
                      <th className="text-center px-6 py-3 font-medium">Due Date</th>
                      <th className="text-center px-6 py-3 font-medium">Paid Date</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const badge = STATUS_META[r.status] || STATUS_META.pending;
                      return (
                        <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-gray-900">{r.tenant?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{r.tenant?.email || ''}</p>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-600">
                            {r.landlord?.name || '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-500 text-xs">
                            {r.house?.name || '—'}
                          </td>
                          <td className="px-6 py-3.5 text-center text-xs font-medium text-gray-700">
                            {r.month || '—'}
                          </td>
                          <td className="px-6 py-3.5 text-center font-semibold text-gray-800">
                            {(r.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                            {fmtDate(r.dueDate)}
                          </td>
                          <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                            {fmtDate(r.paidDate)}
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
                    Showing {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
                    {search && ' (filtered)'}
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

export default Payments;
