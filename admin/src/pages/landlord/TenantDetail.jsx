import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const FONT = 'Lato, Avenir, "Segoe UI", sans-serif';

const initials = (name) =>
  name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const AVATAR_COLORS = [
  ['#EFF6FF', '#1D4ED8'], ['#F0FDF4', '#166534'],
  ['#FEF9C3', '#A16207'], ['#FDF2F8', '#9D174D'],
  ['#F0F9FF', '#0369A1'], ['#FFF7ED', '#C2410C'],
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ─── Edit Tenant Modal ─────────────────────────────────────── */
const EditModal = ({ tenant, houses, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: tenant.name || '',
    email: tenant.email || '',
    phone: tenant.phone || '',
    houseId: tenant.house?._id || '',
  });
  const [saving, setSaving] = useState(false);
  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${backendUrl}${API.tenants}/${tenant._id}`, form);
      toast.success('Tenant updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: NAVY, outline: 'none', fontFamily: FONT, background: '#fff' };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, fontFamily: FONT };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', lineHeight: 0, padding: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: NAVY, fontFamily: FONT }}>Edit Tenant</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Full Name</label>
            <input required value={form.name} onChange={e => field('name', e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input type="email" value={form.email} onChange={e => field('email', e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Phone</label>
            <input type="tel" value={form.phone} onChange={e => field('phone', e.target.value)} style={inp} placeholder="+255712345678"/>
          </div>
          <div>
            <label style={lbl}>Property</label>
            <select value={form.houseId} onChange={e => field('houseId', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
              <option value="">No property assigned</option>
              {houses.map(h => <option key={h._id} value={h._id}>{h.name}{h.city ? ` — ${h.city}` : ''}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 22px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 28px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant]   = useState(null);
  const [lease, setLease]     = useState(null);
  const [houses, setHouses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm]   = useState({ open: false });
  const closeConfirm = () => setConfirm({ open: false });
  const actionsRef = useRef(null);

  const load = async () => {
    try {
      const [tr, hr] = await Promise.all([
        axios.get(`${backendUrl}${API.tenants}/${id}`),
        axios.get(`${backendUrl}${API.houses}`),
      ]);
      const t = tr.data.data;
      setTenant(t);
      setHouses(hr.data.data || []);
      if (t.house?._id) {
        try {
          const lr = await axios.get(`${backendUrl}/api/landlord/houses/${t.house._id}/lease`);
          setLease(lr.data.data || null);
        } catch { setLease(null); }
      }
    } catch {
      toast.error('Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e) => { if (actionsRef.current && !actionsRef.current.contains(e.target)) setShowActions(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleDelete = () => {
    setShowActions(false);
    setConfirm({
      open: true,
      title: 'Remove Tenant',
      message: `Remove ${tenant?.name}?\nThis will permanently delete their account and cannot be undone.`,
      confirmLabel: 'Remove Tenant',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, loading: true }));
        try {
          await axios.delete(`${backendUrl}${API.tenants}/${id}`);
          toast.success('Tenant removed');
          navigate('/tenants');
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Delete failed');
          setConfirm({ open: false });
        }
      },
    });
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      await axios.post(`${backendUrl}${API.tenants}/${id}/invite`);
      toast.success('Invitation sent');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid #1d4ed8`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
        </div>
      </Layout>
    );
  }

  if (!tenant) {
    return (
      <Layout>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: FONT }}>
          Tenant not found.
        </div>
      </Layout>
    );
  }

  const [bg, fg] = avatarColor(tenant.name);
  const ini = initials(tenant.name);
  const portalActive = tenant.portalActivated;
  const house = tenant.house
    ? (houses.find(h => h._id === tenant.house._id) || tenant.house)
    : null;

  const cardStyle = { background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' };
  const divider = { border: 'none', borderTop: '1px solid #f3f4f6', margin: '12px 0' };

  return (
    <Layout>
      <div style={{ flex: 1, background: '#f4f6f9', minHeight: '100vh', fontFamily: FONT, color: NAVY }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
            <Link to="/tenants" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 500 }}>Tenants</Link>
            <span>/</span>
            <span style={{ color: '#374151', fontWeight: 500 }}>{tenant.name}</span>
          </nav>

          {/* Top row: avatar + name + buttons */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            {/* Left: avatar + name + email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0, letterSpacing: '0.02em' }}>
                {ini}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>{tenant.name}</h1>
                {tenant.email && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>{tenant.email}</p>}
              </div>
            </div>

            {/* Right: Actions + Edit tenant */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Actions dropdown */}
              <div ref={actionsRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowActions(v => !v)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#f3f4f6', color: NAVY, border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
                >
                  Actions
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={NAVY}><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                </button>
                {showActions && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 180, padding: '4px 0' }}>
                    <button
                      onClick={handleDelete}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', fontSize: 14, color: '#dc2626', cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      Remove tenant
                    </button>
                  </div>
                )}
              </div>
              {/* Edit tenant */}
              <button
                onClick={() => setShowEdit(true)}
                style={{ padding: '9px 22px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
              >
                Edit tenant
              </button>
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Current lease card */}
              <div style={cardStyle}>
                <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: NAVY }}>Current lease</p>

                {house ? (
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Left: property photo card with overlay */}
                    <div
                      onClick={() => navigate(`/houses/${house._id}`)}
                      style={{ position: 'relative', width: 260, minWidth: 200, height: 200, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, background: '#dbeafe' }}
                    >
                      {house.photo ? (
                        <img
                          src={house.photo.startsWith('http') ? house.photo : `${backendUrl}${house.photo}`}
                          alt={house.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#dbeafe,#eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="#93c5fd"><path d="M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"/></svg>
                        </div>
                      )}
                      {/* White overlay card */}
                      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"/></svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{house.name?.toUpperCase()}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', lineHeight: 1.3 }}>{[house.city, house.region].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Period / Payment / Deposit */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: NAVY }}>Period</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                          {lease ? `${fmt(lease.startDate)} - ${fmt(lease.endDate)}` : '—'}
                        </p>
                      </div>
                      <hr style={divider}/>
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: NAVY }}>Payment</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                          {lease ? `TZS ${Number(lease.rentAmount).toLocaleString()} paid monthly` : '—'}
                        </p>
                      </div>
                      <hr style={divider}/>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: NAVY }}>Deposit</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                          {lease?.deposit ? `TZS ${Number(lease.deposit).toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>No active lease.</p>
                )}
              </div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Notes card */}
              <div style={cardStyle}>
                <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: NAVY }}>Notes</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#d1d5db"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5m0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5M7 19h14v-2H7zm0-6h14v-2H7zm0-8v2h14V5z"/></svg>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>You have no notes</span>
                </div>
              </div>

              {/* Tenant portal status card */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Tenant portal status</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                      padding: '3px 10px', borderRadius: 20, border: '1px solid',
                      color: portalActive ? '#166534' : '#92400e',
                      borderColor: portalActive ? '#86efac' : '#fcd34d',
                      background: portalActive ? '#f0fdf4' : '#fffbeb',
                      whiteSpace: 'nowrap',
                    }}>
                      {portalActive ? 'ACTIVE' : 'NO ACCESS'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    {portalActive
                      ? 'Tenant has access to the portal.'
                      : <>
                          Tenant does not have access.{' '}
                          <button
                            onClick={handleInvite}
                            disabled={inviting}
                            style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, fontSize: 14, cursor: inviting ? 'not-allowed' : 'pointer', padding: 0, textDecoration: 'underline', fontFamily: FONT }}
                          >
                            {inviting ? 'Sending…' : 'Send Invite'}
                          </button>.
                        </>
                    }
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal
          tenant={tenant}
          houses={houses}
          onClose={() => setShowEdit(false)}
          onSaved={load}
        />
      )}

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        loading={confirm.loading}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </Layout>
  );
};

export default TenantDetail;
