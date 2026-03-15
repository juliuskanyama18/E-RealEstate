import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import { ArrowLeft, Calendar, X } from 'lucide-react';

const NAVY = '#042238';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

/* ── Payment method icons ───────────────────────────────────── */
const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="2" y="8" width="32" height="22" rx="2" stroke={NAVY} strokeWidth="2" fill="none" />
    <line x1="7" y1="16" x2="20" y2="16" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="7" y1="20" x2="16" y2="20" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="24" y1="13" x2="29" y2="13" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const CashIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="2" y="9" width="32" height="18" rx="2" stroke={NAVY} strokeWidth="2" fill="none" />
    <circle cx="18" cy="18" r="4.5" stroke={NAVY} strokeWidth="1.8" fill="none" />
    <circle cx="7" cy="18" r="2" fill={NAVY} />
    <circle cx="29" cy="18" r="2" fill={NAVY} />
  </svg>
);
const VenmoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="6" fill="#3D95CE" />
    <path d="M10 10h4l5 12 5-12h4L21 26h-5L10 10z" fill="#fff" />
  </svg>
);
const ZelleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="6" fill="#6D1ED4" />
    <path d="M10 11h16l-12 7 12 7H10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const CashAppIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="6" fill="#00D54B" />
    <text x="18" y="25" textAnchor="middle" fontSize="20" fontWeight="700" fontFamily="Inter,sans-serif" fill="#fff">$</text>
  </svg>
);
const PayPalIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="6" fill="#fff" stroke="#e4e9f0" strokeWidth="1.5" />
    <path d="M14 10h6c3 0 5 1.5 4.5 4.5C24 18 21.5 19.5 19 19.5h-3L15 26h-4l3-16z" fill="#003087" />
    <path d="M16 14h5c2.5 0 4 1 3.5 3.5C24 20 22 21 19.5 21h-2.5L16 26h-3l3-12z" fill="#009cde" />
  </svg>
);
const Section8Icon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="5" y="3" width="22" height="28" rx="2" stroke={NAVY} strokeWidth="2" fill="none" />
    <rect x="5" y="3" width="22" height="7" rx="2" fill={TEAL} />
    <line x1="9" y1="16" x2="23" y2="16" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="9" y1="20" x2="19" y2="20" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="9" y1="24" x2="21" y2="24" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const OtherIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="15" stroke={NAVY} strokeWidth="2" fill="none" />
    <text x="18" y="23" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif" fill={NAVY}>TZS</text>
  </svg>
);

const PAYMENT_METHODS = [
  { key: 'Check', label: 'Check', Icon: CheckIcon },
  { key: 'Cash',  label: 'Cash',  Icon: CashIcon  },
  { key: 'Other', label: 'Other', Icon: OtherIcon },
];

/* ── Shared style helpers ─────────────────────────────────── */
const label = {
  display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600,
  color: NAVY, marginBottom: 6, lineHeight: 1.4,
};
const selectWrap = {
  position: 'relative', display: 'flex', alignItems: 'center',
};
const selectStyle = {
  fontFamily: FONT, fontSize: 14, color: NAVY,
  width: '100%', padding: '9px 36px 9px 12px',
  border: '1px solid #c8d0db', borderRadius: 4,
  background: '#fff', appearance: 'none', WebkitAppearance: 'none',
  cursor: 'pointer', outline: 'none',
  lineHeight: 1.4,
};
const chevronSvg = (
  <svg style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} width="10" height="6" fill={NAVY} viewBox="0 0 10 6">
    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd" />
  </svg>
);
const linkStyle = {
  fontFamily: FONT, fontSize: 13, color: NAVY, textDecoration: 'none',
  cursor: 'pointer', display: 'inline-block', marginTop: 6,
};

/* ── Calendar picker component ───────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const CalendarPicker = ({ value, onChange, onClose }) => {
  const today = new Date();
  const parsed = value ? new Date(value) : null;
  const [viewYear,  setViewYear]  = useState((parsed || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((parsed || today).getMonth());

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 2 + i);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const select = day => {
    if (!day) return;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${dd}/${mm}/${viewYear}`);
    onClose();
  };

  const isSelected = day => {
    if (!day || !parsed) return false;
    return parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day;
  };
  const isToday = day => day && today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
      background: '#fff', border: '1px solid #d0d9e3', borderRadius: 6,
      boxShadow: '0 6px 20px rgba(4,34,56,0.13)', padding: '16px',
      minWidth: 260, fontFamily: FONT,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={viewMonth}
            onChange={e => setViewMonth(Number(e.target.value))}
            style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, border: '1px solid #d0d9e3', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', background: '#fff' }}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, border: '1px solid #d0d9e3', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', background: '#fff' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#8a9ab0' }}
          onMouseEnter={e => e.currentTarget.style.color = NAVY}
          onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}
        >
          <X size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#8a9ab0', textAlign: 'center', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={i}
              type="button"
              onClick={() => select(day)}
              disabled={!day}
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: tod ? 700 : 400,
                width: '100%', aspectRatio: '1', border: 'none', borderRadius: '50%',
                background: sel ? NAVY : 'none',
                color: !day ? 'transparent' : sel ? '#fff' : tod ? TEAL : NAVY,
                cursor: day ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (day && !sel) e.currentTarget.style.background = '#f0f3f8'; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'none'; }}
            >
              {day || ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RecordPayment = () => {
  const navigate     = useNavigate();
  const calendarRef  = useRef(null);
  const [houses,  setHouses]  = useState([]);
  const [tenants, setTenants] = useState([]);
  const [calendarOpen,     setCalendarOpen]     = useState(false);
  const [chargeModalOpen,  setChargeModalOpen]  = useState(false);
  const [chargeCalOpen,    setChargeCalOpen]    = useState(false);
  const chargeCalRef = useRef(null);
  const [chargeForm, setChargeForm] = useState({ category: '', description: '', amount: '', dueDate: '' });
  const [form, setForm] = useState({
    leaseId:       '',
    renterId:      '',
    paymentMethod: '',
    datePaid:      '',
    paymentNote:   '',
    sendReceipt:   'yes',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}${API.houses}`)
      .then(r => setHouses(r.data.data || []))
      .catch(() => {});
    axios.get(`${backendUrl}${API.tenants}`)
      .then(r => setTenants(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = e => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setCalendarOpen(false);
      if (chargeCalRef.current && !chargeCalRef.current.contains(e.target)) setChargeCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* filter tenants by selected lease/house */
  const filteredTenants = form.leaseId
    ? tenants.filter(t => t.house?._id === form.leaseId || t.house === form.leaseId)
    : tenants;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.leaseId)      return toast.error('Select a lease');
    if (!form.renterId)     return toast.error('Select a tenant');
    if (!form.paymentMethod) return toast.error('Select a payment method');
    if (!form.datePaid)     return toast.error('Enter date paid');
    setSubmitting(true);
    try {
      toast.success('Payment recorded successfully');
      navigate('/payments');
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLease  = houses.find(h => h._id === form.leaseId);
  const selectedTenant = tenants.find(t => t._id === form.renterId);
  const now = new Date();
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: '#f5f6f8', paddingBottom: 60, fontFamily: FONT, color: NAVY }}>

        {/* Back button */}
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '20px 16px 0' }}>
          <button
            onClick={() => navigate('/payments')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => e.currentTarget.style.color = TEAL}
            onMouseLeave={e => e.currentTarget.style.color = NAVY}
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
            Back
          </button>
        </div>

        {/* Form card */}
        <div style={{ maxWidth: 620, margin: '14px auto 0', padding: '0 16px' }}>
          <div style={{
            background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6,
            padding: '32px 36px 36px',
            boxShadow: '0 1px 6px rgba(4,34,56,0.07)',
          }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Title */}
              <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 6px', lineHeight: 1.2 }}>
                Record Payment
              </h1>
              <p style={{ fontFamily: FONT, fontSize: 13, color: '#5a7080', margin: '0 0 24px', lineHeight: 1.5 }}>
                Keep your records accurate by recording external payments made by your tenants.
              </p>

              {/* Lease select */}
              <div style={{ marginBottom: 4 }}>
                <label style={label} htmlFor="leaseId">
                  Select the lease you want to record a payment for:
                </label>
                <div style={selectWrap}>
                  <select
                    id="leaseId"
                    style={selectStyle}
                    value={form.leaseId}
                    onChange={e => { set('leaseId', e.target.value); set('renterId', ''); }}
                  >
                    <option value="">— Select a lease —</option>
                    {houses.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.address ? `${h.address} - ${monthLabel}` : `${h.name} - ${monthLabel}`}
                      </option>
                    ))}
                  </select>
                  {chevronSvg}
                </div>
              </div>
              <a style={linkStyle}>Haven't added the lease yet?</a>

              {/* Tenant select */}
              <div style={{ marginTop: 18, marginBottom: 4 }}>
                <label style={label} htmlFor="renterId">
                  Which tenant made the payment?
                </label>
                <div style={selectWrap}>
                  <select
                    id="renterId"
                    style={selectStyle}
                    value={form.renterId}
                    onChange={e => set('renterId', e.target.value)}
                  >
                    <option value="">— Select a tenant —</option>
                    {filteredTenants.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  {chevronSvg}
                </div>
              </div>
              <a style={linkStyle}>Add Tenants</a>

              {/* Charges section */}
              <div style={{ marginTop: 20 }}>
                <label style={label}>Select the charge(s) to record as paid:</label>
                <div style={{
                  border: '1px solid #e4e9f0', borderRadius: 4,
                  padding: '24px 20px', textAlign: 'center',
                  background: '#fafbfc',
                }}>
                  <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>
                    No Unpaid Charges
                  </h3>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: '#8a9ab0', margin: '0 0 16px' }}>
                    Add a new charge in order to record it as paid.
                  </p>
                  <button
                    type="button"
                    style={{
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#fff', background: NAVY,
                      border: 'none', borderRadius: 100,
                      padding: '10px 24px', cursor: 'pointer', lineHeight: 1,
                    }}
                    onClick={() => setChargeModalOpen(true)}
                    onMouseEnter={e => e.currentTarget.style.background = '#033A6D'}
                    onMouseLeave={e => e.currentTarget.style.background = NAVY}
                  >
                    Add New Charge
                  </button>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginTop: 24 }}>
                <label style={{ ...label, marginBottom: 12 }}>How did they pay?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {PAYMENT_METHODS.map(({ key, label: lbl, Icon }) => {
                    const chosen = form.paymentMethod === key;
                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', gap: 8,
                          border: chosen ? `2px solid ${TEAL}` : '1px solid #d0d9e3',
                          borderRadius: 6, padding: '14px 8px',
                          cursor: 'pointer', background: chosen ? '#eef8fd' : '#fff',
                          transition: 'border-color 0.15s, background 0.15s',
                          userSelect: 'none',
                        }}
                        onMouseEnter={e => { if (!chosen) e.currentTarget.style.borderColor = '#a0b8cc'; }}
                        onMouseLeave={e => { if (!chosen) e.currentTarget.style.borderColor = '#d0d9e3'; }}
                      >
                        {/* hidden radio */}
                        <input
                          type="radio" name="payment_method" value={key}
                          checked={chosen}
                          onChange={() => set('paymentMethod', key)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                        <Icon />
                        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: NAVY, lineHeight: 1 }}>
                          {lbl}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Date Paid */}
              <div style={{ marginTop: 24 }}>
                <label style={label} htmlFor="date_paid">Date Paid</label>
                <div style={{ position: 'relative', maxWidth: 220 }} ref={calendarRef}>
                  <button
                    type="button"
                    id="date_paid"
                    onClick={() => setCalendarOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontFamily: FONT, fontSize: 14,
                      color: form.datePaid ? NAVY : '#aab4be',
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${calendarOpen ? TEAL : '#c8d0db'}`,
                      borderRadius: 4, background: '#fff', cursor: 'pointer',
                      outline: 'none', lineHeight: 1.4, textAlign: 'left',
                      boxShadow: calendarOpen ? `0 0 0 2px ${TEAL}22` : 'none',
                    }}
                  >
                    <Calendar size={15} color="#8a9ab0" style={{ flexShrink: 0 }} />
                    {form.datePaid || 'DD/MM/YYYY'}
                  </button>

                  {calendarOpen && (
                    <CalendarPicker
                      value={form.datePaid}
                      onChange={v => set('datePaid', v)}
                      onClose={() => setCalendarOpen(false)}
                    />
                  )}
                </div>
              </div>

              {/* Payment Note */}
              <div style={{ marginTop: 20 }}>
                <label style={label} htmlFor="payment_note">
                  Payment Note{' '}
                  <span style={{ fontWeight: 400, color: '#8a9ab0' }}>(Optional)</span>
                </label>
                <textarea
                  id="payment_note"
                  value={form.paymentNote}
                  onChange={e => set('paymentNote', e.target.value)}
                  rows={3}
                  style={{
                    fontFamily: FONT, fontSize: 14, color: NAVY,
                    width: '100%', padding: '9px 12px',
                    border: '1px solid #c8d0db', borderRadius: 4,
                    background: '#fff', resize: 'vertical', outline: 'none',
                    lineHeight: 1.5, boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Send receipt */}
              <div style={{ marginTop: 20 }}>
                <label style={{ ...label, marginBottom: 10 }}>Send tenant a receipt?</label>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[{ val: 'yes', lbl: 'Yes' }, { val: 'no', lbl: 'No' }].map(opt => (
                    <label
                      key={opt.val}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: NAVY,
                      }}
                    >
                      <input
                        type="radio" name="sendReceipt" value={opt.val}
                        checked={form.sendReceipt === opt.val}
                        onChange={() => set('sendReceipt', opt.val)}
                        style={{ accentColor: TEAL, width: 16, height: 16, cursor: 'pointer' }}
                      />
                      {opt.lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '1px solid #e4e9f0', margin: '24px 0' }} />

              {/* Summary */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>
                    Summary
                  </h3>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', margin: 0, lineHeight: 1.5 }}>
                    The charge(s) will display as PAID immediately in your tenant's account.
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: '#8a9ab0', marginBottom: 2 }}>Total</div>
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY }}>TZS 0.00</div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'block', width: '100%', marginTop: 24,
                  fontFamily: FONT, fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#fff', background: NAVY,
                  border: 'none', borderRadius: 100,
                  padding: '13px', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, lineHeight: 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#033A6D'; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
              >
                {submitting ? 'Recording…' : 'Record Payment'}
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* ── Add New Charge Modal ─────────────────────────────── */}
      {chargeModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(4,34,56,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
          }}
          onMouseDown={e => { if (e.target === e.currentTarget) setChargeModalOpen(false); }}
        >
          <div style={{
            background: '#fff', border: '2px solid #e6e9f0', borderRadius: 4,
            maxWidth: 464, width: '100%', padding: 32, position: 'relative',
            fontFamily: FONT, color: NAVY,
          }}>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 8px', lineHeight: 1.25 }}>
              Add New Charge
            </h2>
            <p style={{ fontFamily: FONT, fontSize: 13, color: NAVY, margin: '0 0 22px', lineHeight: 1.55 }}>
              Your tenants will see this charge in their account, but they will not be notified since it will be marked as paid.
            </p>

            <form onSubmit={e => { e.preventDefault(); setChargeModalOpen(false); }} noValidate>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={label} htmlFor="charge_category">Category</label>
                <div style={selectWrap}>
                  <select
                    id="charge_category"
                    value={chargeForm.category}
                    onChange={e => setChargeForm(f => ({ ...f, category: e.target.value }))}
                    style={{
                      ...selectStyle,
                      borderColor: !chargeForm.category ? '#e55' : '#c8d0db',
                    }}
                  >
                    <option value=""></option>
                    <option value="RENT">Rent</option>
                    <option value="LATE_FEE">Late fee</option>
                    <option value="SECURITY_DEPOSIT">Security deposit</option>
                    <option value="UTILITY_CHARGE">Utility charge</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {chevronSvg}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={label} htmlFor="charge_desc">
                  Description{' '}
                  <span style={{ fontWeight: 400, color: '#8a9ab0' }}>(Optional)</span>
                </label>
                <input
                  id="charge_desc"
                  type="text"
                  maxLength={36}
                  value={chargeForm.description}
                  onChange={e => setChargeForm(f => ({ ...f, description: e.target.value }))}
                  style={{ fontFamily: FONT, fontSize: 14, color: NAVY, width: '100%', padding: '9px 12px', border: '1px solid #c8d0db', borderRadius: 4, background: '#fff', outline: 'none', lineHeight: 1.4, boxSizing: 'border-box' }}
                />
                <div style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', marginTop: 4 }}>
                  {chargeForm.description.length} / 36 characters used
                </div>
              </div>

              {/* Amount + Due date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Amount */}
                <div>
                  <label style={label} htmlFor="charge_amount">Amount</label>
                  <div style={{ ...selectWrap }}>
                    <div style={{ position: 'absolute', left: 10, pointerEvents: 'none', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#8a9ab0' }}>
                      TZS
                    </div>
                    <input
                      id="charge_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max="99999999"
                      value={chargeForm.amount}
                      onChange={e => setChargeForm(f => ({ ...f, amount: e.target.value }))}
                      style={{ fontFamily: FONT, fontSize: 14, color: NAVY, width: '100%', padding: '9px 12px 9px 44px', border: '1px solid #c8d0db', borderRadius: 4, background: '#fff', outline: 'none', lineHeight: 1.4 }}
                    />
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <label style={label} htmlFor="charge_due">Due date</label>
                  <div style={{ position: 'relative' }} ref={chargeCalRef}>
                    <button
                      type="button"
                      onClick={() => setChargeCalOpen(o => !o)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontFamily: FONT, fontSize: 14,
                        color: chargeForm.dueDate ? NAVY : '#aab4be',
                        width: '100%', padding: '9px 12px',
                        border: `1px solid ${chargeCalOpen ? TEAL : '#c8d0db'}`,
                        borderRadius: 4, background: '#fff', cursor: 'pointer',
                        outline: 'none', lineHeight: 1.4, textAlign: 'left',
                        boxShadow: chargeCalOpen ? `0 0 0 2px ${TEAL}22` : 'none',
                      }}
                    >
                      <Calendar size={14} color="#8a9ab0" style={{ flexShrink: 0 }} />
                      {chargeForm.dueDate || 'DD/MM/YYYY'}
                    </button>
                    {chargeCalOpen && (
                      <CalendarPicker
                        value={chargeForm.dueDate}
                        onChange={v => { setChargeForm(f => ({ ...f, dueDate: v })); setChargeCalOpen(false); }}
                        onClose={() => setChargeCalOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setChargeModalOpen(false)}
                  style={{
                    flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: NAVY, background: '#fff',
                    border: `2px solid ${NAVY}`, borderRadius: 100,
                    padding: '11px', cursor: 'pointer', lineHeight: 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f3f8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#fff', background: NAVY,
                    border: `2px solid ${NAVY}`, borderRadius: 100,
                    padding: '11px', cursor: 'pointer', lineHeight: 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#033A6D'}
                  onMouseLeave={e => e.currentTarget.style.background = NAVY}
                >
                  Add Charge
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default RecordPayment;
