import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

/* ─── design tokens ───────────────────────────────────────────── */
const NAVY = '#042238';
const BLUE = '#033A6D';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

/* ─── helpers ─────────────────────────────────────────────────── */
const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  houseId: '', invitePortal: true,
};

const initials = name =>
  name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

const AVATAR_COLORS = [
  ['#EFF6FF', '#1D4ED8'], ['#F0FDF4', '#166534'],
  ['#FEF9C3', '#A16207'], ['#FDF2F8', '#9D174D'],
  ['#F0F9FF', '#0369A1'], ['#FFF7ED', '#C2410C'],
];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const Tenants = () => {
  const [tenants, setTenants]   = useState([]);
  const [houses, setHouses]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('active'); // active | past
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [selected, setSelected] = useState(new Set());

  const fetchAll = async () => {
    try {
      const [tr, hr] = await Promise.all([
        axios.get(`${backendUrl}${API.tenants}`),
        axios.get(`${backendUrl}${API.houses}`),
      ]);
      setTenants(tr.data.data || []);
      setHouses(hr.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      toast.error('Provide at least one contact: email or phone');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        houseId: form.houseId,
        rentAmount: 0,
        rentDueDate: 1,
        sendInvitation: form.invitePortal,
      };
      await axios.post(`${backendUrl}${API.tenants}`, payload);
      toast.success('Tenant added successfully');
      setModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This will delete their account.`)) return;
    try {
      await axios.delete(`${backendUrl}${API.tenants}/${id}`);
      toast.success('Tenant removed');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* ── filter lists ── */
  const active   = tenants.filter(t => t.isActive !== false);
  const past     = tenants.filter(t => t.isActive === false);
  const shown    = filter === 'active' ? active : filter === 'past' ? past : [];

  /* ── segment tab config ── */
  const TABS = [
    { key: 'active',   label: 'Active',   count: active.length },
    { key: 'past',     label: 'Past',     count: past.length   },
    { key: 'archived', label: 'Archived', count: 0             },
  ];

  return (
    <Layout>
      <div style={{
        flex: 1, overflowY: 'auto',
        background: '#f4f6f9',
        padding: '0',
        fontFamily: FONT,
        color: NAVY,
      }}>

        {/* ── Page tab bar ── */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e4e9f0',
          padding: '0 32px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            borderBottom: `3px solid ${NAVY}`,
            padding: '15px 0 12px',
            marginBottom: '-1px',
          }}>
            <span style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700,
              color: NAVY, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Tenants ({tenants.length})
            </span>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ padding: '26px 32px 48px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* ── Unified card: toolbar + table + pagination ── */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e0e4ea',
            overflow: 'hidden',
          }}>

            {/* ── Card toolbar ── */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #e4e9f0',
              flexWrap: 'wrap', gap: 12,
            }}>
              {/* Title */}
              <h2 style={{
                margin: 0, fontFamily: FONT,
                fontSize: 15, fontWeight: 700,
                color: NAVY, letterSpacing: '-0.01em',
              }}>
                {filter === 'active' ? 'Active Tenants' : filter === 'past' ? 'Past Tenants' : 'Archived Tenants'}
              </h2>

              {/* Filter tabs + Add New */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Tabs */}
                <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
                  {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontFamily: FONT, fontSize: 12, fontWeight: 600,
                        letterSpacing: '0.03em',
                        background: filter === tab.key ? '#fff' : 'transparent',
                        color: filter === tab.key ? NAVY : '#6b7280',
                        boxShadow: filter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, fontWeight: 700,
                          background: filter === tab.key ? '#e8eef6' : 'transparent',
                          color: filter === tab.key ? NAVY : '#9ca3af',
                          padding: '1px 6px', borderRadius: 10,
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Add New */}
                <button
                  onClick={() => setModal(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: NAVY, color: '#fff',
                    border: 'none', borderRadius: 8,
                    padding: '7px 16px',
                    fontFamily: FONT, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(4,34,56,0.2)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#022a52'}
                  onMouseLeave={e => e.currentTarget.style.background = NAVY}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `3px solid ${BLUE}`, borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}/>
              </div>
            )}

            {/* Empty state */}
            {!loading && shown.length === 0 && (
              <div style={{
                padding: '64px 24px 72px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
              }}>
                {/* Icon */}
                <div style={{ marginBottom: 22 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <path d="M57.682 46.67a11.02 11.02 0 0 1 11.017 11.02c0 6.083-4.931 11.013-11.017 11.013s-11.017-4.93-11.017-11.013a11.02 11.02 0 0 1 11.017-11.02zM16.667 3.333v5l.027.3c.141.777.822 1.367 1.64 1.367H60v3.333H11.667c-.92 0-1.667.746-1.667 1.667v38.333c0 1.84-1.494 3.333-3.333 3.333l-.389-.022a3.33 3.33 0 0 1-2.944-3.311v-50h13.333z" fill="#7fe3ff"/>
                    <path d="M57.682 43.337c7.927 0 14.35 6.426 14.35 14.353 0 3.36-1.155 6.451-3.09 8.896l10.57 10.569c.651.651.651 1.706 0 2.357s-1.706.651-2.357 0L66.586 68.943a14.29 14.29 0 0 1-8.903 3.094 14.35 14.35 0 0 1-14.35-14.347c0-7.928 6.423-14.353 14.35-14.353zm0 3.333a11.02 11.02 0 0 0-11.017 11.02c0 6.083 4.931 11.013 11.017 11.013s11.017-4.93 11.017-11.013a11.02 11.02 0 0 0-11.017-11.02zM18.333 0C19.254 0 20 .746 20 1.667v5h41.667c.818 0 1.499.59 1.64 1.367l.027.3v5h5c.818 0 1.499.59 1.64 1.367L70 15v16.667c0 .92-.746 1.667-1.667 1.667s-1.667-.746-1.667-1.667v-15H13.333v36.667c0 1.214-.325 2.353-.893 3.334h19.226c.92 0 1.667.746 1.667 1.667S32.587 60 31.667 60H6.714h-.047C2.981 60 0 57.016 0 53.333V1.667C0 .746.746 0 1.667 0h16.667zm-1.667 3.333H3.333v50a3.33 3.33 0 0 0 2.944 3.311l.389.022c1.84 0 3.333-1.494 3.333-3.333V15c0-.92.746-1.667 1.667-1.667H60V10H18.333c-.818 0-1.499-.59-1.64-1.367l-.027-.3v-5z" fill={NAVY}/>
                  </svg>
                </div>

                <h3 style={{
                  margin: '0 0 10px', fontFamily: FONT,
                  fontSize: 17, fontWeight: 700, color: NAVY,
                  letterSpacing: '-0.01em',
                }}>
                  {filter === 'active'
                    ? "You don't have any active tenants"
                    : filter === 'past'
                      ? "No past tenants"
                      : "No archived tenants"}
                </h3>
                <p style={{
                  margin: '0 0 28px', fontFamily: FONT,
                  fontSize: 13, color: '#69809a', lineHeight: 1.65,
                  maxWidth: 380,
                }}>
                  {filter === 'active'
                    ? "If you're not seeing a specific tenant here, try looking under past tenants, or you can always add a new tenant."
                    : filter === 'past'
                      ? "Suspended tenant accounts will appear here."
                      : "Archived tenants will appear here."}
                </p>

                {filter === 'active' && (
                  <>
                    <button
                      onClick={() => setModal(true)}
                      style={{
                        background: NAVY, color: '#fff',
                        border: 'none', borderRadius: 100,
                        padding: '12px 36px',
                        fontFamily: FONT, fontSize: 12,
                        fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(4,34,56,0.22)',
                        marginBottom: 16,
                      }}
                    >
                      Add New Tenant
                    </button>
                    <button
                      onClick={() => setFilter('past')}
                      style={{
                        background: 'none', border: 'none',
                        fontFamily: FONT, fontSize: 12,
                        fontWeight: 600, color: '#5b8db8',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        cursor: 'pointer', padding: 0,
                        textDecoration: 'none',
                        opacity: 0.85,
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                    >
                      Check Past Tenants
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Tenants table — DataGrid style */}
            {!loading && shown.length > 0 && (() => {
              const statusChip = (t) => {
                if (t.isActive === false) {
                  return { label: 'FORMER', color: '#374151', border: '#d1d5db', bg: '#f9fafb' };
                }
                if (t.portalActivated) {
                  return { label: 'CURRENT', color: '#166534', border: '#86efac', bg: '#f0fdf4' };
                }
                if (t.house) {
                  return { label: 'CURRENT', color: '#166534', border: '#86efac', bg: '#f0fdf4' };
                }
                return { label: 'NO LEASE', color: '#92400e', border: '#fcd34d', bg: '#fffbeb' };
              };

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f5f6f8', borderBottom: '1px solid #e4e9f0' }}>
                        <th style={{ ...DGH, width: 70 }}></th>
                        <th style={DGH}>NAME</th>
                        <th style={DGH}>EMAIL</th>
                        <th style={DGH}>MOBILE</th>
                        <th style={DGH}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((t, idx) => {
                        const [bg, fg] = avatarColor(t.name);
                        const chip = statusChip(t);
                        return (
                          <tr
                            key={t._id}
                            style={{ borderBottom: '1px solid #f0f3f8', background: 'transparent', transition: 'background 0.1s', cursor: 'pointer', minHeight: 70 }}
                            onClick={() => window.location.href = `/tenants/${t._id}`}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Avatar */}
                            <td style={{ padding: '16px 12px', width: 70, textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
                                {initials(t.name)}
                              </div>
                            </td>
                            {/* Name */}
                            <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: 14, fontWeight: 500, color: NAVY }}>
                              {t.name}
                            </td>
                            {/* Email */}
                            <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: 14, color: '#374151' }}>
                              {t.email || ''}
                            </td>
                            {/* Mobile */}
                            <td style={{ padding: '16px 12px', verticalAlign: 'middle', fontSize: 14, color: '#374151' }}>
                              {t.phone || ''}
                            </td>
                            {/* Status chip */}
                            <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', padding: '3px 10px', borderRadius: 20, border: `1px solid ${chip.border}`, color: chip.color, background: chip.bg, whiteSpace: 'nowrap' }}>
                                {chip.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Pagination footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, padding: '12px 16px', borderTop: '1px solid #f0f3f8', fontFamily: FONT, fontSize: 13, color: '#6b7280' }}>
                    <span>Rows per page:</span>
                    <span style={{ fontWeight: 600, color: NAVY, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      100
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                    </span>
                    <span>1–{shown.length} of {shown.length}</span>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button disabled style={{ background: 'none', border: 'none', cursor: 'not-allowed', color: '#d1d5db', padding: '2px 4px', lineHeight: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
                      </button>
                      <button disabled style={{ background: 'none', border: 'none', cursor: 'not-allowed', color: '#d1d5db', padding: '2px 4px', lineHeight: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          </div>{/* /maxWidth wrapper */}
        </div>
      </div>

      {/* ── Add Tenant Modal ── */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4,34,56,0.5)', padding: '0 16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setModal(false); setForm(emptyForm); } }}
        >
          <div style={{
            background: '#fff',
            border: '2px solid #e6e9f0',
            borderRadius: 4,
            width: '100%', maxWidth: 464,
            maxHeight: '92vh', overflowY: 'auto',
            padding: 32,
            fontFamily: FONT, fontSize: 16, color: NAVY,
            lineHeight: 1.42857,
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Close button */}
            <button
              onClick={() => { setModal(false); setForm(emptyForm); }}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#acb9c8', padding: 4, lineHeight: 0,
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
              onMouseLeave={e => e.currentTarget.style.color = '#acb9c8'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Title */}
            <h2 style={{
              margin: '0 0 20px', fontFamily: FONT,
              fontSize: 20, fontWeight: 700, color: NAVY,
              lineHeight: 1.3,
            }}>
              Add a new tenant
            </h2>

            <form onSubmit={handleAdd}>

              {/* First Name + Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={mLabel}>First Name</label>
                  <input
                    required value={form.firstName}
                    onChange={e => field('firstName', e.target.value)}
                    style={mInput}
                    onFocus={e => e.target.style.borderColor = '#4a90c4'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={mLabel}>Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={e => field('lastName', e.target.value)}
                    style={mInput}
                    onFocus={e => e.target.style.borderColor = '#4a90c4'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* Lease (House) */}
              <div style={{ marginBottom: 16 }}>
                <label style={mLabel}>Lease</label>
                <div style={{ position: 'relative' }}>
                  <select
                    required value={form.houseId}
                    onChange={e => field('houseId', e.target.value)}
                    style={{
                      ...mInput, appearance: 'none', WebkitAppearance: 'none',
                      paddingRight: 36, cursor: 'pointer', background: '#fff',
                      color: form.houseId ? NAVY : '#9ca3af',
                    }}
                  >
                    <option value="" disabled>Select a lease</option>
                    {houses.map(h => (
                      <option key={h._id} value={h._id}>{h.name}{h.city ? ` — ${h.city}` : ''}</option>
                    ))}
                  </select>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill={NAVY}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd"/>
                  </svg>
                </div>
              </div>

              {/* Contact info heading */}
              <p style={{
                margin: '8px 0 16px', fontFamily: FONT, fontSize: 14,
                fontWeight: 700, color: NAVY, lineHeight: 1.42857,
              }}>
                Provide at least one form of contact information:
              </p>

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={mLabel}>Email</label>
                <input
                  type="email" value={form.email}
                  onChange={e => field('email', e.target.value)}
                  style={mInput}
                  onFocus={e => e.target.style.borderColor = '#4a90c4'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 20 }}>
                <label style={mLabel}>Phone</label>
                <input
                  type="tel" value={form.phone}
                  onChange={e => field('phone', e.target.value)}
                  style={mInput}
                  onFocus={e => e.target.style.borderColor = '#4a90c4'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Portal invite checkbox */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <input
                      type="checkbox"
                      checked={form.invitePortal}
                      onChange={e => field('invitePortal', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: NAVY, cursor: 'pointer' }}
                    />
                  </div>
                  <span>
                    <span style={{
                      fontFamily: FONT, fontSize: 14, fontWeight: 700,
                      color: NAVY, display: 'block', lineHeight: 1.42857,
                    }}>
                      Send invitation to tenant portal
                    </span>
                    <span style={{
                      fontFamily: FONT, fontSize: 13, color: '#069ED9',
                      display: 'block', marginTop: 1, lineHeight: 1.42857,
                    }}>
                      You can always invite them later.
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '13px 48px',
                    background: saving ? '#8a9ab0' : NAVY,
                    color: '#fff', border: 'none', borderRadius: 100,
                    fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 2px 8px rgba(4,34,56,0.22)',
                    minWidth: 200,
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#022a52'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = NAVY; }}
                >
                  {saving ? 'Adding…' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

/* ─── DataGrid column header style ───────────────────────────── */
const DGH = {
  padding: '10px 12px',
  fontFamily: '"Inter", sans-serif',
  fontSize: 11, fontWeight: 500,
  color: '#0f2e5a', textTransform: 'uppercase',
  letterSpacing: '0.07em', textAlign: 'left',
  whiteSpace: 'nowrap', background: '#f5f6f8',
  borderRight: '1px solid #e4e9f0',
};

/* ─── modal input styles (TurboTenant pixel-perfect) ─────────── */
const mLabel = {
  display: 'block',
  fontFamily: '"Inter", sans-serif',
  fontSize: 13, fontWeight: 600,
  color: '#042238', marginBottom: 5,
  lineHeight: 1.42857,
};

const mInput = {
  width: '100%', boxSizing: 'border-box',
  padding: '8px 12px',
  fontFamily: '"Inter", sans-serif',
  fontSize: 14, color: '#042238',
  lineHeight: 1.42857,
  border: '1px solid #d1d5db', borderRadius: 4,
  outline: 'none', background: '#fff',
  transition: 'border-color 0.15s',
};

export default Tenants;
