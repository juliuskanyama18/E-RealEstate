import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Building2, MapPin, DollarSign, BedDouble, Bath } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const HouseDetail = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [houseRes, tenantsRes] = await Promise.all([
          axios.get(`${backendUrl}${API.houses}/${id}`),
          axios.get(`${backendUrl}${API.houses}/${id}/tenants`),
        ]);
        setHouse(houseRes.data.data);
        setTenants(tenantsRes.data.data || []);
      } catch {
        toast.error('Failed to load house details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!house) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-gray-500">House not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-6 space-y-6">
        <Link to="/houses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Houses
        </Link>

        {/* House Info Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{house.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{house.address}, {house.city}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${house.isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {house.isOccupied ? 'Occupied' : 'Vacant'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { icon: DollarSign, label: 'Monthly Rent', value: `TZS ${(house.rentAmount || 0).toLocaleString()}` },
              { icon: BedDouble, label: 'Bedrooms', value: house.bedrooms },
              { icon: Bath, label: 'Bathrooms', value: house.bathrooms },
              { icon: MapPin, label: 'City', value: house.city },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {house.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
              <p className="text-sm text-gray-600">{house.description}</p>
            </div>
          )}
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Tenants in this House</h3>
            <Link to="/tenants" className="text-sm text-blue-600 hover:underline">Manage Tenants</Link>
          </div>
          {tenants.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No tenants assigned to this house yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">Name</th>
                    <th className="text-left px-6 py-3 font-medium">Email</th>
                    <th className="text-right px-6 py-3 font-medium">Rent (TZS)</th>
                    <th className="text-right px-6 py-3 font-medium">Balance</th>
                    <th className="text-center px-6 py-3 font-medium">Due Day</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link to={`/tenants/${t._id}`} className="font-medium text-gray-900 hover:text-blue-600">{t.name}</Link>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{t.email}</td>
                      <td className="px-6 py-3.5 text-right">{(t.rentAmount || 0).toLocaleString()}</td>
                      <td className={`px-6 py-3.5 text-right font-medium ${(t.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(t.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-center text-gray-500">{t.rentDueDate || '—'}</td>
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

export default HouseDetail;
