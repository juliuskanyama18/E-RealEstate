import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const NAVY  = '#0F2E5A';
const FONT  = 'Lato, "Open Sans", ui-sans-serif, system-ui, sans-serif';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/* ── Maintenance categories ──────────────────────────────────── */
const MAINT_CATS = ['Plumbing','Electrical','HVAC','Appliance','Pest Control','Structural','Landscaping','Other'];

/* ─────────────────────────────────────────────────────────────── */
const TenantDashboard = () => {
  const [rentStatus,   setRentStatus]   = useState(null);
  const [paymentsDue,  setPaymentsDue]  = useState([]);
  const [maintenance,  setMaintenance]  = useState([]);
  const [landlord,     setLandlord]     = useState(null);
  const [reminders,    setReminders]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState({ category: '', title: '', description: '', preferredTime: 'ANYTIME' });
  const [photos,       setPhotos]       = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [leaseMenuOpen, setLeaseMenuOpen] = useState(false);
  const navigate = useNavigate();
  const leaseMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (leaseMenuRef.current && !leaseMenuRef.current.contains(e.target)) {
        setLeaseMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.tenant.maintenance}`);
      setMaintenance(res.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${backendUrl}${API.tenant.status}`),
      axios.get(`${backendUrl}${API.tenant.schedule}`),
      axios.get(`${backendUrl}${API.tenant.maintenance}`),
      axios.get(`${backendUrl}${API.tenant.landlord}`),
      axios.get(`${backendUrl}${API.tenant.reminders}`),
    ]).then(([sRes, scRes, mRes, lRes, rRes]) => {
      if (sRes.status  === 'fulfilled') setRentStatus(sRes.value.data.data);
      if (scRes.status === 'fulfilled') setPaymentsDue(scRes.value.data.data || []);
      if (mRes.status  === 'fulfilled') setMaintenance(mRes.value.data.data || []);
      if (lRes.status  === 'fulfilled') setLandlord(lRes.value.data.data);
      if (rRes.status  === 'fulfilled') setReminders(rRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category',      form.category);
      fd.append('title',         form.title);
      fd.append('description',   form.description);
      fd.append('preferredTime', form.preferredTime);
      photos.forEach(f => fd.append('photos', f));
      await axios.post(`${backendUrl}${API.tenant.maintenance}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Maintenance request submitted');
      setModal(false);
      setForm({ category: '', title: '', description: '', preferredTime: 'ANYTIME' });
      setPhotos([]);
      fetchMaintenance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  /* ── Derived ── */
  const houseName   = rentStatus?.house?.name || '';
  const leaseStart  = rentStatus?.leaseStart ? new Date(rentStatus.leaseStart) : null;
  const leaseEnd    = rentStatus?.leaseEnd   ? new Date(rentStatus.leaseEnd)   : null;
  const leasePeriod = leaseStart && leaseEnd ? `${fmt(leaseStart)} - ${fmt(leaseEnd)}` : '';

  /* ── Modal styles ── */
  const lbl = { fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6, fontFamily: FONT };
  const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 6, fontFamily: FONT, fontSize: 14, color: NAVY, background: '#fff', boxSizing: 'border-box', outline: 'none' };

  if (loading) {
    return (
      <Layout>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: 32, height: 32, border: `4px solid ${NAVY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ flex: 1, background: '#f5f6f8', fontFamily: FONT, color: NAVY, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '28px 40px 48px' }}>

          {/* ── Property / lease header ───────────────────────── */}
          {houseName && (
            <div ref={leaseMenuRef} style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
              <button
                onClick={() => setLeaseMenuOpen(v => !v)}
                title="Select Lease"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: NAVY, fontFamily: FONT, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {houseName}
                  </p>
                  {leasePeriod && (
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03333em', color: 'rgba(0,0,0,0.6)', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                      Lease Period: {leasePeriod}
                    </span>
                  )}
                </div>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill={NAVY}
                  style={{ flexShrink: 0, transition: 'transform 0.2s', transform: leaseMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                </svg>
              </button>

              {/* Dropdown */}
              {leaseMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
                  zIndex: 200, minWidth: 280, padding: '6px 0',
                }}>
                  {/* Single lease item (radio selected) */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer' }}
                    onClick={() => setLeaseMenuOpen(false)}
                  >
                    {/* Radio icon — checked */}
                    <span style={{ flexShrink: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1976d2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <circle cx="12" cy="12" r="5" fill="#1976d2"/>
                      </svg>
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY, fontFamily: FONT }}>{houseName}</p>
                      {leasePeriod && (
                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT }}>Lease Period: {leasePeriod}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Payments due ─────────────────────────────────── */}
          <div style={{ marginBottom: 32, minWidth: 350, width: '100%' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 700, color: NAVY, fontFamily: FONT }}>Payments due</h2>

            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontFamily: FONT, fontSize: '1rem', color: NAVY, lineHeight: 1.5 }}>

              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 1.5fr 1.5fr 60px', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
                {['DUE','CATEGORY','DESCRIPTION','STATUS','AMOUNT','ACTION'].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em' }}>{h}</span>
                ))}
              </div>

              {/* Body */}
              {paymentsDue.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '1rem' }}>
                  No upcoming payments
                </div>
              ) : (
                paymentsDue.map((p, idx) => (
                  <div
                    key={p.key}
                    style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 1.5fr 1.5fr 60px', alignItems: 'center', padding: '10px 16px', borderBottom: idx < paymentsDue.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    {/* Date block */}
                    <div>
                      <div style={{
                        width: 48, height: 48, borderRadius: 8,
                        background: p.overdue ? '#ef4444' : NAVY,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{p.day}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{p.month}</span>
                      </div>
                    </div>
                    {/* Category */}
                    <div style={{ fontWeight: 600 }}>Rent</div>
                    {/* Description */}
                    <div style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                    {/* Status */}
                    <div>
                      {p.overdue && (
                        <span style={{
                          display: 'inline-block', background: '#ef4444', color: '#fff',
                          borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                        }}>
                          OVERDUE
                        </span>
                      )}
                    </div>
                    {/* Amount */}
                    <div style={{ fontWeight: 600, color: NAVY, whiteSpace: 'nowrap' }}>
                      TZS {p.amount.toLocaleString('en', { minimumFractionDigits: 2 })}
                    </div>
                    {/* Action */}
                    <div />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Bottom: Maintenance + Insurance ─────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Maintenance */}
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY, fontFamily: FONT }}>Maintenance</p>
              </div>

              {maintenance.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 10, textAlign: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#bdbdbd">
                    <path d="m22.7 19-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#6b7280', fontFamily: FONT }}>You have no maintenance requests</p>
                  <Link
                    to="/portal/maintenance"
                    style={{ color: NAVY, fontSize: '1rem', fontFamily: FONT, fontWeight: 500, textDecoration: 'underline' }}
                  >
                    New request
                  </Link>
                </div>
              ) : (
                <div style={{ padding: '12px 20px' }}>
                  {maintenance.slice(0, 4).map((r, idx) => {
                    const STATUS = { open: { bg: '#fef2f2', color: '#dc2626', label: 'Open' }, in_progress: { bg: '#fffbeb', color: '#d97706', label: 'In Progress' }, resolved: { bg: '#f0fdf4', color: '#16a34a', label: 'Resolved' }, closed: { bg: '#f9fafb', color: '#6b7280', label: 'Closed' } };
                    const s = STATUS[r.status] || STATUS.open;
                    return (
                      <div
                        key={r._id}
                        onClick={() => navigate(`/portal/maintenance?id=${r._id}`)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < Math.min(maintenance.length, 4) - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <div>
                          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: NAVY }}>{r.title}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>{r.category}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap' }}>{s.label.toUpperCase()}</span>
                      </div>
                    );
                  })}
                  <div style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    {maintenance.length > 4 && (
                      <Link to="/portal/maintenance" style={{ color: NAVY, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                        View all ({maintenance.length})
                      </Link>
                    )}
                    <Link to="/portal/maintenance" style={{ color: NAVY, fontSize: '0.875rem', fontWeight: 500, textDecoration: 'underline', marginLeft: 'auto' }}>
                      New request
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Landlord details */}
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY, fontFamily: FONT }}>Landlord Details</p>
              </div>

              {!landlord ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', fontFamily: FONT }}>
                  No landlord details available.
                </div>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {/* Contact */}
                  <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: FONT }}>Contact</p>
                  {[
                    { label: 'Name',          value: landlord.name },
                    { label: 'Business',      value: landlord.businessName },
                    { label: 'Email',         value: landlord.email },
                    { label: 'Phone',         value: landlord.phone },
                    { label: 'Address',       value: [landlord.address, landlord.city].filter(Boolean).join(', ') },
                  ].filter(r => r.value).map(r => (
                    <div key={r.label} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontFamily: FONT, minWidth: 72, flexShrink: 0 }}>{r.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: NAVY, fontFamily: FONT, wordBreak: 'break-word' }}>{r.value}</span>
                    </div>
                  ))}

                  {/* Bank */}
                  {(landlord.bankName || landlord.bankAccountNumber || landlord.bankAccountName) && (
                    <>
                      <p style={{ margin: '16px 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: FONT }}>Payment / Bank Details</p>
                      {[
                        { label: 'Bank',        value: landlord.bankName },
                        { label: 'Account No.', value: landlord.bankAccountNumber },
                        { label: 'Account Name',value: landlord.bankAccountName },
                      ].filter(r => r.value).map(r => (
                        <div key={r.label} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontFamily: FONT, minWidth: 104, flexShrink: 0 }}>{r.label}</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: NAVY, fontFamily: FONT, wordBreak: 'break-word' }}>{r.value}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {!landlord.bankName && !landlord.bankAccountNumber && (
                    <p style={{ margin: '12px 0 0', fontSize: '0.875rem', color: '#9ca3af', fontFamily: FONT }}>No bank details provided yet.</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ── Reminders from landlord ──────────────────────── */}
          {reminders.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 700, color: NAVY, fontFamily: FONT }}>Reminders from your Landlord</h2>
              <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {reminders.map((r, idx) => {
                  const dt = r.dateTime ? new Date(r.dateTime) : null;
                  const CAT_META = {
                    Rent:          { bg: '#eff6ff', color: '#1d4ed8', accent: '#3b82f6' },
                    Maintenance:   { bg: '#fef3c7', color: '#92400e', accent: '#f59e0b' },
                    Inspection:    { bg: '#f0fdf4', color: '#166534', accent: '#22c55e' },
                    'Lease Renewal':{ bg: '#fdf4ff', color: '#7e22ce', accent: '#a855f7' },
                    Other:         { bg: '#f3f4f6', color: '#374151', accent: '#9ca3af' },
                  };
                  const cat = CAT_META[r.category] || CAT_META.Other;
                  const meta = [
                    r.house?.name,
                    dt ? dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + (dt ? ' · ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '') : null,
                  ].filter(Boolean).join('  ·  ');
                  return (
                    <div
                      key={r._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px',
                        borderBottom: idx < reminders.length - 1 ? '1px solid #f3f4f6' : 'none',
                        borderLeft: `3px solid ${cat.accent}`,
                      }}
                    >
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || '—'}</span>
                          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, background: cat.bg, color: cat.color, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                            {(r.category || 'OTHER').toUpperCase()}
                          </span>
                        </div>
                        {meta && (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: FONT }}>{meta}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Maintenance request modal ─────────────────────────── */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,34,56,0.5)', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setModal(false); setPhotos([]); } }}
        >
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32, fontFamily: FONT, color: NAVY, position: 'relative' }}>
            <button onClick={() => { setModal(false); setPhotos([]); }} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#acb9c8', padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 24px' }}>Submit a Maintenance Request</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                  <option value="" disabled>Select category</option>
                  {MAINT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Issue Title *</label>
                <input required value={form.title} maxLength={50} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Leaky faucet in kitchen" style={inp}
                  onFocus={e => { e.target.style.borderColor = NAVY; }} onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Description *</label>
                <textarea required value={form.description} rows={4} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail..." style={{ ...inp, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = NAVY; }} onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Photos <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(optional)</span></label>
                <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} style={{ width: '100%', fontSize: 13, fontFamily: FONT, color: NAVY }}/>
                {photos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {photos.map((f, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(f)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e4e9f0' }}/>
                        <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 18, height: 18, color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={lbl}>Entry Preference</label>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[{ val: 'ANYTIME', label: 'Anytime' }, { val: 'COORDINATE', label: 'Coordinate with me' }].map(({ val, label }) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: NAVY }}>
                      <input type="radio" name="preferredTime" value={val} checked={form.preferredTime === val} onChange={() => setForm(f => ({ ...f, preferredTime: val }))} style={{ accentColor: NAVY }}/>
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px 24px', background: submitting ? '#6b7280' : NAVY, color: '#fff', border: 'none', borderRadius: 60, fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}>
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
