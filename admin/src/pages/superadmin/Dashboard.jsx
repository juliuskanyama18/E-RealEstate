import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Building2, Users, DollarSign, UserCheck } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatsCard from '../../components/StatsCard';
import { backendUrl, API } from '../../config/constants';

const SuperadminDashboard = () => {
  const [stats, setStats] = useState({ landlords: 0, tenants: 0, houses: 0, monthlyRent: 0 });
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, landlordsRes] = await Promise.all([
          axios.get(`${backendUrl}${API.admin.stats}`),
          axios.get(`${backendUrl}${API.admin.landlords}`),
        ]);
        const s = statsRes.data.data || {};
        setStats({
          landlords: s.totalLandlords || 0,
          tenants: s.totalTenants || 0,
          houses: s.totalHouses || 0,
          monthlyRent: s.totalMonthlyRent || 0,
        });
        setLandlords((landlordsRes.data.data || []).slice(0, 8));
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Platform Overview" />
        <main className="flex-1 p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Landlords" value={stats.landlords} icon={UserCheck} color="purple" />
            <StatsCard title="Total Tenants" value={stats.tenants} icon={Users} color="blue" />
            <StatsCard title="Total Houses" value={stats.houses} icon={Building2} color="green" />
            <StatsCard title="Platform Rent / Mo" value={`TZS ${stats.monthlyRent.toLocaleString()}`} icon={DollarSign} color="orange" />
          </div>

          {/* Recent Landlords */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Landlords</h2>
              <Link to="/admin/landlords" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : landlords.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No landlords registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-medium">Name</th>
                      <th className="text-left px-6 py-3 font-medium">Email</th>
                      <th className="text-center px-6 py-3 font-medium">Houses</th>
                      <th className="text-center px-6 py-3 font-medium">Tenants</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landlords.map((l) => (
                      <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-gray-900">{l.name}</td>
                        <td className="px-6 py-3.5 text-gray-500">{l.email}</td>
                        <td className="px-6 py-3.5 text-center text-gray-600">{l.houseCount ?? 0}</td>
                        <td className="px-6 py-3.5 text-center text-gray-600">{l.tenantCount ?? 0}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {l.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
