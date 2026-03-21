import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { ArrowLeft, Info } from 'lucide-react';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CATEGORIES = [
  { value: '',              label: 'Select a category' },
  { value: 'RENT',          label: 'Rent'              },
  { value: 'UTILITY_CHARGE',label: 'Utility Charge'    },
  { value: 'OTHER',         label: 'Other'             },
];

const getOrdinal = n => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear + i);

/* DD/MM/YYYY ↔ YYYY-MM-DD helpers */
const toNativeDate = ddmmyyyy => {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  if (!dd || !mm || !yyyy || yyyy.length < 4) return '';
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
};
const fromNativeDate = yyyymmdd => {
  if (!yyyymmdd) return '';
  const [yyyy, mm, dd] = yyyymmdd.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

/* ── Shared field styles ── */
const fieldWrap  = { marginBottom: 18 };
const labelStyle = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 };
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1px solid #c8d0db', borderRadius: 4,
  padding: '9px 12px', outline: 'none', background: '#fff',
};
const chevronSvg = (
  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    width="10" height="6" viewBox="0 0 10 6" fill={NAVY}>
    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd" />
  </svg>
);
const selectWrap  = { position: 'relative' };
const selectStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1px solid #c8d0db', borderRadius: 4,
  padding: '9px 36px 9px 12px', appearance: 'none',
  cursor: 'pointer', outline: 'none', background: '#fff',
};

/* ── Calendar icon SVG ── */
const CalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="16" height="14" rx="2" stroke={NAVY} strokeWidth="1.6" fill="none"/>
    <line x1="1" y1="7" x2="17" y2="7" stroke={NAVY} strokeWidth="1.6"/>
    <line x1="5" y1="1" x2="5" y2="5" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="13" y1="1" x2="13" y2="5" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

/* ── Custom Tooltip ── */
const Tooltip = ({ text, size = 15 }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'default' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info size={size} color={TEAL} strokeWidth={2} />
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: NAVY,
          color: '#fff',
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.5,
          borderRadius: 6,
          padding: '10px 14px',
          width: 220,
          boxShadow: '0 4px 16px rgba(4,34,56,0.22)',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute',
            bottom: -7,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: `7px solid ${NAVY}`,
          }} />
        </div>
      )}
    </div>
  );
};

const SetUpMonthlyCharge = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const leaseId   = location.state?.leaseId || '';
  const leaseName = location.state?.leaseName || '';

  const now = new Date();
  const [category,    setCategory]    = useState('RENT');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [dueDate,     setDueDate]     = useState('');   // DD/MM/YYYY string
  const [firstMonth,  setFirstMonth]  = useState(now.getMonth());
  const [firstYear,   setFirstYear]   = useState(now.getFullYear());
  const [lastMonth,   setLastMonth]   = useState(now.getMonth() === 0 ? 11 : now.getMonth() - 1);
  const [lastYear,    setLastYear]    = useState(now.getMonth() === 0 ? now.getFullYear() : now.getFullYear() + 1);
  const [untilEnd,    setUntilEnd]    = useState(true);
  const [showLateFee, setShowLateFee] = useState(false);
  const [lateFeeAmt,  setLateFeeAmt]  = useState('');

  const hiddenDateRef = useRef(null);

  /* Parse day number from DD/MM/YYYY for ordinal hint */
  const dueDayNum = (() => {
    const d = parseInt((dueDate || '').split('/')[0], 10);
    return d >= 1 && d <= 31 ? d : null;
  })();

  /* Summary date strings */
  const firstDateStr = `${MONTHS[firstMonth]} 01, ${firstYear}`;
  const lastDateStr  = `${MONTHS[lastMonth]} 01, ${lastYear}`;

  /* Allow typing DD/MM/YYYY with auto-slash insertion */
  const handleDueDateTyping = e => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    // Auto-insert slashes after DD and MM
    const digits = val.replace(/\//g, '');
    if (digits.length <= 2) {
      val = digits;
    } else if (digits.length <= 4) {
      val = `${digits.slice(0,2)}/${digits.slice(2)}`;
    } else {
      val = `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4,8)}`;
    }
    setDueDate(val);
    // Sync hidden date input
    if (hiddenDateRef.current) {
      hiddenDateRef.current.value = toNativeDate(val);
    }
  };

  /* Picker selection → update text field */
  const handlePickerChange = e => {
    const formatted = fromNativeDate(e.target.value);
    setDueDate(formatted);
  };

  const [tenantId,    setTenantId]    = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState({});

  // Fetch the tenant for this house when leaseId (house._id) is available
  useEffect(() => {
    if (!leaseId) return;
    axios.get(`${backendUrl}${API.houses}/${leaseId}/tenants`)
      .then(res => {
        const tenants = res.data.data || [];
        if (tenants.length > 0) setTenantId(tenants[0]._id);
      })
      .catch(() => {});
  }, [leaseId]);

  const validate = () => {
    const e = {};
    if (!amount)  e.amount  = 'This value is required';
    if (!dueDate) e.dueDate = 'This value is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    if (!tenantId) { toast.error('No tenant found for this property'); return; }

    // Build list of months from firstMonth/Year to lastMonth/Year (max 24 months)
    const months = [];
    const endM = untilEnd ? firstMonth + 23 : lastMonth + (lastYear - firstYear) * 12;
    const startTotal = firstMonth + firstYear * 12;
    const endTotal   = Math.min(startTotal + (untilEnd ? 23 : endM - firstMonth + (lastYear - firstYear) * 12), startTotal + 23);
    for (let t = startTotal; t <= Math.min(endTotal, startTotal + 23); t++) {
      const y = Math.floor(t / 12);
      const m = t % 12;
      months.push({ year: y, month: m });
    }

    const [dd, mm, yyyy] = (dueDate || '').split('/');

    setSubmitting(true);
    try {
      await Promise.all(months.map(({ year, month }) => {
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const dueDateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(dd || '01').padStart(2, '0')}`;
        return axios.post(`${backendUrl}${API.charges}`, {
          tenantId,
          amount: parseFloat(amount),
          month: monthStr,
          dueDate: dueDateISO,
          notes: description || '',
        });
      }));
      toast.success(`${months.length} charge${months.length > 1 ? 's' : ''} created`);
      navigate('/payments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create charges');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ fontFamily: FONT, fontSize: 14, color: NAVY, minHeight: '100vh', background: '#f5f6f8', paddingBottom: 60 }}>

        {/* Page header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e4e9f0', marginBottom: 32 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24, paddingBottom: 20 }}>
              <button
                onClick={() => navigate('/payments')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8a9ab0', display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: FONT, fontSize: 13, fontWeight: 600, padding: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = NAVY}
                onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}
              >
                <ArrowLeft size={16} strokeWidth={2} />
                Back to Payments
              </button>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            background: '#fff', border: '1px solid #e6e9f0',
            borderRadius: 4, padding: 32,
          }}>
            <form onSubmit={handleSubmit}>

              <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 20px' }}>
                Set Up Monthly Charge
              </h2>

              {/* Charge Info header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY }}>
                  Charge Info
                </span>
                <Tooltip
                  size={15}
                  text="This is shown to your tenants so they can recognize the charge."
                />
              </div>

              {/* Category */}
              <div style={fieldWrap}>
                <label style={labelStyle}>Category</label>
                <div style={selectWrap}>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
                    {CATEGORIES.filter(c => c.value !== '').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {chevronSvg}
                </div>
              </div>

              {/* Description */}
              <div style={fieldWrap}>
                <label style={labelStyle}>
                  Description{' '}
                  <span style={{ fontWeight: 400, color: '#8a9ab0' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={inputStyle}
                />
                <span style={{ fontFamily: FONT, fontSize: 12, color: NAVY, marginTop: 4, display: 'block' }}>
                  {description.length} / 50 characters used
                </span>
              </div>

              {/* Amount + Due Date row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>

                {/* Amount */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                      fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, pointerEvents: 'none',
                    }}>TZS</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: '' })); }}
                      style={{ ...inputStyle, paddingLeft: 44, ...(errors.amount ? { border: '1px solid #e53e3e' } : {}) }}
                    />
                  </div>
                  {errors.amount && (
                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#e53e3e', marginTop: 4, display: 'block' }}>
                      {errors.amount}
                    </span>
                  )}
                </div>

                {/* Due Date — DD/MM/YYYY */}
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
                    Due Date
                    <Tooltip
                      size={13}
                      text="We send tenants the charge 15 days before the due date."
                    />
                  </label>
                  <div style={{ position: 'relative' }}>
                    {/* Calendar icon — clicking opens the hidden date picker */}
                    <button
                      type="button"
                      onClick={() => hiddenDateRef.current?.showPicker?.() || hiddenDateRef.current?.click()}
                      style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <CalIcon />
                    </button>

                    {/* Visible text input */}
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={dueDate}
                      onChange={e => { handleDueDateTyping(e); setErrors(prev => ({ ...prev, dueDate: '' })); }}
                      maxLength={10}
                      style={{ ...inputStyle, paddingLeft: 36, width: '100%', ...(errors.dueDate ? { border: '1px solid #e53e3e' } : {}) }}
                    />

                    {/* Hidden native date picker — synced with text input */}
                    <input
                      ref={hiddenDateRef}
                      type="date"
                      value={toNativeDate(dueDate)}
                      onChange={handlePickerChange}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        opacity: 0, pointerEvents: 'none',
                      }}
                    />
                  </div>
                  {errors.dueDate && (
                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#e53e3e', marginTop: 4, display: 'block' }}>
                      {errors.dueDate}
                    </span>
                  )}
                  {!errors.dueDate && dueDayNum && (
                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#8a9ab0', marginTop: 4, display: 'block' }}>
                      {getOrdinal(dueDayNum)} of each month
                    </span>
                  )}
                </div>
              </div>

              {/* First Month + optional Last Month */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>

                  {/* First Month */}
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>First Month</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ ...selectWrap, flex: 1 }}>
                        <select value={firstMonth} onChange={e => setFirstMonth(Number(e.target.value))} style={selectStyle}>
                          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        {chevronSvg}
                      </div>
                      <div style={{ ...selectWrap, width: 90 }}>
                        <select value={firstYear} onChange={e => setFirstYear(Number(e.target.value))} style={selectStyle}>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {chevronSvg}
                      </div>
                    </div>
                  </div>

                  {/* TO + Last Month — only when untilEnd is false */}
                  {!untilEnd && (
                    <>
                      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY, paddingBottom: 10 }}>
                        TO
                      </span>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Last Month</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ ...selectWrap, flex: 1 }}>
                            <select value={lastMonth} onChange={e => setLastMonth(Number(e.target.value))} style={selectStyle}>
                              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            {chevronSvg}
                          </div>
                          <div style={{ ...selectWrap, width: 90 }}>
                            <select value={lastYear} onChange={e => setLastYear(Number(e.target.value))} style={selectStyle}>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            {chevronSvg}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={untilEnd}
                    onChange={e => setUntilEnd(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: NAVY, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>
                    Create charges until the lease ends
                  </span>
                </label>
                <Tooltip
                  size={13}
                  text="Charges will automatically stop on the lease end date. If the lease is set to continue month-to-month, charges will be sent to your tenant until you delete the recurring charge or end the lease."
                />
              </div>

              {/* Summary */}
              <div style={{
                fontFamily: FONT, fontSize: 13, color: NAVY,
                background: '#f0f9ff', borderRadius: 4, padding: '10px 14px',
                marginBottom: 18, lineHeight: 1.6,
              }}>
                {untilEnd ? (
                  <>
                    The first monthly charge will be due on <strong>{firstDateStr}</strong> and sent to your
                    tenants every month until you delete this charge or the lease ends.
                  </>
                ) : (
                  <>
                    The first monthly charge will be due on <strong>{firstDateStr}</strong> and the last one
                    will be due on <strong>{lastDateStr}</strong>.
                  </>
                )}
              </div>

              {/* Add Late Fees */}
              {!showLateFee ? (
                <button
                  type="button"
                  onClick={() => setShowLateFee(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY,
                    background: '#fff', border: `1px solid #c8d0db`, borderRadius: 100,
                    padding: '8px 18px', cursor: 'pointer', marginBottom: 24,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
                  Add Late Fees
                </button>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Late Fee Amount (TZS)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={lateFeeAmt}
                    onChange={e => setLateFeeAmt(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Submit */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#fff', background: submitting ? '#6b7280' : NAVY,
                    border: 'none', borderRadius: 100,
                    padding: '12px 48px', cursor: submitting ? 'not-allowed' : 'pointer', lineHeight: 1,
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#033A6D'; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
                >
                  {submitting ? 'Creating…' : 'Create Charge'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SetUpMonthlyCharge;
