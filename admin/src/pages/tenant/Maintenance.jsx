import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import toast from 'react-hot-toast';

const NAVY  = '#042238';
const GREEN = '#43a047';
const FONT  = 'Lato,"Inter",ui-sans-serif,system-ui,-apple-system,sans-serif';

const MAINT_CATS = ['Plumbing','Electrical','HVAC','Appliance','Pest Control','Structural','Landscaping','Other'];

const STATUS_CHIP = {
  open:        { label: 'Open',        bg: '#9c27b0', color: '#fff' },
  in_progress: { label: 'In Progress', bg: '#ed6c02', color: '#fff' },
  resolved:    { label: 'Resolved',    bg: '#2e7d32', color: '#fff' },
  closed:      { label: 'Closed',      bg: '#757575', color: '#fff' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/* ── SVG icons ── */
const IconBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={GREEN} focusable="false" aria-hidden="true">
    <path d="M20 11H6.83l2.88-2.88c.39-.39.39-1.02 0-1.41a.996.996 0 0 0-1.41 0L3.71 11.3c-.39.39-.39 1.02 0 1.41L8.3 17.3c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L6.83 13H20c.55 0 1-.45 1-1s-.45-1-1-1"/>
  </svg>
);
const IconPlace = ({ color = '#6b7280', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} focusable="false" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"/>
  </svg>
);
const IconViewWeek = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#9ca3af" focusable="false" aria-hidden="true">
    <path d="M5.33 20H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1.33c1.1 0 2 .9 2 2v12c0 1.1-.89 2-2 2M22 18V6c0-1.1-.9-2-2-2h-1.33c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2H20c1.11 0 2-.9 2-2m-7.33 0V6c0-1.1-.9-2-2-2h-1.33c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h1.33c1.1 0 2-.9 2-2"/>
  </svg>
);
const IconCalendar = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#9ca3af" focusable="false" aria-hidden="true">
    <path d="M20 3h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H7V2c0-.55-.45-1-1-1s-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 18H5c-.55 0-1-.45-1-1V8h16v12c0 .55-.45 1-1 1"/>
  </svg>
);

/* ── Detail view ── */
const DetailView = ({ request: r, onBack }) => {
  const sc   = STATUS_CHIP[r.status] || STATUS_CHIP.open;
  const date = fmtDate(r.createdAt);

  return (
    <Layout>
      <div style={{ flex: 1, background: '#f5f6f8', fontFamily: FONT, color: NAVY, minHeight: '100vh' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px 48px', display: 'flex', flexDirection: 'column' }}>

          {/* Back button */}
          <div>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: -8, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(67,160,71,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <IconBack />
            </button>
          </div>

          {/* Location caption */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66, letterSpacing: '0.03333em', color: GREEN, marginBottom: 4 }}>
            <IconPlace color={GREEN} size={16} />
            {r.house?.name || ''}
          </span>

          {/* Title */}
          <h1 style={{ margin: '0 0 20px', fontFamily: FONT, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, color: NAVY }}>
            {r.title}
          </h1>

          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconViewWeek />
              <p style={{ margin: 0, fontFamily: FONT, fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>Status</p>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 8px',
              borderRadius: 16, background: sc.bg, color: sc.color,
              fontFamily: FONT, fontSize: '0.75rem', fontWeight: 400, whiteSpace: 'nowrap',
            }}>
              {sc.label}
            </span>
          </div>

          {/* Date submitted row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCalendar />
              <p style={{ margin: 0, fontFamily: FONT, fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>Date submitted</p>
            </div>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: '1rem', fontWeight: 400, color: NAVY }}>
              {date}
            </p>
          </div>

          {/* Description tab */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ borderBottom: '1px solid #e5e7eb' }}>
              <span style={{
                display: 'inline-block', paddingBottom: 10,
                fontFamily: FONT, fontSize: '0.875rem', fontWeight: 700,
                color: GREEN, letterSpacing: '0.08em', textTransform: 'uppercase',
                borderBottom: `2px solid ${GREEN}`, lineHeight: 1,
              }}>
                Description
              </span>
            </div>
          </div>
          <p style={{ margin: '0 0 20px', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43, letterSpacing: '0.01071em', color: NAVY }}>
            {r.description || '—'}
          </p>

          {/* Photo grid */}
          {r.photos?.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
              {r.photos.map((photo, pi) => {
                const src = photo.startsWith('http') ? photo : `${backendUrl}${photo}`;
                return (
                  <li key={pi} style={{ gridColumnEnd: 'span 1', gridRowEnd: 'span 1', height: 'auto' }}>
                    <a href={src} target="_blank" rel="noreferrer">
                      <img src={src} alt={`image-${pi + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer', borderRadius: 6, display: 'block' }} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

        </div>
      </div>
    </Layout>
  );
};

/* ── Main component ── */
const TenantMaintenance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id');
  const [maintenance, setMaintenance] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ category: '', title: '', description: '', preferredTime: 'ANYTIME' });
  const [photos,      setPhotos]      = useState([]);
  const [submitting,  setSubmitting]  = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${backendUrl}${API.tenant.maintenance}`);
      setMaintenance(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const lbl = { fontSize: 12, fontWeight: 700, color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6, fontFamily: FONT };
  const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 6, fontFamily: FONT, fontSize: 14, color: NAVY, background: '#fff', boxSizing: 'border-box', outline: 'none' };

  /* Detail page — driven by ?id= URL param */
  const selected = requestId ? (maintenance.find(r => r._id === requestId) ?? null) : null;
  if (selected) {
    return <DetailView request={selected} onBack={() => navigate('/portal/maintenance')} />;
  }

  /* Loading */
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

  /* List page */
  return (
    <Layout>
      <div style={{ flex: 1, background: '#f5f6f8', fontFamily: FONT, color: NAVY, minHeight: '100vh' }}>
        <div className="page-content" style={{ paddingTop: 28, paddingBottom: 48 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: -8, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(67,160,71,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <IconBack />
              </button>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: NAVY }}>Maintenance</h1>
            </div>
            <button
              onClick={() => setModal(true)}
              style={{ background: NAVY, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#033a6d'; }}
              onMouseLeave={e => { e.currentTarget.style.background = NAVY; }}
            >
              + New Request
            </button>
          </div>


          {maintenance.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#d1d5db" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="m22.61 18.99-9.08-9.08c.93-2.34.45-5.1-1.44-7C9.79.61 6.21.4 3.66 2.26L7.5 6.11 6.08 7.52 2.25 3.69C.39 6.23.6 9.82 2.9 12.11c1.86 1.86 4.57 2.35 6.89 1.48l9.11 9.11c.39.39 1.02.39 1.41 0l2.3-2.3c.4-.38.4-1.01 0-1.41m-3 1.6-9.46-9.46c-.61.45-1.29.72-2 .82-1.36.2-2.79-.21-3.83-1.25C3.37 9.76 2.93 8.5 3 7.26l3.09 3.09 4.24-4.24-3.09-3.09c1.24-.07 2.49.37 3.44 1.31 1.08 1.08 1.49 2.57 1.24 3.96-.12.71-.42 1.37-.88 1.96l9.45 9.45z"/>
              </svg>
              <h3 style={{ fontFamily: FONT, fontSize: '1.125rem', fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>No maintenance requests</h3>
              <p style={{ fontFamily: FONT, fontSize: '1rem', color: '#9ca3af', margin: '0 0 20px' }}>
                Let your landlord know about any issues.
              </p>
              <button
                onClick={() => setModal(true)}
                style={{ background: NAVY, color: '#fff', border: 'none', borderRadius: 60, padding: '12px 32px', fontFamily: FONT, fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                New Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {maintenance.map(r => {
                const sc   = STATUS_CHIP[r.status] || STATUS_CHIP.open;
                const date = fmtDate(r.createdAt);
                return (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/portal/maintenance?id=${r._id}`)}
                    style={{
                      background: '#fff',
                      borderRadius: 4,
                      boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0px 4px 8px -2px rgba(0,0,0,0.2),0px 2px 4px 0px rgba(0,0,0,0.14),0px 1px 6px 0px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'; }}
                  >
                    <div style={{ padding: '16px' }}>

                      {/* House location — body2 */}
                      <p style={{ margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43, color: '#6b7280' }}>
                        <IconPlace />
                        {r.house?.name || ''}
                      </p>

                      {/* Title */}
                      <p style={{ margin: '0 0 3px', fontFamily: FONT, fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.01em', color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.title}>
                        {r.title}
                      </p>

                      {/* Description — 2-line clamp */}
                      {r.description && (
                        <p style={{ margin: '0 0 4px', fontFamily: FONT, fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5, color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {r.description}
                        </p>
                      )}

                      {/* Photos thumbnails */}
                      {r.photos?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                          {r.photos.map((photo, pi) => (
                            <img
                              key={pi}
                              src={photo.startsWith('http') ? photo : `${backendUrl}${photo}`}
                              alt=""
                              onClick={e => e.stopPropagation()}
                              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e4e9f0' }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Bottom: status chip + date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 8px',
                          borderRadius: 16, background: sc.bg, color: sc.color,
                          fontFamily: FONT, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1, whiteSpace: 'nowrap',
                        }}>
                          {sc.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: '0.875rem', fontWeight: 400, color: '#6b7280' }}>
                          <IconCalendar size={16} />
                          {date}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,34,56,0.5)', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setModal(false); setPhotos([]); } }}
        >
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32, fontFamily: FONT, color: NAVY, position: 'relative' }}>
            <button onClick={() => { setModal(false); setPhotos([]); }} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#acb9c8', padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

export default TenantMaintenance;
