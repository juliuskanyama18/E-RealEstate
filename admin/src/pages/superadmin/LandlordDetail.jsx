import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Building2, Users, Mail, Phone, Calendar,
  ToggleLeft, ToggleRight, Trash2, Home, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

/* ── Small info row ── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
      <Icon size={13} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value || '—'}</p>
    </div>
  </div>
);

/* ── Stat pill ── */
const StatPill = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[color] || colors.blue}`}>
      <Icon size={18} />
      <div>
        <p className="text-xs font-medium opacity-70">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
};

const LandlordDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data,      setData]     = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [toggling,  setToggling] = useState(false);
  const [deleting,  setDeleting] = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}${API.admin.landlords}/${id}`)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load landlord details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    if (!data) return;
    setToggling(true);
    try {
      await axios.put(`${backendUrl}${API.admin.landlords}/${id}/toggle`);
      const next = !data.landlord.isActive;
      toast.success(`Landlord ${next ? 'activated' : 'suspended'}`);
      setData(prev => ({ ...prev, landlord: { ...prev.landlord, isActive: next } }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    if (!window.confirm(`Delete "${data.landlord.name}"?\n\nThis will permanently remove all their houses, tenants, and rent records. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await axios.delete(`${backendUrl}${API.admin.landlords}/${id}`);
      toast.success('Landlord deleted');
      navigate('/admin/landlords', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <main className="flex-1 min-h-screen bg-gray-50">
          <div className="text-center py-20">
            <p className="text-sm font-medium text-gray-400">Landlord not found</p>
            <Link to="/admin/landlords" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              ← Back to Landlords
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const { landlord, houses, tenants } = data;
  const monthlyRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

        {/* Back + header */}
        <div>
          <Link
            to="/admin/landlords"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Landlords
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {landlord.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-gray-900">{landlord.name}</h1>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${landlord.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {landlord.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{landlord.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 ${
                  landlord.isActive
                    ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {toggling
                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : landlord.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />
                }
                {landlord.isActive ? 'Suspend' : 'Activate'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
              >
                {deleting
                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <Trash2 size={14} />
                }
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatPill icon={Building2}  label="Houses"           value={houses.length}                                     color="blue" />
          <StatPill icon={Users}      label="Tenants"          value={tenants.length}                                    color="green" />
          <StatPill icon={DollarSign} label="Monthly Rent"     value={`TZS ${monthlyRent.toLocaleString()}`}            color="orange" />
        </div>

        {/* Info + Houses + Tenants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Landlord info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Info</p>
              <InfoRow icon={Mail}     label="Email"       value={landlord.email} />
              <InfoRow icon={Phone}    label="Phone"       value={landlord.phone} />
              <InfoRow icon={Calendar} label="Member Since" value={new Date(landlord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </div>

            {/* Suspended notice */}
            {!landlord.isActive && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Account Suspended</p>
                <p className="text-xs text-red-500 leading-relaxed">
                  This landlord and all their tenants are currently suspended. They cannot log in until activated.
                </p>
              </div>
            )}
          </div>

          {/* Right: Houses + Tenants */}
          <div className="lg:col-span-2 space-y-5">

            {/* Houses */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Houses</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{houses.length}</span>
              </div>
              {houses.length === 0 ? (
                <div className="p-8 text-center">
                  <Home size={24} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No houses added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                        <th className="text-left px-6 py-3 font-medium">Name</th>
                        <th className="text-left px-6 py-3 font-medium">Address</th>
                        <th className="text-center px-6 py-3 font-medium">Rent (TZS)</th>
                        <th className="text-center px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {houses.map((h) => (
                        <tr key={h._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-900">{h.name}</td>
                          <td className="px-6 py-3 text-gray-500 text-xs">
                            {[h.address, h.city].filter(Boolean).join(', ') || '—'}
                          </td>
                          <td className="px-6 py-3 text-center font-medium text-gray-700">
                            {(h.rentAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.isOccupied ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                              {h.isOccupied ? 'Occupied' : 'Vacant'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tenants */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Tenants</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{tenants.length}</span>
              </div>
              {tenants.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={24} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No tenants added yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                        <th className="text-left px-6 py-3 font-medium">Tenant</th>
                        <th className="text-left px-6 py-3 font-medium">House</th>
                        <th className="text-center px-6 py-3 font-medium">Rent (TZS)</th>
                        <th className="text-center px-6 py-3 font-medium">Balance</th>
                        <th className="text-center px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((t) => (
                        <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.email}</p>
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-xs">
                            {t.house?.name || '—'}
                          </td>
                          <td className="px-6 py-3 text-center font-medium text-gray-700">
                            {(t.rentAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-xs font-semibold ${(t.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              TZS {(t.balance || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {t.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

        </div>
      </main>
    </Layout>
  );
};

export default LandlordDetail;
