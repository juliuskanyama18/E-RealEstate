import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl } from '../../config/constants';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Leases() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [rentHistories, setRentHistories] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('rental_token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${backendUrl}/api/landlord/houses/${id}`, { headers }),
      axios.get(`${backendUrl}/api/landlord/houses/${id}/leases`, { headers }),
    ])
      .then(([hRes, lRes]) => {
        setHouse(hRes.data.data);
        setLeases(lRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load leases'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleRow = async (lease) => {
    const leaseId = lease._id;
    if (expanded === leaseId) { setExpanded(null); return; }
    setExpanded(leaseId);
    if (!rentHistories[leaseId]) {
      try {
        const token = localStorage.getItem('rental_token');
        const r = await axios.get(`${backendUrl}/api/landlord/leases/${leaseId}/rent-history`, { headers: { Authorization: `Bearer ${token}` } });
        setRentHistories(prev => ({ ...prev, [leaseId]: r.data.data || [] }));
      } catch {
        setRentHistories(prev => ({ ...prev, [leaseId]: [] }));
      }
    }
  };

  const thS = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'center', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', letterSpacing: '0.05em' };
  const tdS = { padding: '14px 16px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'center' };

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            <span style={{ cursor: 'pointer', color: '#1d4ed8' }} onClick={() => navigate('/houses')}>Properties</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: '#1d4ed8' }} onClick={() => navigate(`/houses/${id}`)}>{house?.name?.toUpperCase() || '…'}</span>
            <span>/</span>
            <span style={{ color: '#374151', fontWeight: 600 }}>Leases</span>
          </div>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#042238' }}>Leases</h1>
            <button
              onClick={() => navigate(`/houses/${id}/create-lease`)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
              New lease
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ maxWidth: 1000, margin: '32px auto', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
            ) : leases.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No leases found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thS}>START DATE</th>
                    <th style={thS}>END DATE</th>
                    <th style={thS}>FREQUENCY</th>
                    <th style={thS}>AMOUNT</th>
                    <th style={{ ...thS, width: 80 }} />
                    <th style={{ ...thS, width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {leases.map(lease => (
                    <>
                      <tr key={lease._id}
                        style={{ background: expanded === lease._id ? '#eff6ff' : '#fff', transition: 'background 0.15s' }}
                      >
                        <td style={tdS}>{fmt(lease.startDate)}</td>
                        <td style={tdS}>{fmt(lease.endDate)}</td>
                        <td style={tdS}>{lease.frequency || '1 Month'}</td>
                        <td style={tdS}>TZS {Number(lease.rentAmount).toLocaleString()}</td>
                        <td style={{ ...tdS, textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/houses/${id}/create-lease`, { state: { editLeaseId: lease._id } })}
                            style={{ padding: '5px 16px', background: '#fff', color: '#1d4ed8', border: '1px solid #1d4ed8', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          >Edit</button>
                        </td>
                        <td style={{ ...tdS, textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRow(lease)}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#9ca3af"
                            style={{ transform: expanded === lease._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                          </svg>
                        </td>
                      </tr>

                      {expanded === lease._id && (
                        <tr key={`${lease._id}-hist`}>
                          <td colSpan={6} style={{ padding: '0 0 0 0', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ padding: '20px 24px 24px', background: '#fff' }}>
                              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#042238' }}>Rent history</p>
                              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ ...thS, textAlign: 'left', fontSize: 11 }}>Start date</th>
                                      <th style={{ ...thS, textAlign: 'left', fontSize: 11 }}>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {!rentHistories[lease._id] ? (
                                      <tr><td colSpan={2} style={{ ...tdS, textAlign: 'left', color: '#9ca3af' }}>Loading…</td></tr>
                                    ) : rentHistories[lease._id].length === 0 ? (
                                      <tr><td colSpan={2} style={{ ...tdS, textAlign: 'left', color: '#9ca3af' }}>No rent history.</td></tr>
                                    ) : rentHistories[lease._id].map(h => (
                                      <tr key={h._id}>
                                        <td style={{ ...tdS, textAlign: 'left' }}>{fmt(h.startDate)}</td>
                                        <td style={{ ...tdS, textAlign: 'left' }}>TZS {Number(h.amount).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
