import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { ArrowLeft, Info, X } from 'lucide-react';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const CATEGORIES = [
  { value: '',                    label: 'Select a category'   },
  { value: 'RENT',                label: 'Rent'                },
  { value: 'LATE_FEE',            label: 'Late Fee'            },
  { value: 'SECURITY_DEPOSIT',    label: 'Security Deposit'    },
  { value: 'UTILITY_CHARGE',      label: 'Utility Charge'      },
  { value: 'NSF_RETURNED_PAYMENT',label: 'NSF Fee'             },
  { value: 'OTHER',               label: 'Other'               },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear + i);

/* ── Shared styles ── */
const fieldWrap  = { marginBottom: 18 };
const labelStyle = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 };
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1px solid #c8d0db', borderRadius: 4,
  padding: '9px 12px', outline: 'none', background: '#fff',
};
const selectWrap  = { position: 'relative' };
const selectStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1px solid #c8d0db', borderRadius: 4,
  padding: '9px 36px 9px 12px', appearance: 'none',
  cursor: 'pointer', outline: 'none', background: '#fff',
};
const chevronSvg = (
  <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    width="10" height="6" viewBox="0 0 10 6" fill={NAVY}>
    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd" />
  </svg>
);

/* ── Calendar icon SVG ── */
const CalIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill={NAVY} xmlns="http://www.w3.org/2000/svg">
    <path d="M5.054 0c.26 0 .47.21.47.47v.839h4.951V.471c0-.26.211-.471.471-.471h1.964c.26 0 .471.21.471.47v.839h2.148a.47.47 0 01.463.386L16 1.78v13.75c0 .26-.21.47-.47.47H.47a.47.47 0 01-.47-.47V1.78c0-.26.21-.47.47-.47l2.148-.001V.471C2.619.21 2.83 0 3.09 0h1.964zm10.004 5.524H.941v9.535H15.06l-.001-9.535zm-4.112.369c.26 0 .47.21.47.47v.839h2.804a.47.47 0 01.463.386l.008.085c0 .26-.211.47-.471.47h-2.804V9.82l2.804.001a.47.47 0 01.463.386l.008.085c0 .26-.211.47-.471.47h-2.804v1.677h2.804a.47.47 0 01.463.387l.008.084c0 .26-.211.471-.471.471h-2.804v.839a.47.47 0 01-.385.463l-.085.008a.47.47 0 01-.47-.471l-.001-.839H8.143v.839a.47.47 0 01-.386.463l-.084.008a.47.47 0 01-.471-.471v-.839H4.869v.839a.47.47 0 01-.385.463l-.085.008a.47.47 0 01-.47-.471l-.001-.839H1.78a.47.47 0 01-.463-.386l-.008-.085c0-.26.211-.47.471-.47l2.148-.001v-1.677H1.78a.47.47 0 01-.463-.386l-.008-.084c0-.26.211-.471.471-.471l2.148-.001V8.143H1.78a.47.47 0 01-.463-.386l-.008-.084c0-.26.211-.471.471-.471h2.148v-.839a.47.47 0 01.386-.463l.085-.007c.26 0 .47.21.47.47v.839h2.333v-.839a.47.47 0 01.386-.463l.085-.007c.26 0 .47.21.47.47v.839h2.332v-.839a.47.47 0 01.387-.463zm-3.744 4.869H4.869v1.677h2.333v-1.677zm3.273 0H8.143v1.677h2.332v-1.677zM7.202 8.143H4.869V9.82h2.333V8.143zm3.273 0H8.143V9.82h2.332V8.143zM2.618 2.25H.941v2.333h14.117V2.251l-1.677-.001v.84c0 .26-.21.47-.47.47h-1.965a.47.47 0 01-.47-.47l-.001-.84H5.524v.84c0 .26-.21.47-.47.47H3.09a.47.47 0 01-.471-.47l-.001-.84zM4.583.941H3.56V2.62h1.023V.94zm7.857 0h-1.023V2.62h1.023V.94z" fillRule="evenodd" />
  </svg>
);

/* ── Plus circle SVG (Add Attachment) ── */
const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill={NAVY}>
    <path d="M9 16.7C13.3 16.7 16.7 13.3 16.7 9 16.7 4.7 13.3 1.3 9 1.3 4.7 1.3 1.3 4.7 1.3 9 1.3 13.3 4.7 16.7 9 16.7ZM9 18C4 18 0 14 0 9 0 4 4 0 9 0 14 0 18 4 18 9 18 14 14 18 9 18ZM9.8 8.2L12.2 8.2C12.6 8.2 13 8.6 13 9 13 9.4 12.6 9.8 12.2 9.8L9.8 9.8 9.8 12.2C9.8 12.6 9.4 13 9 13 8.6 13 8.2 12.6 8.2 12.2L8.2 9.8 5.8 9.8C5.4 9.8 5 9.4 5 9 5 8.6 5.4 8.2 5.8 8.2L8.2 8.2 8.2 5.8C8.2 5.4 8.6 5 9 5 9.4 5 9.8 5.4 9.8 5.8L9.8 8.2Z" />
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
          position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
          transform: 'translateX(-50%)', background: NAVY, color: '#fff',
          fontFamily: FONT, fontSize: 13, lineHeight: 1.5, borderRadius: 6,
          padding: '10px 14px', width: 220, boxShadow: '0 4px 16px rgba(4,34,56,0.22)',
          zIndex: 100, pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderTop: `7px solid ${NAVY}`,
          }} />
        </div>
      )}
    </div>
  );
};

/* ── Custom Calendar Picker ── */
const CalendarPicker = ({ value, onChange, onClose }) => {
  const today = new Date();

  const parseSelected = () => {
    if (!value) return null;
    const [dd, mm, yyyy] = value.split('/');
    if (dd && mm && yyyy && yyyy.length === 4) return new Date(+yyyy, +mm - 1, +dd);
    return null;
  };
  const sel = parseSelected();

  const [viewMonth, setViewMonth] = useState(sel ? sel.getMonth()    : today.getMonth());
  const [viewYear,  setViewYear]  = useState(sel ? sel.getFullYear() : today.getFullYear());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isToday    = d => d && d === today.getDate()     && viewMonth === today.getMonth()    && viewYear === today.getFullYear();
  const isSelected = d => d && sel && d === sel.getDate() && viewMonth === sel.getMonth()     && viewYear === sel.getFullYear();

  const pick = day => {
    if (!day) return;
    onChange(`${String(day).padStart(2,'0')}/${String(viewMonth+1).padStart(2,'0')}/${viewYear}`);
    onClose();
  };

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 300,
      background: '#fff', border: '1px solid #c8d0db', borderRadius: 6,
      padding: 16, minWidth: 268, boxShadow: '0 6px 24px rgba(4,34,56,0.14)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={selectWrap}>
            <select value={viewMonth} onChange={e => setViewMonth(+e.target.value)}
              style={{ ...selectStyle, padding: '5px 28px 5px 8px', fontSize: 13, width: 'auto' }}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            {chevronSvg}
          </div>
          <div style={selectWrap}>
            <select value={viewYear} onChange={e => setViewYear(+e.target.value)}
              style={{ ...selectStyle, padding: '5px 28px 5px 8px', fontSize: 13, width: 'auto' }}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {chevronSvg}
          </div>
        </div>
        <button type="button" onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8a9ab0', display: 'flex', alignItems: 'center', padding: 2,
        }}
          onMouseEnter={e => e.currentTarget.style.color = NAVY}
          onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: FONT, fontSize: 12,
            fontWeight: 600, color: '#8a9ab0', padding: '2px 0 6px',
          }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => (
          <div key={i} onClick={() => pick(day)} style={{
            textAlign: 'center', padding: '7px 2px',
            fontFamily: FONT, fontSize: 13,
            fontWeight: isToday(day) ? 700 : 400,
            color: isSelected(day) ? '#fff' : day ? NAVY : 'transparent',
            background: isSelected(day) ? NAVY : 'transparent',
            borderRadius: 4,
            cursor: day ? 'pointer' : 'default',
          }}
            onMouseEnter={e => { if (day && !isSelected(day)) e.currentTarget.style.background = '#f0f3f8'; }}
            onMouseLeave={e => { if (!isSelected(day)) e.currentTarget.style.background = 'transparent'; }}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main component ── */
const SetUpOneTimeCharge = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const leaseId   = location.state?.leaseId   || '';
  const leaseName = location.state?.leaseName || '';

  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [calOpen,     setCalOpen]     = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fileInputRef  = useRef(null);
  const calWrapRef    = useRef(null);

  /* Auto-slash as user types DD/MM/YYYY */
  const handleDueDateTyping = e => {
    const digits = e.target.value.replace(/\D/g, '');
    let val = digits;
    if (digits.length > 2) val = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) val = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4,8);
    setDueDate(val);
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachment = idx => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const [tenantId,   setTenantId]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

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
    if (!category) e.category = 'This value is required';
    if (!amount)   e.amount   = 'This value is required';
    if (!dueDate)  e.dueDate  = 'This value is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    if (!tenantId) { toast.error('No tenant found for this property'); return; }

    // Convert DD/MM/YYYY → YYYY-MM and YYYY-MM-DD
    const [dd, mm, yyyy] = (dueDate || '').split('/');
    if (!dd || !mm || !yyyy) { toast.error('Invalid due date'); return; }
    const monthStr   = `${yyyy}-${mm.padStart(2, '0')}`;
    const dueDateISO = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;

    setSubmitting(true);
    try {
      await axios.post(`${backendUrl}${API.charges}`, {
        tenantId,
        amount: parseFloat(amount),
        month: monthStr,
        dueDate: dueDateISO,
        notes: description || '',
      });
      toast.success('Charge created');
      navigate('/payments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create charge');
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
            borderRadius: 4, padding: 32, boxSizing: 'border-box',
          }}>
            <form onSubmit={handleSubmit}>

              <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 20px' }}>
                Set Up One-Time Charge
              </h2>

              {/* Charge Info header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY }}>
                  Charge Info
                </span>
                <Tooltip size={15} text="This is shown to your tenants so they can recognize the charge." />
              </div>

              {/* Category */}
              <div style={fieldWrap}>
                <label style={labelStyle}>Category</label>
                <div style={selectWrap}>
                  <select
                    value={category}
                    onChange={e => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }}
                    style={{ ...selectStyle, ...(errors.category ? { border: '1px solid #e53e3e' } : {}) }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value} disabled={c.value === ''}>{c.label}</option>
                    ))}
                  </select>
                  {chevronSvg}
                </div>
                {errors.category && (
                  <span style={{ fontFamily: FONT, fontSize: 12, color: '#e53e3e', marginTop: 4, display: 'block' }}>
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={fieldWrap}>
                <label style={labelStyle}>
                  Description{' '}
                  <span style={{ fontWeight: 400, color: '#8a9ab0' }}>(Optional)</span>
                </label>
                <input
                  type="text" maxLength={50}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={inputStyle}
                />
                <span style={{ fontFamily: FONT, fontSize: 12, color: NAVY, marginTop: 4, display: 'block' }}>
                  {description.length} / 50 characters used
                </span>
              </div>

              {/* Amount */}
              <div style={fieldWrap}>
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

              {/* Due Date */}
              <div style={fieldWrap}>
                <label style={labelStyle}>Due Date</label>
                <div ref={calWrapRef} style={{ position: 'relative' }}>
                  {/* Calendar icon button */}
                  <button
                    type="button"
                    onClick={() => setCalOpen(o => !o)}
                    style={{
                      position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <CalIcon />
                  </button>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dueDate}
                    onChange={e => { handleDueDateTyping(e); setErrors(prev => ({ ...prev, dueDate: '' })); }}
                    maxLength={10}
                    style={{ ...inputStyle, paddingLeft: 36, ...(errors.dueDate ? { border: '1px solid #e53e3e' } : {}) }}
                  />
                  {calOpen && (
                    <CalendarPicker
                      value={dueDate}
                      onChange={val => { setDueDate(val); setCalOpen(false); setErrors(prev => ({ ...prev, dueDate: '' })); }}
                      onClose={() => setCalOpen(false)}
                    />
                  )}
                </div>
                {errors.dueDate && (
                  <span style={{ fontFamily: FONT, fontSize: 12, color: '#e53e3e', marginTop: 4, display: 'block' }}>
                    {errors.dueDate}
                  </span>
                )}
              </div>

              {/* Add Attachment */}
              <div style={{ marginBottom: 24 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.png,.jpeg,.pdf,.zip,.xls,.xlsx,.txt,.csv,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY,
                    background: '#fff', border: '1px solid #c8d0db', borderRadius: 100,
                    padding: '8px 18px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <PlusCircleIcon />
                  Add Attachment
                </button>

                {/* Attached files list */}
                {attachments.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {attachments.map((f, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#f5f6f8', borderRadius: 4, padding: '6px 12px',
                        fontFamily: FONT, fontSize: 13, color: NAVY,
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(i)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#8a9ab0', display: 'flex', alignItems: 'center', padding: 2,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = NAVY}
                          onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

export default SetUpOneTimeCharge;
