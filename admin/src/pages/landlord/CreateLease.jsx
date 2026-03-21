import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl } from '../../config/constants';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

const NAVY = '#042238';
const FONT = '"Inter", sans-serif';

/* ── Payment frequencies (excluding Standalone, Weekly, Fortnightly, 4 Weeks) ── */
const PAYMENT_FREQUENCIES = [
  { label: 'One-Time',                  value: 'One-Time' },
  { label: 'Monthly (Calendar Month)',  value: '1 Month' },
  { label: '2 Months',                  value: '2 Months' },
  { label: 'Quarterly',                 value: '3 Months' },
  { label: '4 Months',                  value: '4 Months' },
  { label: '5 Months',                  value: '5 Months' },
  { label: 'Bi-Annually (6 Months)',    value: '6 Months' },
  { label: '18 Months',                 value: '18 Months' },
  { label: '24 Months',                 value: '24 Months' },
  { label: 'Yearly',                    value: '1 Year' },
];

/* ── Payment day options 1–30 + End of Month ── */
const ordinal = (n) => {
  if (n === 31) return 'End of Month';
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const PAYMENT_DAYS = [
  ...Array.from({ length: 30 }, (_, i) => ({ label: ordinal(i + 1), value: String(i + 1) })),
  { label: 'End of Month', value: '31' },
];

const FURNISHING_OPTIONS = ['Unfurnished', 'Furnished', 'Partially Furnished'];

/* ── Date helpers (DD/MM/YYYY ↔ YYYY-MM-DD) ── */
const autoFormatDate = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};
const parseDMY = (str) => {
  if (!str || str.length < 10) return null;
  const [d, m, y] = str.split('/');
  if (!d || !m || !y || y.length !== 4) return null;
  const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  return isNaN(date) ? null : `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

/* ── Convert YYYY-MM-DD → DD/MM/YYYY ── */
const isoToDMY = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/* ── DateInput with calendar icon ── */
const DateInput = ({ value, onChange, placeholder = 'DD/MM/YYYY' }) => {
  const pickerRef = useRef(null);

  /* Convert the native picker's YYYY-MM-DD value to DD/MM/YYYY */
  const handlePicker = (e) => {
    if (e.target.value) onChange(isoToDMY(e.target.value));
  };

  /* Convert current DD/MM/YYYY back to YYYY-MM-DD for the hidden picker */
  const pickerValue = parseDMY(value) || '';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(autoFormatDate(e.target.value))}
        placeholder={placeholder}
        maxLength={10}
        style={{
          width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #d1d5db', borderRadius: 6,
          fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
        }}
      />
      {/* Calendar icon button */}
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.() || pickerRef.current?.click()}
        style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#9ca3af' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 18H4V8h16zm0-13H4V5h16zM9 12H7v2h2zm4 0h-2v2h2zm4 0h-2v2h2zm-8 4H7v2h2zm4 0h-2v2h2zm4 0h-2v2h2z"/>
        </svg>
      </button>
      {/* Hidden native date picker */}
      <input
        ref={pickerRef}
        type="date"
        value={pickerValue}
        onChange={handlePicker}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        tabIndex={-1}
      />
    </div>
  );
};

/* ── Accordion Section ───────────────────────────────────────── */
const Section = ({ title, subtitle, open, onToggle, children, stepNum }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }}>
    <button
      type="button" onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: open ? NAVY : '#e5e7eb',
          color: open ? '#fff' : '#9ca3af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{stepNum}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {open ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
    </button>
    {open && (
      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>
        {children}
      </div>
    )}
  </div>
);

/* ── Field wrapper ───────────────────────────────────────────── */
const Field = ({ label, required, hint, children, half }) => (
  <div style={{ marginTop: 16, width: half ? 'calc(50% - 6px)' : '100%' }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      {hint && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6,
  fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
};
const selectStyle = { ...inputStyle, background: '#fff' };

/* ── Radio Yes/No ────────────────────────────────────────────── */
const YesNo = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
    {['Yes', 'No'].map(opt => (
      <label key={opt} style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px',
        border: `1.5px solid ${value === opt ? '#1976d2' : '#d1d5db'}`,
        borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500,
        color: value === opt ? '#1976d2' : '#374151',
        background: value === opt ? '#eff6ff' : '#fff',
      }}>
        <input type="radio" value={opt} checked={value === opt} onChange={() => onChange(opt)}
          style={{ accentColor: '#1976d2' }} />
        {opt}
      </label>
    ))}
  </div>
);

/* ── Late Fee Row ────────────────────────────────────────────── */
const LateFeeRow = ({ fee, idx, onChange, onRemove }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Amount (TZS)</label>
      <input type="number" min="0" value={fee.amount}
        onChange={e => onChange(idx, 'amount', e.target.value)} style={inputStyle} placeholder="0" />
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Days after due</label>
      <input type="number" min="1" value={fee.days}
        onChange={e => onChange(idx, 'days', e.target.value)} style={inputStyle} placeholder="5" />
    </div>
    <button type="button" onClick={() => onRemove(idx)}
      style={{ padding: '9px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <X size={15} color="#ef4444" />
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
export default function CreateLease() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [openSection, setOpenSection] = useState(1);

  /* ── Section 1: Lease Details ── */
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [frequency, setFrequency]   = useState('1 Month');
  const [paymentDay, setPaymentDay] = useState('31');
  const [deposit, setDeposit]       = useState('');
  const [chargeLateFees, setChargeLateFees] = useState('No');
  const [lateFees, setLateFees]     = useState([]);

  /* ── Section 2: Set Reminders ── */
  const [leaseExpiryReminder, setLeaseExpiryReminder]     = useState('Yes');
  const [leaseExpiryReminderDays, setLeaseExpiryReminderDays] = useState('60');
  const [rentReminder, setRentReminder]                   = useState('Yes');
  const [overdueReminder, setOverdueReminder]             = useState('Yes');

  /* ── Section 3: Additional Info ── */
  const [furnishing, setFurnishing] = useState('Unfurnished');
  const [notes, setNotes]           = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rental_token');
    axios.get(`${backendUrl}/api/landlord/houses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setHouse(res.data.data))
      .catch(() => {});
  }, [id]);

  const addLateFee    = () => setLateFees(prev => [...prev, { amount: '', days: '' }]);
  const removeLateFee = (idx) => setLateFees(prev => prev.filter((_, i) => i !== idx));
  const changeLateFee = (idx, field, val) =>
    setLateFees(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));

  const toggle = (n) => setOpenSection(prev => prev === n ? null : n);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedStart = parseDMY(startDate);
    if (!parsedStart) { toast.error('Enter a valid start date (DD/MM/YYYY)'); setOpenSection(1); return; }
    const parsedEnd = endDate ? parseDMY(endDate) : null;
    if (endDate && !parsedEnd) { toast.error('Enter a valid end date (DD/MM/YYYY)'); setOpenSection(1); return; }
    if (!rentAmount) { toast.error('Rent amount is required'); setOpenSection(1); return; }

    setSubmitting(true);
    try {
      const payload = {
        startDate: parsedStart,
        endDate: parsedEnd,
        rentAmount: Number(rentAmount),
        frequency,
        paymentDay: Number(paymentDay),
        deposit: deposit ? Number(deposit) : undefined,
        chargeLateFees: chargeLateFees === 'Yes',
        lateFees: chargeLateFees === 'Yes' ? lateFees : [],
        leaseExpiryReminder: leaseExpiryReminder === 'Yes',
        leaseExpiryReminderDays: leaseExpiryReminder === 'Yes' ? Number(leaseExpiryReminderDays) : undefined,
        rentReminder: rentReminder === 'Yes',
        overdueReminder: overdueReminder === 'Yes',
        furnishing,
        notes,
      };
      const token = localStorage.getItem('rental_token');
      await axios.post(`${backendUrl}/api/landlord/houses/${id}/leases`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Lease created successfully');
      navigate(`/houses/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create lease');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ fontFamily: FONT, minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px', boxSizing: 'border-box' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 20, flexWrap: 'wrap' }}>
            <Link to="/houses" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>Properties</Link>
            <span style={{ color: '#d1d5db' }}>›</span>
            <Link to={`/houses/${id}`} style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>
              {house?.name || '...'}
            </Link>
            <span style={{ color: '#d1d5db' }}>›</span>
            <span style={{ color: '#374151' }}>Create lease</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 24, marginTop: 0 }}>
            Create lease
          </h1>

          <form onSubmit={handleSubmit}>

            {/* ─── Section 1: Lease Details ─── */}
            <Section
              stepNum={1} title="Lease details"
              subtitle="Set rent amount, payment schedule, and deposit"
              open={openSection === 1} onToggle={() => toggle(1)}
            >
              {/* Start / End date row */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Field label="Start date" required half>
                  <DateInput value={startDate} onChange={setStartDate} />
                </Field>
                <Field label="End date" hint="(optional)" half>
                  <DateInput value={endDate} onChange={setEndDate} />
                </Field>
              </div>

              {/* Rent amount */}
              <Field label="Rent amount" required>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
                  <span style={{ padding: '9px 12px', background: '#f3f4f6', borderRight: '1px solid #d1d5db', fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>TZS</span>
                  <input type="number" min="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)}
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }} placeholder="0" />
                </div>
              </Field>

              {/* Payment frequency */}
              <Field label="Payment frequency" required>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} style={selectStyle}>
                  {PAYMENT_FREQUENCIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </Field>

              {/* Payment day */}
              <Field label="Payment day" required>
                <select value={paymentDay} onChange={e => setPaymentDay(e.target.value)} style={selectStyle}>
                  {PAYMENT_DAYS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </Field>

              {/* Deposit */}
              <Field label="Deposit amount" hint="(optional)">
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
                  <span style={{ padding: '9px 12px', background: '#f3f4f6', borderRight: '1px solid #d1d5db', fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>TZS</span>
                  <input type="number" min="0" value={deposit} onChange={e => setDeposit(e.target.value)}
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }} placeholder="0" />
                </div>
              </Field>

              {/* Late fees */}
              <Field label="Charge late fees?">
                <YesNo value={chargeLateFees} onChange={setChargeLateFees} />
              </Field>
              {chargeLateFees === 'Yes' && (
                <div style={{ marginTop: 8 }}>
                  {lateFees.map((fee, idx) => (
                    <LateFeeRow key={idx} fee={fee} idx={idx} onChange={changeLateFee} onRemove={removeLateFee} />
                  ))}
                  <button type="button" onClick={addLateFee}
                    style={{
                      marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'none', border: '1.5px dashed #d1d5db', borderRadius: 6,
                      padding: '7px 14px', fontSize: 13, color: '#1976d2', cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    <Plus size={14} /> Add late fee
                  </button>
                </div>
              )}

              {/* Next step */}
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setOpenSection(2)}
                  style={{ background: NAVY, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Next step
                </button>
              </div>
            </Section>

            {/* ─── Section 2: Set Reminders ─── */}
            <Section
              stepNum={2} title="Set reminders"
              subtitle="Automate lease expiry and rent reminders"
              open={openSection === 2} onToggle={() => toggle(2)}
            >
              {/* Lease expiry reminder */}
              <Field label="Lease expiry reminder">
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, marginBottom: 8 }}>
                  Send a reminder before the lease expires.
                </p>
                <YesNo value={leaseExpiryReminder} onChange={setLeaseExpiryReminder} />
              </Field>
              {leaseExpiryReminder === 'Yes' && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Lease expiry reminder days before
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', maxWidth: 220 }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={leaseExpiryReminderDays}
                      onChange={e => setLeaseExpiryReminderDays(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="E.g. 60"
                      style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }}
                    />
                    <span style={{ padding: '9px 12px', background: '#f3f4f6', borderLeft: '1px solid #d1d5db', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      day(s)
                    </span>
                  </div>
                </div>
              )}

              {/* Rent reminders */}
              <Field label="Send rent reminders">
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, marginBottom: 8 }}>
                  Remind the tenant a few days before rent is due.
                </p>
                <YesNo value={rentReminder} onChange={setRentReminder} />
              </Field>

              {/* Overdue reminders */}
              <Field label="Send rent overdue reminders">
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 0, marginBottom: 8 }}>
                  Notify the tenant when rent becomes overdue.
                </p>
                <YesNo value={overdueReminder} onChange={setOverdueReminder} />
              </Field>

              {/* Next step */}
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setOpenSection(3)}
                  style={{ background: NAVY, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Next step
                </button>
              </div>
            </Section>

            {/* ─── Section 3: Additional Information ─── */}
            <Section
              stepNum={3} title="Additional information"
              subtitle="Optional details about the property"
              open={openSection === 3} onToggle={() => toggle(3)}
            >
              <Field label="Furnishing">
                <select value={furnishing} onChange={e => setFurnishing(e.target.value)} style={selectStyle}>
                  {FURNISHING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              <Field label="Notes" hint="(optional)">
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={4} style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Any additional notes about this lease..."
                />
              </Field>
            </Section>

            {/* ─── Create Lease Button ─── */}
            <div style={{ marginTop: 24 }}>
              <button type="submit" disabled={submitting}
                style={{
                  width: '100%', padding: '13px 0',
                  background: submitting ? '#93c5fd' : '#1976d2',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.25)',
                }}
              >
                {submitting ? 'Creating lease...' : 'Create lease'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}
