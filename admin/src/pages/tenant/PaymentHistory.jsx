import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

const NAVY = '#0F2E5A';
const FONT = 'Lato, "Open Sans", ui-sans-serif, system-ui, sans-serif';

const STATUS_STYLE = {
  paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'Paid'    },
  overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
  pending: { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtLeaseDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const TenantPaymentHistory = () => {
  const { user } = useAuth();
  const [history,    setHistory]    = useState([]);
  const [rentStatus, setRentStatus] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [leaseMenuOpen, setLeaseMenuOpen] = useState(false);
  const leaseMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (leaseMenuRef.current && !leaseMenuRef.current.contains(e.target))
        setLeaseMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${backendUrl}${API.tenant.history}`),
      axios.get(`${backendUrl}${API.tenant.status}`),
    ]).then(([hRes, sRes]) => {
      if (hRes.status === 'fulfilled') setHistory(hRes.value.data.data || []);
      if (sRes.status === 'fulfilled') setRentStatus(sRes.value.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const leaseStart  = rentStatus?.leaseStart;
  const leaseEnd    = rentStatus?.leaseEnd;
  const leasePeriod = leaseStart && leaseEnd
    ? `${fmtLeaseDate(leaseStart)} - ${fmtLeaseDate(leaseEnd)}`
    : '';

  const q = search.trim().toLowerCase();
  const filtered = q
    ? history.filter(r =>
        (r.month || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q) ||
        (r.tenant?.name || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
      )
    : history;

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
        <div style={{ maxWidth: 1380, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '28px 40px 40px', minWidth: 0 }}>

          {/* ── Toolbar: lease selector + search ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>

            {/* Lease selector button */}
            <div ref={leaseMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLeaseMenuOpen(v => !v)}
                title="Select Lease"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: NAVY, fontFamily: FONT, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {user?.name || ''}
                  </p>
                  {leasePeriod && (
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03333em', color: 'rgba(0,0,0,0.6)', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                      Lease Period: {leasePeriod}
                    </span>
                  )}
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={NAVY}
                  style={{ flexShrink: 0, transition: 'transform 0.2s', transform: leaseMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                </svg>
              </button>

              {leaseMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.14)', zIndex: 200, minWidth: 280, padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer' }} onClick={() => setLeaseMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1976d2" style={{ flexShrink: 0 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <circle cx="12" cy="12" r="5" fill="#1976d2"/>
                    </svg>
                    <div>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: NAVY, fontFamily: FONT }}>{user?.name || ''}</p>
                      {leasePeriod && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.6)', fontFamily: FONT, display: 'block', whiteSpace: 'nowrap' }}>
                          Lease Period: {leasePeriod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 36, padding: '0 36px 0 12px', border: '1px solid #d1d5db', borderRadius: 4,
                  fontFamily: FONT, fontSize: '0.875rem', color: NAVY, background: '#fff',
                  outline: 'none', width: 220, boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = NAVY; }}
                onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af"
                style={{ position: 'absolute', right: 10, pointerEvents: 'none' }}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>
              </svg>
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{ background: '#fff', borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginTop: 20 }}>

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr 160px 120px 130px',
              alignItems: 'center', height: 45,
              padding: '0 16px', gap: 8,
              background: '#f5f6f8',
              borderBottom: '1px solid rgba(224,224,224,1)',
              boxSizing: 'border-box',
            }}>
              {[
                { label: 'DATE',        align: 'left'  },
                { label: 'DESCRIPTION', align: 'left'  },
                { label: 'TENANT',      align: 'left'  },
                { label: 'STATUS',      align: 'center'},
                { label: 'AMOUNT',      align: 'right' },
              ].map(({ label, align }) => (
                <span key={label} style={{
                  fontSize: '0.75rem', fontWeight: 500, color: NAVY, letterSpacing: '0.04em',
                  fontFamily: FONT, textAlign: align,
                  display: 'flex', alignItems: 'center', gap: 4,
                  justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                }}>
                  {label}
                </span>
              ))}
            </div>

            {/* Empty / rows */}
            {filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 24px', color: '#9ca3af', minHeight: 200 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5m0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5M7 19h14v-2H7zm0-6h14v-2H7zm0-8v2h14V5z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: FONT }}>You have no data to show</span>
              </div>
            ) : (
              filtered.map((r, idx) => {
                const sc  = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                const date = fmt(r.status === 'paid' ? r.paidDate : r.dueDate);
                return (
                  <div
                    key={r._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '130px 1fr 160px 120px 130px',
                      alignItems: 'center', height: 65,
                      padding: '0 16px', gap: 8,
                      borderBottom: idx < filtered.length - 1 ? '1px solid rgba(224,224,224,1)' : 'none',
                      fontFamily: FONT, fontSize: '0.875rem', boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ color: NAVY }}>{date}</span>

                    <span style={{ color: NAVY, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.month ? `Rent — ${r.month}` : 'Rent'}
                      {r.notes && <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>· {r.notes}</span>}
                    </span>

                    <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.tenant?.name || '—'}
                    </span>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color,
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {sc.label}
                      </span>
                    </div>

                    <span style={{ textAlign: 'right', fontWeight: 600, color: NAVY, whiteSpace: 'nowrap' }}>
                      TZS {(r.amount || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default TenantPaymentHistory;
