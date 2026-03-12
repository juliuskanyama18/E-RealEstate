import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tr, hr] = await Promise.all([
          axios.get(`${backendUrl}${API.tenants}/${id}`),
          axios.get(`${backendUrl}${API.houses}`),
        ]);
        const t = tr.data.data;
        setTenant(t);
        setHouses(hr.data.data || []);
        setForm({
          name: t.name || '',
          email: t.email || '',
          phone: t.phone || '',
          houseId: t.house?._id || '',
          rentAmount: t.rentAmount || '',
          rentDueDate: t.rentDueDate || '',
          leaseStart: t.leaseStart ? t.leaseStart.split('T')[0] : '',
          leaseEnd: t.leaseEnd ? t.leaseEnd.split('T')[0] : '',
        });
        setBalanceInput(t.balance ?? 0);
      } catch {
        toast.error('Failed to load tenant');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${backendUrl}${API.tenants}/${id}`, form);
      toast.success('Tenant updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBalanceUpdate = async () => {
    setUpdatingBalance(true);
    try {
      await axios.put(`${backendUrl}${API.tenants}/${id}/balance`, { balance: Number(balanceInput) });
      toast.success('Balance updated');
      setTenant((prev) => ({ ...prev, balance: Number(balanceInput) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Balance update failed');
    } finally {
      setUpdatingBalance(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${tenant?.name}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${backendUrl}${API.tenants}/${id}`);
      toast.success('Tenant removed');
      navigate('/tenants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const field = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!tenant) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-gray-500">Tenant not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <Link to="/tenants" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Tenants
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
            <Trash2 size={14} /> Remove Tenant
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Balance</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Current Balance (TZS)</p>
              <p className={`text-2xl font-bold ${(tenant.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(tenant.balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <button
                onClick={handleBalanceUpdate}
                disabled={updatingBalance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {updatingBalance ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tenant Information</h3>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.name} onChange={(e) => field('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => field('email', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-xs text-gray-500 select-none">+255</span>
                <input
                  type="tel"
                  maxLength={9}
                  value={(form.phone || '').replace(/^\+255/, '')}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                    field('phone', digits ? `+255${digits}` : '');
                  }}
                  className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="712345678"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">House</label>
              <select value={form.houseId} onChange={(e) => field('houseId', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">No house assigned</option>
                {houses.map((h) => (
                  <option key={h._id} value={h._id}>{h.name} — {h.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rent Amount (TZS)</label>
              <input type="number" min="0" value={form.rentAmount} onChange={(e) => field('rentAmount', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rent Due Day (1–31)</label>
              <input type="number" min="1" max="31" value={form.rentDueDate} onChange={(e) => field('rentDueDate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lease Start</label>
              <input type="date" value={form.leaseStart} onChange={(e) => field('leaseStart', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lease End</label>
              <input type="date" value={form.leaseEnd} onChange={(e) => field('leaseEnd', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
};

export default TenantDetail;
