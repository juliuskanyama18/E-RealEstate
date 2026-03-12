import { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const TenantDashboard = () => {
  const [details, setDetails] = useState(null);
  const [rentStatus, setRentStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [detRes, statusRes, histRes] = await Promise.all([
          axios.get(`${backendUrl}${API.tenant.me}`),
          axios.get(`${backendUrl}${API.tenant.status}`),
          axios.get(`${backendUrl}${API.tenant.history}`),
        ]);
        setDetails(detRes.data.data);
        setRentStatus(statusRes.data.data);
        setHistory(histRes.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const isPaid = rentStatus?.status === 'paid';
  const daysUntilDue = rentStatus?.daysUntilDue ?? null;

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        <div className={`rounded-xl border shadow-sm p-6 ${isPaid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isPaid ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
                <span className={`text-sm font-semibold ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
                  {isPaid ? 'Rent Paid' : 'Payment Outstanding'}
                </span>
              </div>
              <p className={`text-3xl font-bold mt-2 ${isPaid ? 'text-green-800' : 'text-red-800'}`}>
                TZS {(rentStatus?.rentAmount || 0).toLocaleString()}
                <span className={`text-sm font-normal ml-1 ${isPaid ? 'text-green-600' : 'text-red-600'}`}>/month</span>
              </p>
            </div>
            <div className="text-right">
              {daysUntilDue !== null && (
                <p className={`text-sm font-medium ${daysUntilDue <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                  {daysUntilDue === 0 ? 'Due today' : daysUntilDue > 0 ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}` : `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Due on day {rentStatus?.rentDueDate} of each month</p>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t ${isPaid ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={isPaid ? 'text-green-700' : 'text-red-700'}>Account Balance</span>
              <span className={`font-semibold ${(rentStatus?.balance || 0) < 0 ? 'text-red-700' : 'text-green-700'}`}>
                TZS {(rentStatus?.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Home size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">House</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{rentStatus?.house?.name || '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{rentStatus?.house?.address}{rentStatus?.house?.city ? `, ${rentStatus.house.city}` : ''}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-purple-600" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lease End</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {rentStatus?.leaseEnd ? new Date(rentStatus.leaseEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Not set'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Landlord</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{details?.landlord?.name || '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{details?.landlord?.phone || details?.landlord?.email || ''}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No payment records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">Month</th>
                    <th className="text-right px-6 py-3 font-medium">Amount (TZS)</th>
                    <th className="text-center px-6 py-3 font-medium">Due Date</th>
                    <th className="text-center px-6 py-3 font-medium">Paid Date</th>
                    <th className="text-center px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">{r.month}</td>
                      <td className="px-6 py-3.5 text-right text-gray-900">{(r.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-center text-gray-500">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</td>
                      <td className="px-6 py-3.5 text-center text-gray-500">{r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.status === 'paid' ? 'bg-green-100 text-green-700' : r.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
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
    </Layout>
  );
};

export default TenantDashboard;
