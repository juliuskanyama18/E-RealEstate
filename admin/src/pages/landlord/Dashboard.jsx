import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Building2, Users, DollarSign, Home } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatsCard from '../../components/StatsCard';
import { backendUrl, API } from '../../config/constants';

const LandlordDashboard = () => {
  const [stats, setStats] = useState({ houses: 0, occupied: 0, tenants: 0, monthlyRent: 0 });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesRes, tenantsRes] = await Promise.all([
          axios.get(`${backendUrl}${API.houses}`),
          axios.get(`${backendUrl}${API.tenants}`),
        ]);

        const houses = housesRes.data.data || [];
        const tenantsList = tenantsRes.data.data || [];

        const occupied = houses.filter((h) => h.isOccupied).length;
        const monthlyRent = tenantsList.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

        setStats({
          houses: houses.length,
          occupied,
          tenants: tenantsList.length,
          monthlyRent,
        });
        setTenants(tenantsList.slice(0, 8));
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balanceStatus = (balance) => {
    if (balance >= 0) return { label: 'Paid', cls: 'bg-green-100 text-green-700' };
    return { label: 'Outstanding', cls: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Dashboard" />
        <main className="flex-1 p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Houses" value={stats.houses} icon={Building2} color="blue" />
            <StatsCard title="Occupied" value={stats.occupied} icon={Home} color="green" sub={`${stats.houses ? Math.round((stats.occupied / stats.houses) * 100) : 0}% occupancy`} />
            <StatsCard title="Total Tenants" value={stats.tenants} icon={Users} color="purple" />
            <StatsCard title="Monthly Rent" value={`TZS ${stats.monthlyRent.toLocaleString()}`} icon={DollarSign} color="orange" />
          </div>

          {/* Recent Tenants */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Recent Tenants</h2>
              <Link to="/tenants" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No tenants yet.{' '}
                <Link to="/tenants" className="text-blue-600 hover:underline">Add your first tenant</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-medium">Name</th>
                      <th className="text-left px-6 py-3 font-medium">House</th>
                      <th className="text-right px-6 py-3 font-medium">Rent (TZS)</th>
                      <th className="text-right px-6 py-3 font-medium">Balance</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => {
                      const { label, cls } = balanceStatus(t.balance);
                      return (
                        <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <Link to={`/tenants/${t._id}`} className="font-medium text-gray-900 hover:text-blue-600">{t.name}</Link>
                            <p className="text-xs text-gray-400">{t.email}</p>
                          </td>
                          <td className="px-6 py-3.5 text-gray-600">{t.house?.name || '—'}</td>
                          <td className="px-6 py-3.5 text-right text-gray-900">{(t.rentAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-right text-gray-900">{(t.balance || 0).toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
                          </td>
                        </tr>
                      );
                    })}
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

export default LandlordDashboard;
