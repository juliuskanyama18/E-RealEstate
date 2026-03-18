import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, UserCheck,
  UserX, TrendingUp, ArrowRight, Wrench, AlertTriangle,
  Home, CheckCircle2, CreditCard,
} from 'lucide-react';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import { backendUrl, API } from '../../config/constants';

const SuperadminDashboard = () => {
  const [stats, setStats]       = useState(null);
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${backendUrl}${API.admin.stats}`),
      axios.get(`${backendUrl}${API.admin.landlords}`),
    ]).then(([statsRes, landlordsRes]) => {
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data || {});
      }
      if (landlordsRes.status === 'fulfilled') {
        setLandlords((landlordsRes.value.data.data || []).slice(0, 8));
      }
    }).finally(() => setLoading(false));
  }, []);

  const s = stats || {};

  const occupancyRate = s.totalHouses > 0
    ? Math.min(Math.round((s.occupiedHouses / s.totalHouses) * 100), 100) : 0;
  const activeRate = s.totalLandlords > 0
    ? Math.round((s.activeLandlords / s.totalLandlords) * 100) : 0;
  const collectionRate = s.totalTenants > 0
    ? Math.min(Math.round((s.collectedCount / s.totalTenants) * 100), 100) : 0;

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
              <p className="text-sm text-gray-400 mt-0.5">System-wide analytics across all landlords</p>
            </div>
            <Link
              to="/admin/landlords"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm transition-colors"
            >
              Manage Landlords <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Landlord stats ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Landlords</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatsCard title="Total Landlords"  value={s.totalLandlords     ?? 0} icon={UserCheck} color="purple" sub="Registered on platform" />
                  <StatsCard title="Active Landlords" value={s.activeLandlords    ?? 0} icon={UserCheck} color="green"  sub={`${activeRate}% of total`} />
                  <StatsCard title="Suspended"        value={s.suspendedLandlords ?? 0} icon={UserX}     color="red"    sub={s.suspendedLandlords > 0 ? 'Require attention' : 'None suspended'} />
                </div>
              </div>

              {/* ── Platform stats ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatsCard title="Total Tenants"      value={s.totalTenants       ?? 0}                                     icon={Users}      color="blue"   sub={`${s.overdueTenantsCount ?? 0} with overdue balance`} />
                  <StatsCard title="Total Properties"   value={s.totalHouses        ?? 0}                                     icon={Building2}  color="orange" sub={`${s.occupiedHouses ?? 0} occupied · ${(s.totalHouses ?? 0) - (s.occupiedHouses ?? 0)} vacant`} />
                  <StatsCard title="Platform Rent / Mo" value={`TZS ${(s.totalMonthlyRent ?? 0).toLocaleString()}`}          icon={DollarSign} color="green"  sub="Combined monthly rent" />
                </div>
              </div>

              {/* ── Maintenance & Payments stats ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatsCard title="Open Maintenance"    value={s.openMaintenance  ?? 0}                                                icon={Wrench}     color="orange" sub={`${s.totalMaintenance ?? 0} total requests`} />
                  <StatsCard title="Collected This Month" value={`TZS ${(s.collectedThisMonth ?? 0).toLocaleString()}`}                icon={CreditCard} color="green"  sub={`${s.collectedCount ?? 0} payments recorded`} />
                  <StatsCard title="Overdue Tenants"     value={s.overdueTenantsCount ?? 0}                                            icon={AlertTriangle} color="red"  sub="Negative balance" />
                </div>
              </div>

              {/* ── Metric bars ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Occupancy */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">House Occupancy</p>
                    <span className="text-lg font-bold text-gray-900">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${occupancyRate}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.occupiedHouses ?? 0} occupied · {(s.totalHouses ?? 0) - (s.occupiedHouses ?? 0)} vacant
                  </p>
                </div>

                {/* Landlord health */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Landlord Health</p>
                    <span className="text-lg font-bold text-gray-900">{activeRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${activeRate}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.activeLandlords ?? 0} active · {s.suspendedLandlords ?? 0} suspended
                  </p>
                </div>

                {/* Collection rate */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Collection Rate</p>
                    <span className="text-lg font-bold text-gray-900">{collectionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-purple-500 transition-all duration-700" style={{ width: `${collectionRate}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.collectedCount ?? 0} of {s.totalTenants ?? 0} tenants paid this month
                  </p>
                </div>
              </div>

              {/* ── Quick links ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'All Landlords',  to: '/admin/landlords',   icon: UserCheck,  bg: 'bg-purple-50', color: 'text-purple-600' },
                  { label: 'All Tenants',    to: '/admin/tenants',     icon: Users,      bg: 'bg-blue-50',   color: 'text-blue-600' },
                  { label: 'Maintenance',    to: '/admin/maintenance', icon: Wrench,     bg: 'bg-orange-50', color: 'text-orange-600' },
                  { label: 'Payments',       to: '/admin/payments',    icon: CreditCard, bg: 'bg-green-50',  color: 'text-green-600' },
                ].map(({ label, to, icon: Icon, bg, color }) => (
                  <Link
                    key={label}
                    to={to}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2.5 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} group-hover:scale-105 transition-transform`}>
                      <Icon size={18} className={color} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
                  </Link>
                ))}
              </div>

              {/* ── Recent Landlords table ── */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Recent Landlords</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Most recently registered</p>
                  </div>
                  <Link to="/admin/landlords" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                {landlords.length === 0 ? (
                  <div className="p-10 text-center">
                    <TrendingUp size={28} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">No landlords registered yet</p>
                    <p className="text-xs text-gray-300 mt-1">Landlords self-register via the Register page</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                          <th className="text-left px-6 py-3 font-medium">Landlord</th>
                          <th className="text-center px-6 py-3 font-medium">Houses</th>
                          <th className="text-center px-6 py-3 font-medium">Tenants</th>
                          <th className="text-center px-6 py-3 font-medium">Status</th>
                          <th className="text-right px-6 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landlords.map((l) => (
                          <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3.5">
                              <p className="font-medium text-gray-900">{l.name}</p>
                              <p className="text-xs text-gray-400">{l.email}</p>
                            </td>
                            <td className="px-6 py-3.5 text-center font-medium text-gray-700">
                              <span className="inline-flex items-center gap-1"><Home size={11} className="text-gray-400" /> {l.houseCount ?? 0}</span>
                            </td>
                            <td className="px-6 py-3.5 text-center font-medium text-gray-700">
                              <span className="inline-flex items-center gap-1"><Users size={11} className="text-gray-400" /> {l.tenantCount ?? 0}</span>
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {l.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <Link to={`/admin/landlords/${l._id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                View →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </Layout>
  );
};

export default SuperadminDashboard;
