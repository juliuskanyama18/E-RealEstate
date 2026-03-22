import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const NAVY = '#042238';
const FONT = '"Open Sans", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';

/* ── Maintenance illustration ─────────────────────────────── */
const MaintenanceIllustration = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Light blue circle blob */}
    <circle cx="130" cy="158" r="98" fill="#bae6fd" opacity="0.55"/>
    {/* Card shadow */}
    <rect x="53" y="17" width="158" height="188" rx="10" fill="#00000009" transform="translate(3,4)"/>
    {/* White card */}
    <rect x="53" y="17" width="158" height="188" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5"/>
    {/* OPEN badge */}
    <rect x="65" y="31" width="40" height="16" rx="8" fill="#fee2e2"/>
    <text x="85" y="43" textAnchor="middle" fontSize="8" fontWeight="700" fill="#dc2626" fontFamily="Arial, sans-serif" letterSpacing="0.8">OPEN</text>
    {/* Wrench icon circle */}
    <circle cx="77" cy="76" r="15" fill="#f3f4f6"/>
    <path d="M72 72 C72 69 75 67 78 67 C81 67 84 69 84 72 L82 74 C83 77 81 80 78 80 C75 80 73 77 74 74 Z" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="78" y1="80" x2="78" y2="85" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
    <line x1="75" y1="85" x2="81" y2="85" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Title */}
    <text x="99" y="70" fontSize="12" fontWeight="700" fill="#111827" fontFamily="Arial, sans-serif">Leaky Faucet</text>
    <text x="99" y="84" fontSize="8" fill="#9ca3af" fontFamily="Arial, sans-serif">12 Main St. Denver, CO 80230</text>
    {/* Divider */}
    <line x1="65" y1="98" x2="197" y2="98" stroke="#f0f0f0" strokeWidth="1"/>
    {/* Description */}
    <text x="65" y="112" fontSize="9" fontWeight="700" fill="#374151" fontFamily="Arial, sans-serif">Description:</text>
    <text x="65" y="125" fontSize="8" fill="#6b7280" fontFamily="Arial, sans-serif">The sink in the kitchen is dripping. Not</text>
    <text x="65" y="137" fontSize="8" fill="#6b7280" fontFamily="Arial, sans-serif">a lot of water is coming out but just a</text>
    <text x="65" y="149" fontSize="8" fill="#6b7280" fontFamily="Arial, sans-serif">slow drip. Maybe once every 30 seconds.</text>
    {/* Requested by section */}
    <rect x="65" y="161" width="133" height="36" rx="5" fill="#f9fafb"/>
    <circle cx="79" cy="179" r="10" fill="#fbcfe8"/>
    <text x="79" y="183" textAnchor="middle" fontSize="7" fontWeight="700" fill="#9d174d" fontFamily="Arial, sans-serif">SM</text>
    <text x="95" y="173" fontSize="6.5" fontWeight="700" fill="#9ca3af" fontFamily="Arial, sans-serif" letterSpacing="0.5">REQUESTED BY</text>
    <text x="95" y="184" fontSize="9.5" fontWeight="600" fill="#374151" fontFamily="Arial, sans-serif">Sarah Martinez</text>
  </svg>
);

/* ── Getting-paid illustration ────────────────────────────── */
const GettingPaidIllustration = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blob background */}
    <ellipse cx="100" cy="82" rx="88" ry="62" fill="#dbeafe" opacity="0.7"/>
    {/* Bill / card body */}
    <rect x="54" y="54" width="92" height="58" rx="5" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5"/>
    {/* Card header band */}
    <rect x="54" y="54" width="92" height="18" rx="5" fill="#3b82f6"/>
    <rect x="54" y="66" width="92" height="6" fill="#3b82f6"/>
    {/* Card chip circle */}
    <circle cx="76" cy="90" r="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
    {/* Card number lines */}
    <rect x="91" y="86" width="40" height="3.5" rx="1.75" fill="#bfdbfe"/>
    <rect x="91" y="93" width="28" height="3.5" rx="1.75" fill="#bfdbfe"/>
    {/* Left hand */}
    <path d="M6 96 C8 84 22 79 34 80 L54 82 L54 108 L6 108 C4 104 4 98 6 96Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="36" y1="80" x2="36" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    <line x1="42" y1="80" x2="42" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    <line x1="48" y1="81" x2="48" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    {/* Right hand */}
    <path d="M194 96 C192 84 178 79 166 80 L146 82 L146 108 L194 108 C196 104 196 98 194 96Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="164" y1="80" x2="164" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    <line x1="158" y1="80" x2="158" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    <line x1="152" y1="81" x2="152" y2="108" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
    {/* Sparkle top-left */}
    <path d="M34 26 L35.8 32 L42 33.8 L35.8 35.6 L34 41.5 L32.2 35.6 L26 33.8 L32.2 32Z" fill="#60a5fa"/>
    {/* Sparkle top-right */}
    <path d="M158 18 L159.5 23 L165 24.5 L159.5 26 L158 31 L156.5 26 L151 24.5 L156.5 23Z" fill="#60a5fa"/>
    {/* Sparkle right */}
    <path d="M170 58 L171 61 L174 62 L171 63 L170 66 L169 63 L166 62 L169 61Z" fill="#93c5fd"/>
    {/* Sparkle left */}
    <path d="M26 60 L27 63 L30 64 L27 65 L26 68 L25 65 L22 64 L25 63Z" fill="#93c5fd"/>
  </svg>
);

/* ── Payments tab ─────────────────────────────────────────── */
const PaymentsTab = ({ history }) => {
  const STATUS_COLORS = {
    paid:    { bg: '#f0fdf4', color: '#16a34a' },
    overdue: { bg: '#fef2f2', color: '#dc2626' },
    pending: { bg: '#fffbeb', color: '#d97706' },
  };

  if (history.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e4e9f0',
        padding: '56px 24px 64px',
      }}>
        <div style={{
          maxWidth: 560,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <GettingPaidIllustration />
          <h2 style={{
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 700,
            color: NAVY,
            margin: '18px 0 12px',
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            Check back later to view a charge!
          </h2>
          <p style={{
            fontFamily: FONT,
            fontSize: 14,
            color: '#8a9ab0',
            textAlign: 'center',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: 480,
          }}>
            Any charges that your landlord creates will be sent to you{' '}
            <strong style={{ color: NAVY }}>15 days</strong>{' '}
            before they&apos;re due. We&apos;ll also send you an email letting you know once you receive a charge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 20px' }}>
        Charges &amp; Payments
      </h2>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e4e9f0' }}>
              {[
                { label: 'Month',        align: 'left' },
                { label: 'Amount (TZS)', align: 'right' },
                { label: 'Due Date',     align: 'center' },
                { label: 'Paid Date',    align: 'center' },
                { label: 'Status',       align: 'center' },
              ].map(({ label, align }) => (
                <th key={label} style={{
                  padding: '12px 16px', fontWeight: 700, fontSize: 11,
                  color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: '0.07em',
                  textAlign: align, background: '#fafbfc',
                }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((r, idx) => {
              const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
              return (
                <tr key={r._id} style={{ borderBottom: idx < history.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: NAVY }}>{r.month}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 600, color: NAVY }}>
                    {(r.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'center', color: '#8a9ab0' }}>
                    {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'center', color: '#8a9ab0' }}>
                    {r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color,
                      textTransform: 'capitalize',
                    }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── Info row ─────────────────────────────────────────────── */
const InfoRow = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid #f0f2f5' }}>
    <span style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', flexShrink: 0 }}>{label}</span>
    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: valueColor || NAVY, textAlign: 'right', marginLeft: 12 }}>{value}</span>
  </div>
);

/* ── Tenant Dashboard ─────────────────────────────────────── */
const MAINT_CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Appliance',
  'Pest Control', 'Structural', 'Landscaping', 'Other',
];

const MAINT_STATUS = {
  open:        { label: 'Open',        bg: '#fef2f2', color: '#dc2626' },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#d97706' },
  resolved:    { label: 'Resolved',    bg: '#f0fdf4', color: '#16a34a' },
  closed:      { label: 'Closed',      bg: '#f9fafb', color: '#6b7280' },
};

const TenantDashboard = () => {
  const { user } = useAuth();
  const [rentStatus,   setRentStatus]   = useState(null);
  const [history,      setHistory]      = useState([]);
  const [maintenance,  setMaintenance]  = useState([]);
  const [documents,    setDocuments]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('overview');
  const [maintModal,   setMaintModal]   = useState(false);
  const [maintForm,    setMaintForm]    = useState({ category: '', title: '', description: '', preferredTime: 'ANYTIME' });
  const [maintPhotos,  setMaintPhotos]  = useState([]);
  const [submitting,   setSubmitting]   = useState(false);

  const fetchMaintenance = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.tenant.maintenance}`);
      setMaintenance(res.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${backendUrl}${API.tenant.status}`),
      axios.get(`${backendUrl}${API.tenant.history}`),
      axios.get(`${backendUrl}${API.tenant.maintenance}`),
      axios.get(`${backendUrl}${API.tenant.documents}`),
    ]).then(([statusRes, histRes, maintRes, docsRes]) => {
      if (statusRes.status === 'fulfilled') setRentStatus(statusRes.value.data.data);
      if (histRes.status   === 'fulfilled') setHistory(histRes.value.data.data || []);
      if (maintRes.status  === 'fulfilled') setMaintenance(maintRes.value.data.data || []);
      if (docsRes.status   === 'fulfilled') setDocuments(docsRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    if (!maintForm.category) { toast.error('Please select a category'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category', maintForm.category);
      fd.append('title', maintForm.title);
      fd.append('description', maintForm.description);
      fd.append('preferredTime', maintForm.preferredTime);
      maintPhotos.forEach(f => fd.append('photos', f));
      await axios.post(`${backendUrl}${API.tenant.maintenance}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Maintenance request submitted');
      setMaintModal(false);
      setMaintForm({ category: '', title: '', description: '', preferredTime: 'ANYTIME' });
      setMaintPhotos([]);
      fetchMaintenance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const firstName      = user?.name?.split(' ')[0] || 'there';
  const unpaidCharges  = Math.max(0, -(rentStatus?.balance || 0));
  const houseDisplay   = (rentStatus?.house?.address || rentStatus?.house?.name || 'My Rental').toUpperCase();
  const daysUntilDue   = rentStatus?.daysUntilDue ?? null;

  const leaseEnd = rentStatus?.leaseEnd ? new Date(rentStatus.leaseEnd) : null;
  const leaseType = leaseEnd
    ? `Until ${leaseEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Month-to-Month';

  const TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'payments',     label: 'Payments' },
    { id: 'maintenance',  label: 'Maintenance' },
    { id: 'documents',    label: 'Documents' },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{
            width: 32, height: 32, border: `4px solid ${NAVY}`,
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ flex: 1, background: '#f5f6f8', fontFamily: FONT, color: NAVY, minHeight: '100vh' }}>

        {/* ── Page header ──────────────────────────────────────── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e4e9f0' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto', padding: '20px 28px 0', boxSizing: 'border-box' }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>
              Dashboard
            </p>
            <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 3px', lineHeight: 1.2, letterSpacing: '0.01em' }}>
              {houseDisplay}
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 11, color: '#8a9ab0', margin: 0, letterSpacing: '0.04em' }}>
              LEASE TERM:{' '}
              <span style={{ fontWeight: 600, color: '#5a7a90' }}>{leaseType}</span>
            </p>

            {/* Tab bar */}
            <div style={{ display: 'flex', marginTop: 16, overflowX: 'auto' }}>
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: tab === id ? 700 : 500,
                    color: tab === id ? NAVY : '#8a9ab0',
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === id ? `3px solid ${NAVY}` : '3px solid transparent',
                    padding: '8px 20px 12px',
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    outline: 'none',
                    marginRight: 2,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────── */}
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 28px', boxSizing: 'border-box' }}>

          {/* ── OVERVIEW ────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'start' }}>

              {/* Left column */}
              <div>
                {/* Greeting */}
                <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 28px' }}>
                  Hello, {firstName}! 👋
                </h2>

                {/* PAYMENTS */}
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>
                    Payments
                  </p>
                  <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '32px 24px', textAlign: 'center' }}>
                    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
                      UNPAID CHARGES
                    </p>
                    <h2 style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: NAVY, margin: 0 }}>
                      TZS {unpaidCharges.toLocaleString()}
                    </h2>
                    {unpaidCharges === 0 && (
                      <p style={{ fontFamily: FONT, fontSize: 12, color: '#16a34a', margin: '8px 0 0', fontWeight: 600 }}>
                        ✓ No outstanding charges
                      </p>
                    )}
                  </div>
                </div>

                {/* MAINTENANCE */}
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>
                    Maintenance
                  </p>
                  <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0' }}>
                    <button
                      onClick={() => setMaintModal(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 18,
                        width: '100%', padding: '20px 24px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f5f6f8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                      <h5 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>
                        Request Maintenance
                      </h5>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column — Rent summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Rent Status */}
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '20px' }}>
                  <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 16px' }}>
                    Rent Summary
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <InfoRow
                      label="Monthly Rent"
                      value={`TZS ${(rentStatus?.rentAmount || 0).toLocaleString()}`}
                    />
                    <InfoRow
                      label="Account Balance"
                      value={`TZS ${(rentStatus?.balance || 0).toLocaleString()}`}
                      valueColor={(rentStatus?.balance || 0) < 0 ? '#dc2626' : '#16a34a'}
                    />
                    <InfoRow
                      label="Due Date"
                      value={rentStatus?.rentDueDate ? `Day ${rentStatus.rentDueDate} of each month` : '—'}
                    />
                    {daysUntilDue !== null && (
                      <InfoRow
                        label="Payment Status"
                        value={
                          daysUntilDue === 0 ? 'Due today'
                          : daysUntilDue > 0  ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                          : `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`
                        }
                        valueColor={daysUntilDue <= 0 ? '#dc2626' : daysUntilDue <= 3 ? '#d97706' : '#16a34a'}
                      />
                    )}
                    {leaseEnd && (
                      <InfoRow
                        label="Lease Ends"
                        value={leaseEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      />
                    )}
                  </div>
                </div>

                {/* Property */}
                {rentStatus?.house && (
                  <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '20px' }}>
                    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#8a9ab0', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>
                      Property
                    </p>
                    {rentStatus.house.name && (
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>
                        {rentStatus.house.name}
                      </p>
                    )}
                    <p style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', margin: 0, lineHeight: 1.6 }}>
                      {[rentStatus.house.address, rentStatus.house.city].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PAYMENTS TAB ─────────────────────────────────────── */}
          {tab === 'payments' && <PaymentsTab history={history} />}

          {/* ── MAINTENANCE TAB ──────────────────────────────────── */}
          {tab === 'maintenance' && (
            maintenance.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '48px 24px 60px' }}>
                <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <MaintenanceIllustration />
                  <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, margin: '12px 0 12px', textAlign: 'center', lineHeight: 1.3 }}>
                    Have a Maintenance Request?
                  </h2>
                  <p style={{ fontFamily: FONT, fontSize: 14, color: '#8a9ab0', textAlign: 'center', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 420 }}>
                    Let your landlord know about the issue so they can get it fixed.
                  </p>
                  <button
                    onClick={() => setMaintModal(true)}
                    style={{
                      background: NAVY, color: '#fff', border: 'none', borderRadius: 60,
                      padding: '14px 40px', fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#033a6d'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = NAVY; }}
                  >
                    Request Maintenance
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY, margin: 0 }}>
                    Maintenance Requests
                  </h2>
                  <button
                    onClick={() => setMaintModal(true)}
                    style={{
                      background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
                      padding: '8px 18px', fontFamily: FONT, fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#033a6d'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = NAVY; }}
                  >
                    + New Request
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {maintenance.map(r => {
                    const s = MAINT_STATUS[r.status] || MAINT_STATUS.open;
                    const date = new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    return (
                      <div key={r._id} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY }}>
                              {r.title}
                            </span>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                              fontSize: 10, fontWeight: 700, background: s.bg, color: s.color,
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                              {s.label}
                            </span>
                          </div>
                          <span style={{ fontFamily: FONT, fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, background: '#f0f4f8', color: '#5a7a90', borderRadius: 4, padding: '2px 8px' }}>
                            {r.category}
                          </span>
                          {r.house?.name && (
                            <span style={{ fontFamily: FONT, fontSize: 11, color: '#9ca3af' }}>
                              {r.house.name}{r.house.address ? ` · ${r.house.address}` : ''}
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p style={{ fontFamily: FONT, fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                            {r.description.length > 200 ? r.description.slice(0, 200) + '…' : r.description}
                          </p>
                        )}
                        {r.photos?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                            {r.photos.map((photo, pi) => (
                              <a key={pi} href={`${backendUrl}${photo}`} target="_blank" rel="noreferrer">
                                <img src={`${backendUrl}${photo}`} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e4e9f0' }} />
                              </a>
                            ))}
                          </div>
                        )}
                        {r.submittedBy === 'tenant' && (
                          <p style={{ fontFamily: FONT, fontSize: 11, color: '#9ca3af', margin: '8px 0 0' }}>
                            Submitted by you
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── DOCUMENTS TAB ────────────────────────────────────── */}
          {tab === 'documents' && (
            documents.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', padding: '48px 32px', textAlign: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <h3 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>No Documents Yet</h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#8a9ab0', margin: 0 }}>Your landlord has not shared any documents with you yet.</p>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 20px' }}>Documents</h2>
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e4e9f0', overflow: 'hidden' }}>
                  {documents.map((doc, idx) => (
                    <div key={doc._id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                      borderBottom: idx < documents.length - 1 ? '1px solid #f0f2f5' : 'none',
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NAVY, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.originalName || doc.fileName}
                        </p>
                        <p style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', margin: '2px 0 0' }}>
                          {doc.type === 'lease' ? 'Lease Document' : 'Property Document'}
                          {doc.description ? ` · ${doc.description}` : ''}
                          {' · '}{new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <a
                        href={`${backendUrl}${doc.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: NAVY, textDecoration: 'none', padding: '6px 14px', border: `1.5px solid ${NAVY}`, borderRadius: 6, flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

        </div>
      </div>

      {/* ── Request Maintenance Modal ─────────────────────────── */}
      {maintModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,34,56,0.5)', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setMaintModal(false); setMaintPhotos([]); } }}
        >
          <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32, fontFamily: FONT, color: NAVY, position: 'relative' }}>
            <button
              onClick={() => { setMaintModal(false); setMaintPhotos([]); }}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#acb9c8', padding: 4 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6b7280'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#acb9c8'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 24px' }}>
              Submit a Maintenance Request
            </h2>
            <form onSubmit={handleMaintSubmit}>
              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                  Category *
                </label>
                <select
                  required value={maintForm.category}
                  onChange={e => setMaintForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 6, fontFamily: FONT, fontSize: 14, color: NAVY, background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>Select category</option>
                  {MAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                  Issue Title *
                </label>
                <input
                  required value={maintForm.title} maxLength={50}
                  onChange={e => setMaintForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Leaky faucet in kitchen"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 6, fontFamily: FONT, fontSize: 14, color: NAVY, boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                />
              </div>
              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                  Description *
                </label>
                <textarea
                  required value={maintForm.description} rows={4}
                  onChange={e => setMaintForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 6, fontFamily: FONT, fontSize: 14, color: NAVY, resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                />
              </div>
              {/* Photos (optional) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                  Photos <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(optional, up to 10)</span>
                </label>
                <input
                  type="file" accept="image/*" multiple
                  onChange={e => setMaintPhotos(Array.from(e.target.files))}
                  style={{ width: '100%', fontSize: 13, fontFamily: FONT, color: NAVY }}
                />
                {maintPhotos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {maintPhotos.map((f, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(f)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e4e9f0' }} />
                        <button
                          type="button"
                          onClick={() => setMaintPhotos(prev => prev.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 18, height: 18, color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Preferred time */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  Entry Preference
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ val: 'ANYTIME', label: 'Anytime' }, { val: 'COORDINATE', label: 'Coordinate with me' }].map(({ val, label }) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: NAVY }}>
                      <input type="radio" name="preferredTime" value={val} checked={maintForm.preferredTime === val} onChange={() => setMaintForm(f => ({ ...f, preferredTime: val }))} style={{ accentColor: NAVY }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit" disabled={submitting}
                style={{ width: '100%', padding: '13px 24px', background: submitting ? '#6b7280' : NAVY, color: '#fff', border: 'none', borderRadius: 60, fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#033a6d'; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TenantDashboard;
