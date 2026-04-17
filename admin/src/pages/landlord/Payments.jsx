import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { X, Search, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

/* ── Category metadata with icons ── */
const CATEGORIES = [
  { value: 'Rent',     bg: '#10b981', img: '/images/categories/rent.svg'     },
  { value: 'Damages',  bg: '#3b82f6', img: '/images/categories/damages.svg'  },
  { value: 'Deposit',  bg: '#6366f1', img: '/images/categories/deposit.svg'  },
  { value: 'Late Fee', bg: '#f43f5e', img: '/images/categories/late-fee.svg' },
];

const PAYMENT_CATS = CATEGORIES.map(c => c.value);

const getCat = (value) => CATEGORIES.find(c => c.value === value) || { value, bg: '#8a9ab0', icon: null };

/* ── Category badge (icon square + label) ── */
const CatBadge = ({ value }) => {
  const cat = getCat(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {cat.img
          ? <img src={cat.img} width={16} height={16} alt={value} style={{ display: 'block' }} />
          : null}
      </div>
      <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>{value || '—'}</span>
    </div>
  );
};

const EXPENSE_CATS = [
  "Accountant's Fees", 'Advertising', 'Agent Fees', 'Bank Fees',
  'Cleaning Fees', 'Ground Rents', 'HOA', 'Insurance', 'Interest',
  'Late Fees', 'Legal Fees', 'Maintenance and Repairs', 'Mortgage',
  'Other', 'Property Tax', 'Rates', 'Rent Arrears', 'Utilities', 'Water',
];

const thStyle = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: NAVY,
  fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
  whiteSpace: 'nowrap', borderBottom: '1px solid #e4e9f0',
};
const tdStyle = {
  padding: '12px 16px', fontFamily: FONT, fontSize: 13, color: NAVY,
  borderBottom: '1px solid #f0f2f5', verticalAlign: 'middle',
};

const fmt = (n) => `TZS ${Number(n || 0).toLocaleString()}`;

/* ── Empty state ── */
const EmptyState = ({ message = 'No data to show' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px', gap: 10, color: '#8a9ab0' }}>
    <svg style={{ width: 24, height: 24, fill: '#8a9ab0' }} viewBox="0 0 24 24">
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5m0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5M7 19h14v-2H7zm0-6h14v-2H7zm0-8v2h14V5z" />
    </svg>
    <span style={{ fontFamily: FONT, fontSize: 13 }}>{message}</span>
  </div>
);

/* ── Three-dot row menu ── */
const RowMenu = ({ onEdit, onDelete, deleteLabel = 'Delete' }) => {
  const [pos, setPos] = useState(null);
  const btnRef        = useRef();

  const open   = pos !== null;
  const toggle = () => {
    if (open) { setPos(null); return; }
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={btnRef}
        title="Actions"
        onClick={e => { e.stopPropagation(); toggle(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: '4px 6px', display: 'flex', alignItems: 'center', borderRadius: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#8a9ab0' }}>
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />
        </svg>
      </button>
      {open && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
            background: '#fff', border: '1px solid #e4e9f0', borderRadius: 8,
            boxShadow: '0 4px 20px rgba(4,34,56,0.14)', minWidth: 168, overflow: 'hidden',
          }}
        >
          {onEdit && (
            <>
              <button
                onClick={() => { setPos(null); onEdit(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Pencil size={15} color={TEAL} />
                Edit
              </button>
              <div style={{ height: 1, background: '#f0f2f5' }} />
            </>
          )}
          <button
            onClick={() => { setPos(null); onDelete(); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Trash2 size={15} color="#ef4444" />
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Attachment preview modal ── */
const AttachmentPreview = ({ name, onClose, fetchUrl }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}${fetchUrl}`)
      .then(r => {
        const rec = r.data.data;
        setDataUrl(rec.receiptImage || null);
      })
      .catch(() => setDataUrl(null))
      .finally(() => setLoading(false));
  }, []);

  const isImage = dataUrl && dataUrl.startsWith('data:image/');
  const isPdf   = dataUrl && dataUrl.startsWith('data:application/pdf');

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 780, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 48px rgba(0,0,0,0.28)', overflow: 'hidden', fontFamily: FONT }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e4e9f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#2563eb', flexShrink: 0 }}>
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {dataUrl && (
              <a href={dataUrl} download={name}
                style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#2563eb', textDecoration: 'none', padding: '5px 12px', border: '1px solid #bfdbfe', borderRadius: 4, background: '#eff6ff' }}>
                Download
              </a>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', minHeight: 200 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#8a9ab0' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #e4e9f0', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <span style={{ fontFamily: FONT, fontSize: 13 }}>Loading attachment…</span>
            </div>
          ) : !dataUrl ? (
            <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 40 }}>
              <span style={{ fontFamily: FONT, fontSize: 14 }}>Unable to load attachment.</span>
            </div>
          ) : isImage ? (
            <img src={dataUrl} alt={name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 4, padding: 16 }} />
          ) : isPdf ? (
            <iframe src={dataUrl} title={name} style={{ width: '100%', height: '75vh', border: 'none' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, color: NAVY, marginBottom: 16 }}>This file type cannot be previewed in the browser.</p>
              <a href={dataUrl} download={name}
                style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', padding: '9px 22px', borderRadius: 6, textDecoration: 'none' }}>
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Delete icon button ── */
const DelBtn = ({ onDelete }) => (
  <button
    onClick={onDelete}
    title="Delete"
    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px 6px', display: 'flex', alignItems: 'center', borderRadius: 4 }}
    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
  >
    <Trash2 size={15} />
  </button>
);

/* ── Status badge ── */
const StatusBadge = ({ status }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px', borderRadius: 100,
    fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
    background: status === 'paid' ? '#d1fae5' : '#fee2e2',
    color: status === 'paid' ? '#065f46' : '#991b1b',
  }}>
    {status === 'paid' ? 'Paid' : 'Unpaid'}
  </span>
);

/* ── Create / Edit Payment Modal ── */
const PaymentModal = ({ onClose, onSaved, payment = null }) => {
  // If editing, convert ISO date → dd/mm/yyyy for display
  const toDisplay = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  };

  const [form,    setForm]    = useState({
    date:     payment ? toDisplay(payment.date) : '',
    category: payment?.category || '',
    notes:    payment?.notes    || '',
    amount:   payment?.amount   != null ? String(payment.amount) : '',
  });
  // existingReceipt = base64 data URL from DB; receipt = newly chosen File
  const [existingReceipt,  setExistingReceipt]  = useState(payment?.receiptImage || null);
  const [existingName,     setExistingName]      = useState(payment?.receiptName  || null);
  const [receipt,          setReceipt]           = useState(null);
  const [saving,           setSaving]            = useState(false);
  const [loadingReceipt,   setLoadingReceipt]    = useState(false);
  const [confirmDelete,    setConfirmDelete]     = useState(false);
  const [deleting,         setDeleting]          = useState(false);
  const fileRef = useRef();
  const calRef  = useRef();

  const isEdit = !!payment;

  // Fetch the full payment (with base64 receipt) in the background — modal opens instantly
  useEffect(() => {
    if (!isEdit || !payment._id) return;
    setLoadingReceipt(true);
    axios.get(`${backendUrl}${API.orgPayment(payment._id)}`)
      .then(r => {
        const full = r.data.data;
        if (full.receiptImage) { setExistingReceipt(full.receiptImage); setExistingName(full.receiptName || 'receipt'); }
      })
      .catch(() => {})
      .finally(() => setLoadingReceipt(false));
  }, []);

  // Convert dd/mm/yyyy → ISO yyyy-mm-dd for the backend
  const parseDate = (str) => {
    const [d, m, y] = (str || '').split('/');
    if (!d || !m || !y || y.length !== 4) return null;
    const iso = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    return isNaN(Date.parse(iso)) ? null : iso;
  };

  const handleSave = async () => {
    const isoDate = parseDate(form.date);
    if (!isoDate) return toast.error('Enter a valid date (DD/MM/YYYY)');
    if (!form.amount) return toast.error('Amount is required');
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('date', isoDate);
      if (form.category) fd.append('category', form.category);
      if (form.notes)    fd.append('notes', form.notes);
      fd.append('amount', Number(form.amount));
      if (receipt) fd.append('receiptImage', receipt);
      // If user cleared the existing receipt and didn't upload a new one, tell backend to remove it
      if (isEdit && !existingReceipt && !receipt) fd.append('removeReceipt', 'true');
      if (isEdit) {
        await axios.put(`${backendUrl}${API.orgPayments}/${payment._id}`, fd);
        toast.success('Payment updated');
      } else {
        await axios.post(`${backendUrl}${API.orgPayments}`, fd);
        toast.success('Payment saved');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', fontFamily: FONT, fontSize: 14, color: NAVY, border: '1px solid #c8d0db', borderRadius: 4, padding: '9px 12px', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const labelStyle = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,34,56,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 540, boxShadow: '0 8px 40px rgba(4,34,56,0.18)', overflow: 'hidden', fontFamily: FONT }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onClose} aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 20, lineHeight: 1, color: '#6b7280', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true">×</span>
            </button>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>{isEdit ? 'Edit Payment' : 'Create Payment'}</h2>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, padding: '9px 22px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* Body card */}
        <div style={{ margin: '0 16px 16px', border: '1px solid #e4e9f0', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Payment Date + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Payment Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={form.date}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  onChange={e => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                    if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
                    setForm(p => ({ ...p, date: v }));
                  }}
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                {/* Hidden native date picker */}
                <input
                  ref={calRef}
                  type="date"
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, top: 0, right: 0 }}
                  onChange={e => {
                    const [y, m, d] = (e.target.value || '').split('-');
                    if (y && m && d) setForm(p => ({ ...p, date: `${d}/${m}/${y}` }));
                  }}
                />
                {/* Calendar icon */}
                <button
                  type="button"
                  onClick={() => calRef.current.showPicker?.() || calRef.current.click()}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#6b7280', display: 'flex', alignItems: 'center' }}
                >
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                <option value="" disabled />
                {PAYMENT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: FONT, fontSize: 14, color: '#6b7280' }}>TZS</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: 48 }} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Enter notes"
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Upload receipt */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,.pdf,.doc,.docx,.xls,.xlsx"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const allowed = ['image/jpeg','image/png','image/gif','image/webp','image/bmp',
                'application/pdf','application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
              if (!allowed.includes(file.type)) {
                toast.error('Only images and documents (PDF, Word, Excel) are allowed');
                e.target.value = '';
                return;
              }
              setReceipt(file);
              setExistingReceipt(null);
            }}
          />

          {/* Show existing or newly chosen file */}
          {loadingReceipt ? (
            <div style={{ border: '1px solid #e4e9f0', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#8a9ab0', fontFamily: FONT, fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: '2px solid #c8d0db', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Loading receipt…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (existingReceipt || receipt) ? (
            <div style={{ border: '1px solid #e4e9f0', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc' }}>
              {/* File icon */}
              <div style={{ flexShrink: 0, width: 36, height: 36, background: '#fee2e2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#dc2626' }}>
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h8v4h4zm-6-3c-1.1 0-2-.9-2-2V9.5c0-.28.22-.5.5-.5s.5.22.5.5V15h2V9.5C13 8.12 11.88 7 10.5 7S8 8.12 8 9.5V15c0 2.21 1.79 4 4 4s4-1.79 4-4v-4h-2v4c0 1.1-.9 2-2 2" />
                </svg>
              </div>
              {/* Filename — clickable link for existing saved files */}
              {receipt ? (
                <span style={{ fontFamily: FONT, fontSize: 12, color: '#2563eb', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {receipt.name}
                </span>
              ) : (
                <a
                  href={existingReceipt}
                  download={existingName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: FONT, fontSize: 12, color: '#2563eb', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                >
                  {existingName}
                </a>
              )}
              {/* X to remove */}
              <button
                type="button"
                onClick={() => { setReceipt(null); setExistingReceipt(null); }}
                style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              style={{ border: '2px dashed #93c5fd', borderRadius: 8, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#fff' }}>
              {/* Document + plus icon */}
              <div style={{ position: 'relative', width: 48, height: 56 }}>
                <svg viewBox="0 0 48 56" fill="none" style={{ width: 48, height: 56 }}>
                  <rect x="2" y="2" width="44" height="52" rx="5" fill="#dbeafe" />
                  <path d="M10 18h28M10 26h20" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }} fill="none">
                    <path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY }}>Upload receipt</span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: '#2563eb', textAlign: 'center' }}>Submit an image of the receipt and we'll do the rest.</span>
            </div>
          )}
        </div>

        {/* Delete button — edit mode only */}
        {isEdit && (
          <div style={{ padding: '0 24px 20px' }}>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#C71E11', padding: '6px 8px', borderRadius: 4, margin: '16px 0 0' }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 8px', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY }}>
              Confirmation
            </div>
            <div style={{ padding: '8px 24px 16px', fontFamily: FONT, fontSize: 15, color: NAVY }}>
              Are you sure you want to delete this payment?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 16px 16px' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#0ea5e9', background: 'none', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await axios.delete(`${backendUrl}${API.orgPayments}/${payment._id}`);
                    toast.success('Payment deleted');
                    onSaved();
                    onClose();
                  } catch { toast.error('Failed to delete'); setDeleting(false); setConfirmDelete(false); }
                }}
                style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: '#C71E11', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Add Expense Modal ── */
/* ── Shared helpers ── */
const iStyle = { width: '100%', fontFamily: FONT, fontSize: 14, color: NAVY, border: '1px solid #c8d0db', borderRadius: 4, padding: '9px 12px', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const lStyle = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 };

/* ── Yes / No radio group ── */
const YesNo = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {[true, false].map(v => (
      <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: NAVY,
        border: `1px solid ${value === v ? NAVY : '#c8d0db'}`, borderRadius: 4, padding: '6px 14px',
        background: value === v ? NAVY : '#fff', color: value === v ? '#fff' : NAVY, userSelect: 'none' }}>
        <input type="radio" checked={value === v} onChange={() => onChange(v)}
          style={{ accentColor: NAVY, width: 14, height: 14 }} />
        {v ? 'Yes' : 'No'}
      </label>
    ))}
  </div>
);

/* ── Date text input with calendar picker ── */
const DateInput = ({ value, onChange }) => {
  const calRef = useRef();
  return (
    <div style={{ position: 'relative' }}>
      <input type="text" value={value} placeholder="DD/MM/YYYY" maxLength={10}
        onChange={e => {
          let v = e.target.value.replace(/[^\d]/g, '');
          if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
          if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
          onChange(v);
        }}
        style={{ ...iStyle, paddingRight: 36 }} />
      <input ref={calRef} type="date" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, top: 0, right: 0 }}
        onChange={e => { const [y,m,d] = (e.target.value||'').split('-'); if(y&&m&&d) onChange(`${d}/${m}/${y}`); }} />
      <button type="button" onClick={() => calRef.current.showPicker?.() || calRef.current.click()}
        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
        </svg>
      </button>
    </div>
  );
};

/* ── Profession options for Add Supplier ── */
const PROFESSIONS = [
  { value: 'bathroom',        label: 'Bathroom Fitter' },
  { value: 'metalworker',     label: 'Blacksmith / Metal Worker' },
  { value: 'bricklayer',      label: 'Bricklayer' },
  { value: 'builder',         label: 'Builder' },
  { value: 'carpenter',       label: 'Carpenter / Joiner' },
  { value: 'network',         label: 'CCTV / Satellites / Alarms' },
  { value: 'cleaner',         label: 'Cleaner' },
  { value: 'drainage',        label: 'Drainage Specialist' },
  { value: 'driveway',        label: 'Driveway Pavers' },
  { value: 'electrician',     label: 'Electrician' },
  { value: 'flooring',        label: 'Floor Fitters' },
  { value: 'gardener',        label: 'Gardener / Landscape Gardeners' },
  { value: 'heating',         label: 'Gas / Heating Engineer' },
  { value: 'handyman',        label: 'Handyman' },
  { value: 'hvac',            label: 'HVAC' },
  { value: 'kitchen',         label: 'Kitchen Specialist' },
  { value: 'lawyer',          label: 'Lawyer' },
  { value: 'locksmiths',      label: 'Locksmith' },
  { value: 'loft',            label: 'Loft Conversion Specialist' },
  { value: 'other',           label: 'Other' },
  { value: 'decorator',       label: 'Painter and Decorator' },
  { value: 'pest',            label: 'Pest Control' },
  { value: 'plasterer',       label: 'Plasterer / Renderer' },
  { value: 'plumber',         label: 'Plumber' },
  { value: 'propertymanager', label: 'Property Manager' },
  { value: 'removal',         label: 'Removal' },
  { value: 'roofer',          label: 'Roofer' },
  { value: 'security',        label: 'Security Systems / Alarms' },
  { value: 'specialist',      label: 'Specialist Tradesman' },
  { value: 'stoneworker',     label: 'Stoneworker / Stonemason' },
  { value: 'pool',            label: 'Swimming Pool Specialist' },
  { value: 'tiler',           label: 'Tiler' },
  { value: 'craftsman',       label: 'Traditional Craftsman' },
  { value: 'tree',            label: 'Tree Surgeon' },
  { value: 'windows',         label: 'Window Fitter / Conservatory Installer' },
];

/* ── Add Supplier sub-modal ── */
const AddSupplierModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', profession: 'bathroom', email: '', phone: '', mobile: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      setSaving(true);
      const res = await axios.post(`${backendUrl}${API.suppliers}`, form);
      toast.success('Supplier added');
      onSaved(res.data.data);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save supplier');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(4,34,56,0.22)', fontFamily: FONT, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ position: 'relative', padding: '18px 24px', borderBottom: '1px solid #e4e9f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY }}>Add Supplier</h3>
          <button onClick={onClose} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lStyle}>Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" value={form.name} placeholder="Enter name"
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={iStyle} />
          </div>
          <div>
            <label style={lStyle}>Profession <span style={{ color: '#ef4444' }}>*</span></label>
            <select value={form.profession} onChange={e => setForm(p => ({ ...p, profession: e.target.value }))} style={iStyle}>
              {PROFESSIONS.map(pr => <option key={pr.value} value={pr.value}>{pr.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lStyle}>Email Address</label>
            <input type="email" value={form.email} placeholder="Enter email"
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={iStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lStyle}>Phone Number</label>
              <input type="text" value={form.phone} placeholder="Enter phone"
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={iStyle} />
            </div>
            <div>
              <label style={lStyle}>Mobile Number</label>
              <input type="text" value={form.mobile} placeholder="Enter mobile"
                onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} style={iStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, padding: '9px 24px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Add Expense Modal ── */
const ExpenseModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    dueDate: '', amount: '', category: "Accountant's Fees",
    description: '', status: 'unpaid', paymentDate: '',
    payableByTenant: false, capitalExpense: false, notes: '',
    supplier: '',
  });
  const [receipt,           setReceipt]           = useState(null);
  const [saving,            setSaving]             = useState(false);
  const [suppliers,         setSuppliers]          = useState([]);
  const [addSupplierOpen,   setAddSupplierOpen]    = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    axios.get(`${backendUrl}${API.suppliers}`)
      .then(r => setSuppliers(r.data.data || []))
      .catch(() => {});
  }, []);

  const parseDate = (str) => {
    const [d, m, y] = (str || '').split('/');
    if (!d || !m || !y || y.length !== 4) return null;
    const iso = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    return isNaN(Date.parse(iso)) ? null : iso;
  };

  const handleSave = async () => {
    const isoDue = parseDate(form.dueDate);
    if (!isoDue) return toast.error('Enter a valid due date (DD/MM/YYYY)');
    if (!form.amount) return toast.error('Amount is required');
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('dueDate', isoDue);
      fd.append('amount', Number(form.amount));
      fd.append('category', form.category);
      if (form.description) fd.append('description', form.description);
      fd.append('status', form.status);
      if (form.paymentDate) { const iso = parseDate(form.paymentDate); if (iso) fd.append('paymentDate', iso); }
      fd.append('payableByTenant', form.payableByTenant);
      fd.append('capitalExpense', form.capitalExpense);
      if (form.notes) fd.append('notes', form.notes);
      if (form.supplier) fd.append('supplier', form.supplier);
      if (receipt) fd.append('receiptImage', receipt);
      await axios.post(`${backendUrl}${API.expenses}`, fd);
      toast.success('Expense added');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const ALLOWED = ['image/jpeg','image/png','image/gif','image/webp','image/bmp',
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,34,56,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 560, boxShadow: '0 8px 40px rgba(4,34,56,0.18)', fontFamily: FONT, margin: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onClose} aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 20, lineHeight: 1, color: '#6b7280', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true">×</span>
            </button>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>Add New Expense</h2>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, padding: '9px 22px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* Body card */}
        <div style={{ margin: '0 16px 20px', border: '1px solid #e4e9f0', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Add Receipt Image */}
          <div>
            <label style={lStyle}>Add Receipt Image</label>
            <input ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,.pdf,.doc,.docx,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                if (!ALLOWED.includes(f.type)) { toast.error('Only images and documents are allowed'); e.target.value = ''; return; }
                setReceipt(f);
              }} />
            {receipt ? (
              <div style={{ border: '1px solid #e4e9f0', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc' }}>
                <div style={{ width: 32, height: 32, background: '#fee2e2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#dc2626' }}>
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h8v4h4z" />
                  </svg>
                </div>
                <span style={{ flex: 1, fontSize: 12, color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.name}</span>
                <button type="button" onClick={() => setReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 2 }}><X size={15} /></button>
              </div>
            ) : (
              <div onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed #93c5fd', borderRadius: 8, padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#fff' }}>
                <div style={{ position: 'relative', width: 42, height: 50 }}>
                  <svg viewBox="0 0 48 56" fill="none" style={{ width: 42, height: 50 }}>
                    <rect x="2" y="2" width="44" height="52" rx="5" fill="#dbeafe" />
                    <path d="M10 18h28M10 26h20" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 12 12" style={{ width: 9, height: 9 }} fill="none">
                      <path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY }}>Upload receipt</span>
                <span style={{ fontFamily: FONT, fontSize: 12, color: '#2563eb', textAlign: 'center' }}>Submit an image of the receipt and we'll do the rest.</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label style={lStyle}>Due Date</label>
            <DateInput value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} />
          </div>

          {/* Total Amount */}
          <div>
            <label style={lStyle}>Total Amount (TZS)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: FONT, fontSize: 14, color: '#6b7280' }}>TZS</span>
              <input type="number" min="0" step="0.01" value={form.amount} placeholder="0.00"
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                style={{ ...iStyle, paddingLeft: 48 }} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={lStyle}>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={iStyle}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label style={lStyle}>Supplier</label>
            <select value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} style={iStyle}>
              <option value=""></option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button type="button" onClick={() => setAddSupplierOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, color: '#2563eb', fontWeight: 600, padding: '2px 0' }}>
                Add Supplier
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lStyle}>Description</label>
            <input type="text" value={form.description} placeholder="Enter description"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={iStyle} />
          </div>

          {/* Paid? + Payment Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lStyle}>Paid?</label>
              <YesNo value={form.status === 'paid'} onChange={v => setForm(p => ({ ...p, status: v ? 'paid' : 'unpaid' }))} />
            </div>
            <div>
              <label style={lStyle}>Payment Date</label>
              <DateInput value={form.paymentDate} onChange={v => setForm(p => ({ ...p, paymentDate: v }))} />
            </div>
          </div>

          {/* Payable by Tenant? + Capital Expense? */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lStyle}>Payable by Tenant?</label>
              <YesNo value={form.payableByTenant} onChange={v => setForm(p => ({ ...p, payableByTenant: v }))} />
            </div>
            <div>
              <label style={lStyle}>Capital Expense?</label>
              <YesNo value={form.capitalExpense} onChange={v => setForm(p => ({ ...p, capitalExpense: v }))} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lStyle}>Notes</label>
            <textarea rows={3} value={form.notes} placeholder="Enter notes"
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              style={{ ...iStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Add Supplier sub-modal */}
      {addSupplierOpen && (
        <AddSupplierModal
          onClose={() => setAddSupplierOpen(false)}
          onSaved={(newSupplier) => {
            setSuppliers(prev => [...prev, newSupplier]);
            setForm(p => ({ ...p, supplier: newSupplier._id }));
          }}
        />
      )}
    </div>
  );
};

/* ── Move To Modal ── */
const MoveToModal = ({ selectedIds, onClose, onSaved }) => {
  const [houses,  setHouses]  = useState([]);
  const [houseId, setHouseId] = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}${API.houses}`)
      .then(r => setHouses(r.data.data || r.data.houses || []))
      .catch(() => {});
  }, []);

  const handleMove = async () => {
    if (!houseId) return toast.error('Please select a property');
    try {
      setSaving(true);
      await Promise.all(selectedIds.map(id =>
        axios.put(`${backendUrl}${API.expenses}/${id}`, { house: houseId })
      ));
      toast.success(`Moved ${selectedIds.length} expense(s)`);
      onSaved();
    } catch {
      toast.error('Failed to move expenses');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(4,34,56,0.22)', fontFamily: FONT, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e4e9f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#6366f1', flexShrink: 0 }}>
              <path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99zM21 9l-3.99-4v3H10v2h7.01v3z" />
            </svg>
            <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NAVY }}>
              Move to Property
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: '#6b7280' }}>
            Moving <strong style={{ color: NAVY }}>{selectedIds.length}</strong> selected expense{selectedIds.length !== 1 ? 's' : ''} to:
          </p>
          <div>
            <label style={lStyle}>Property</label>
            <select value={houseId} onChange={e => setHouseId(e.target.value)} style={iStyle}>
              <option value="">— Select a property —</option>
              {houses.map(h => (
                <option key={h._id} value={h._id}>{h.name || h.address || h._id}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button onClick={onClose}
              style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#6b7280', background: 'none', border: '1px solid #c8d0db', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleMove} disabled={saving}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#6366f1', border: 'none', borderRadius: 6, padding: '9px 22px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Moving…' : 'Move'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Expense Modal ── */
const EditExpenseModal = ({ expense: init, onClose, onSaved }) => {
  const toDisplay = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  };

  const [form, setForm] = useState({
    dueDate:         toDisplay(init.dueDate),
    amount:          init.amount != null ? String(init.amount) : '',
    category:        init.category || "Accountant's Fees",
    description:     init.description || '',
    status:          init.status || 'unpaid',
    paymentDate:     toDisplay(init.paymentDate),
    payableByTenant: !!init.payableByTenant,
    capitalExpense:  !!init.capitalExpense,
    notes:           init.notes || '',
    supplier:        init.supplier || '',
  });
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [existingName,    setExistingName]    = useState(init.receiptName || null);
  const [receipt,         setReceipt]         = useState(null);
  const [loadingReceipt,  setLoadingReceipt]  = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [suppliers,       setSuppliers]       = useState([]);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const fileRef = useRef();

  const ALLOWED = ['image/jpeg','image/png','image/gif','image/webp','image/bmp',
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  useEffect(() => {
    axios.get(`${backendUrl}${API.suppliers}`)
      .then(r => setSuppliers(r.data.data || [])).catch(() => {});
    if (init.receiptName) {
      setLoadingReceipt(true);
      axios.get(`${backendUrl}${API.expense(init._id)}`)
        .then(r => {
          const full = r.data.data;
          if (full.receiptImage) { setExistingReceipt(full.receiptImage); setExistingName(full.receiptName || 'receipt'); }
        }).catch(() => {}).finally(() => setLoadingReceipt(false));
    }
  }, []);

  const parseDate = (str) => {
    const [d, m, y] = (str || '').split('/');
    if (!d || !m || !y || y.length !== 4) return null;
    const iso = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    return isNaN(Date.parse(iso)) ? null : iso;
  };

  const handleSave = async () => {
    const isoDue = parseDate(form.dueDate);
    if (!isoDue) return toast.error('Enter a valid due date (DD/MM/YYYY)');
    if (!form.amount) return toast.error('Amount is required');
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('dueDate', isoDue);
      fd.append('amount', Number(form.amount));
      fd.append('category', form.category);
      if (form.description) fd.append('description', form.description);
      fd.append('status', form.status);
      if (form.paymentDate) { const iso = parseDate(form.paymentDate); if (iso) fd.append('paymentDate', iso); }
      fd.append('payableByTenant', form.payableByTenant);
      fd.append('capitalExpense', form.capitalExpense);
      if (form.notes) fd.append('notes', form.notes);
      if (form.supplier) fd.append('supplier', form.supplier);
      if (receipt) fd.append('receiptImage', receipt);
      if (!existingReceipt && !receipt && init.receiptName) fd.append('removeReceipt', 'true');
      await axios.put(`${backendUrl}${API.expenses}/${init._id}`, fd);
      toast.success('Expense updated');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,34,56,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 560, boxShadow: '0 8px 40px rgba(4,34,56,0.18)', fontFamily: FONT, margin: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 20, lineHeight: 1, color: '#6b7280', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true">×</span>
            </button>
            <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>Edit Expense</h2>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, padding: '9px 22px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* Body card */}
        <div style={{ margin: '0 16px 8px', border: '1px solid #e4e9f0', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Receipt */}
          <div>
            <label style={lStyle}>{existingReceipt || receipt ? 'Receipt Image' : 'Add Receipt Image'}</label>
            <input ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,.pdf,.doc,.docx,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0]; if (!f) return;
                if (!ALLOWED.includes(f.type)) { toast.error('Only images and documents are allowed'); e.target.value = ''; return; }
                setReceipt(f); setExistingReceipt(null);
              }} />
            {loadingReceipt ? (
              <div style={{ border: '1px solid #e4e9f0', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#8a9ab0', fontSize: 13 }}>
                <div style={{ width: 16, height: 16, border: '2px solid #c8d0db', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Loading receipt…
              </div>
            ) : (existingReceipt || receipt) ? (
              <div style={{ border: '1px solid #e4e9f0', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc' }}>
                <div style={{ width: 32, height: 32, background: '#fee2e2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#dc2626' }}><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h8v4h4z" /></svg>
                </div>
                {receipt ? (
                  <span style={{ flex: 1, fontSize: 12, color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.name}</span>
                ) : (
                  <a href={existingReceipt} download={existingName} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, fontSize: 12, color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>{existingName}</a>
                )}
                <button type="button" onClick={() => { setReceipt(null); setExistingReceipt(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 2 }}><X size={15} /></button>
              </div>
            ) : (
              <div onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed #93c5fd', borderRadius: 8, padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#fff' }}>
                <div style={{ position: 'relative', width: 42, height: 50 }}>
                  <svg viewBox="0 0 48 56" fill="none" style={{ width: 42, height: 50 }}>
                    <rect x="2" y="2" width="44" height="52" rx="5" fill="#dbeafe" />
                    <path d="M10 18h28M10 26h20" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 12 12" style={{ width: 9, height: 9 }} fill="none"><path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Upload receipt</span>
                <span style={{ fontSize: 12, color: '#2563eb' }}>Submit an image of the receipt and we'll do the rest.</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div><label style={lStyle}>Due Date</label><DateInput value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} /></div>

          {/* Total Amount */}
          <div>
            <label style={lStyle}>Total Amount (TZS)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#6b7280' }}>TZS</span>
              <input type="number" min="0" step="0.01" value={form.amount} placeholder="0.00"
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ ...iStyle, paddingLeft: 48 }} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={lStyle}>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={iStyle}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label style={lStyle}>Supplier</label>
            <select value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} style={iStyle}>
              <option value=""></option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button type="button" onClick={() => setAddSupplierOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, color: '#2563eb', fontWeight: 600, padding: '2px 0' }}>
                Add Supplier
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lStyle}>Description</label>
            <input type="text" value={form.description} placeholder="Enter description"
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={iStyle} />
          </div>

          {/* Paid? + Payment Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={lStyle}>Paid?</label><YesNo value={form.status === 'paid'} onChange={v => setForm(p => ({ ...p, status: v ? 'paid' : 'unpaid' }))} /></div>
            <div><label style={lStyle}>Payment Date</label><DateInput value={form.paymentDate} onChange={v => setForm(p => ({ ...p, paymentDate: v }))} /></div>
          </div>

          {/* Payable by Tenant? + Capital Expense? */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={lStyle}>Payable by Tenant?</label><YesNo value={form.payableByTenant} onChange={v => setForm(p => ({ ...p, payableByTenant: v }))} /></div>
            <div><label style={lStyle}>Capital Expense?</label><YesNo value={form.capitalExpense} onChange={v => setForm(p => ({ ...p, capitalExpense: v }))} /></div>
          </div>

          {/* Notes */}
          <div>
            <label style={lStyle}>Notes</label>
            <textarea rows={3} value={form.notes} placeholder="Enter notes"
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ ...iStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Delete button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px 20px' }}>
          <button type="button" onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#C71E11', padding: '6px 0' }}>
            Delete
          </button>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 8px', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY }}>Confirmation</div>
            <div style={{ padding: '8px 24px 16px', fontFamily: FONT, fontSize: 15, color: NAVY }}>Are you sure you want to delete this expense?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 16px 16px' }}>
              <button onClick={() => setConfirmDelete(false)}
                style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#0ea5e9', background: 'none', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button disabled={deleting} onClick={async () => {
                try {
                  setDeleting(true);
                  await axios.delete(`${backendUrl}${API.expenses}/${init._id}`);
                  toast.success('Expense deleted'); onSaved(); onClose();
                } catch { toast.error('Failed to delete'); setDeleting(false); setConfirmDelete(false); }
              }}
                style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: '#C71E11', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Yes, delete expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addSupplierOpen && (
        <AddSupplierModal
          onClose={() => setAddSupplierOpen(false)}
          onSaved={s => { setSuppliers(prev => [...prev, s]); setForm(p => ({ ...p, supplier: s._id })); }}
        />
      )}
    </div>
  );
};

/* ── Main Payments Page ── */
const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState(searchParams.get('view') || 'payments');

  /* Payments state */
  const [orgPayments,   setOrgPayments]   = useState([]);
  const [orgPaySearch,  setOrgPaySearch]  = useState('');
  const [payModalOpen,  setPayModalOpen]  = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  /* Expenses state */
  const [expenses,       setExpenses]       = useState([]);
  const [expSearch,      setExpSearch]      = useState('');
  const [expModalOpen,   setExpModalOpen]   = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExp,    setSelectedExp]    = useState(new Set());
  const [actionsOpen,    setActionsOpen]    = useState(false);
  const [actionsPos,     setActionsPos]     = useState(null);
  const [moveToOpen,     setMoveToOpen]     = useState(false);
  const actionsRef    = useRef();
  const actionsBtnRef = useRef();

  // preview: { name, fetchUrl }
  const [preview, setPreview] = useState(null);

  const setTab = (t) => { setTabState(t); setSearchParams({ view: t }); };

  useEffect(() => {
    if (!actionsOpen) return;
    const close = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
        setActionsPos(null);
      }
    };
    const reset = () => { setActionsOpen(false); setActionsPos(null); };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', reset, true);
    window.addEventListener('resize', reset);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', reset, true);
      window.removeEventListener('resize', reset);
    };
  }, [actionsOpen]);

  const fetchOrgPayments = () => {
    axios.get(`${backendUrl}${API.orgPayments}`)
      .then(r => setOrgPayments(r.data.data || []))
      .catch(() => {});
  };

  const fetchExpenses = () => {
    axios.get(`${backendUrl}${API.expenses}`)
      .then(r => setExpenses(r.data.data || []))
      .catch(() => {});
  };

  useEffect(() => { fetchOrgPayments(); fetchExpenses(); }, []);

  const filteredPayments = orgPayments.filter(p => {
    if (!orgPaySearch) return true;
    const q = orgPaySearch.toLowerCase();
    return (p.category || '').toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q);
  });

  const filteredExpenses = expenses.filter(e => {
    if (!expSearch) return true;
    const q = expSearch.toLowerCase();
    return (e.category || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q);
  });

  return (
    <Layout>
      <div style={{ fontFamily: FONT, fontSize: 14, color: NAVY, minHeight: '100vh', background: '#f5f6f8', paddingBottom: 50 }}>

        {/* Page header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e4e9f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ paddingTop: 24, paddingBottom: 0 }}>
              <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>Payments</h1>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex' }}>
              {[{ key: 'payments', label: 'Payments' }, { key: 'expenses', label: 'Expenses' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    color: tab === t.key ? TEAL : '#8a9ab0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px 12px',
                    borderBottom: tab === t.key ? `3px solid ${TEAL}` : '3px solid transparent',
                    marginBottom: -1, lineHeight: 1,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = NAVY; }}
                  onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#8a9ab0'; }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px', boxSizing: 'border-box' }}>

          {/* ── PAYMENTS tab ── */}
          {tab === 'payments' && (
            <div style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6, boxShadow: '0 1px 4px rgba(4,34,56,0.06)', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f2f5', gap: 12 }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab0', pointerEvents: 'none' }} />
                  <input value={orgPaySearch} onChange={e => setOrgPaySearch(e.target.value)} placeholder="Search"
                    style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: NAVY, border: '1px solid #c8d0db', borderRadius: 4, padding: '7px 10px 7px 30px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button onClick={() => setPayModalOpen(true)}
                  style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: TEAL, border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
                  + New
                </button>
              </div>
              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f6f8' }}>
                    {['Date', 'Category', 'Notes', '', 'Amount', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}><EmptyState /></td>
                    </tr>
                  ) : filteredPayments.map(p => (
                    <tr key={p._id}
                      onClick={() => { setEditingPayment(p); setPayModalOpen(true); }}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={tdStyle}><CatBadge value={p.category} /></td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>{p.notes || '—'}</td>
                      <td onClick={e => e.stopPropagation()} style={{ ...tdStyle, textAlign: 'center', padding: '4px 8px', width: 36 }}>
                        {p.receiptName && (
                          <button
                            onClick={() => setPreview({ name: p.receiptName, fetchUrl: API.orgPayment(p._id) })}
                            title={p.receiptName}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#2563eb' }}>
                              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h8v4h4zm-6-3c-1.1 0-2-.9-2-2V9.5c0-.28.22-.5.5-.5s.5.22.5.5V15h2V9.5C13 8.12 11.88 7 10.5 7S8 8.12 8 9.5V15c0 2.21 1.79 4 4 4s4-1.79 4-4v-4h-2v4c0 1.1-.9 2-2 2" />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(p.amount)}</td>
                      <td onClick={e => e.stopPropagation()} style={{ ...tdStyle, textAlign: 'right', padding: '4px 8px' }}>
                        <RowMenu
                          onEdit={() => { setEditingPayment(p); setPayModalOpen(true); }}
                          onDelete={async () => {
                            if (!window.confirm('Delete this payment?')) return;
                            try { await axios.delete(`${backendUrl}${API.orgPayments}/${p._id}`); fetchOrgPayments(); toast.success('Deleted'); }
                            catch { toast.error('Failed to delete'); }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── EXPENSES tab ── */}
          {tab === 'expenses' && (() => {
            const allIds = filteredExpenses.map(e => e._id);
            const allChecked = allIds.length > 0 && allIds.every(id => selectedExp.has(id));
            const someChecked = selectedExp.size > 0;
            const toggleAll = () => {
              if (allChecked) setSelectedExp(new Set());
              else setSelectedExp(new Set(allIds));
            };
            const toggleOne = (id) => {
              const next = new Set(selectedExp);
              next.has(id) ? next.delete(id) : next.add(id);
              setSelectedExp(next);
            };
            const bulkStatus = async (status) => {
              try {
                await Promise.all([...selectedExp].map(id => axios.put(`${backendUrl}${API.expenses}/${id}`, { status })));
                toast.success(`Marked as ${status}`); setSelectedExp(new Set()); fetchExpenses();
              } catch { toast.error('Failed to update'); }
            };
            const bulkDelete = async () => {
              if (!window.confirm(`Delete ${selectedExp.size} expense(s)?`)) return;
              try {
                await Promise.all([...selectedExp].map(id => axios.delete(`${backendUrl}${API.expenses}/${id}`)));
                toast.success('Deleted'); setSelectedExp(new Set()); fetchExpenses();
              } catch { toast.error('Failed to delete'); }
            };
            const chkStyle = { width: 15, height: 15, cursor: 'pointer', accentColor: TEAL };
            return (
              <div style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6, boxShadow: '0 1px 4px rgba(4,34,56,0.06)', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f2f5', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative', width: 200 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a9ab0', pointerEvents: 'none' }} />
                      <input value={expSearch} onChange={e => setExpSearch(e.target.value)} placeholder="Search"
                        style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: NAVY, border: '1px solid #c8d0db', borderRadius: 4, padding: '7px 10px 7px 30px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Actions button — visible only when rows are selected */}
                    {someChecked && (
                      <div ref={actionsRef} style={{ position: 'relative' }}>
                        <button
                          ref={actionsBtnRef}
                          onClick={() => {
                            if (actionsOpen) { setActionsOpen(false); setActionsPos(null); return; }
                            const r = actionsBtnRef.current.getBoundingClientRect();
                            setActionsPos({ top: r.bottom + 4, left: r.left });
                            setActionsOpen(true);
                          }}
                          style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY, background: '#fff', border: '1px solid #c8d0db', borderRadius: 4, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Actions
                          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: NAVY }}><path d="m7 10 5 5 5-5z" /></svg>
                        </button>
                        {actionsOpen && actionsPos && (
                          <div onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', top: actionsPos.top, left: actionsPos.left, background: '#fff', border: '1px solid #e4e9f0', borderRadius: 8, boxShadow: '0 4px 20px rgba(4,34,56,0.14)', minWidth: 200, zIndex: 9999, overflow: 'hidden' }}>
                            {/* Mark as paid */}
                            <button onClick={() => { setActionsOpen(false); bulkStatus('paid'); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: NAVY }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#10b981', flexShrink: 0 }}><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-7.53 12L9 10.5l1.4-1.41 2.07 2.08L17.6 6 19 7.41zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4z" /></svg>
                              Mark as paid
                            </button>
                            {/* Mark as unpaid */}
                            <button onClick={() => { setActionsOpen(false); bulkStatus('unpaid'); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: NAVY }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#8a9ab0', flexShrink: 0 }}><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2m0 16H7V3h14z" /></svg>
                              Mark as unpaid
                            </button>
                            {/* Move to */}
                            <button onClick={() => { setActionsOpen(false); setMoveToOpen(true); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: NAVY }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#6366f1', flexShrink: 0 }}><path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99zM21 9l-3.99-4v3H10v2h7.01v3z" /></svg>
                              Move to
                            </button>
                            <div style={{ height: 1, background: '#f0f2f5', margin: '4px 0' }} />
                            {/* Delete */}
                            <button onClick={() => { setActionsOpen(false); bulkDelete(); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: '#ef4444' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#ef4444', flexShrink: 0 }}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z" /></svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <button onClick={() => setExpModalOpen(true)}
                      style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: TEAL, border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
                      + New
                    </button>
                  </div>
                </div>
                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f6f8' }}>
                      <th style={{ ...thStyle, width: 40, textAlign: 'center' }}>
                        <input type="checkbox" checked={allChecked} onChange={toggleAll} style={chkStyle} />
                      </th>
                      {['Date', 'Category', 'Description', '', 'Status', 'Amount', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState /></td></tr>
                    ) : filteredExpenses.map(e => (
                      <tr key={e._id}
                        onClick={() => setEditingExpense(e)}
                        style={{ background: selectedExp.has(e._id) ? '#f0f9ff' : 'transparent', cursor: 'pointer' }}
                        onMouseEnter={ev => { if (!selectedExp.has(e._id)) ev.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={ev => { ev.currentTarget.style.background = selectedExp.has(e._id) ? '#f0f9ff' : 'transparent'; }}
                      >
                        <td onClick={ev => ev.stopPropagation()} style={{ ...tdStyle, textAlign: 'center', padding: '4px 8px', width: 40 }}>
                          <input type="checkbox" checked={selectedExp.has(e._id)} onChange={() => toggleOne(e._id)} style={chkStyle} />
                        </td>
                        <td style={tdStyle}>{new Date(e.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={tdStyle}>{e.category}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{e.description || '—'}</td>
                        <td onClick={ev => ev.stopPropagation()} style={{ ...tdStyle, textAlign: 'center', padding: '4px 8px', width: 36 }}>
                          {e.receiptName && (
                            <button onClick={() => setPreview({ name: e.receiptName, fetchUrl: API.expense(e._id) })} title={e.receiptName}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
                              onMouseEnter={ev2 => ev2.currentTarget.style.background = '#eff6ff'}
                              onMouseLeave={ev2 => ev2.currentTarget.style.background = 'none'}>
                              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#2563eb' }}>
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h8v4h4zm-6-3c-1.1 0-2-.9-2-2V9.5c0-.28.22-.5.5-.5s.5.22.5.5V15h2V9.5C13 8.12 11.88 7 10.5 7S8 8.12 8 9.5V15c0 2.21 1.79 4 4 4s4-1.79 4-4v-4h-2v4c0 1.1-.9 2-2 2" />
                              </svg>
                            </button>
                          )}
                        </td>
                        <td style={tdStyle}><StatusBadge status={e.status} /></td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(e.amount)}</td>
                        <td onClick={ev => ev.stopPropagation()} style={{ ...tdStyle, textAlign: 'right', padding: '4px 8px' }}>
                          <RowMenu
                            onEdit={() => setEditingExpense(e)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {payModalOpen && (
        <PaymentModal
          payment={editingPayment}
          onClose={() => { setPayModalOpen(false); setEditingPayment(null); }}
          onSaved={fetchOrgPayments}
        />
      )}
      {expModalOpen && <ExpenseModal onClose={() => setExpModalOpen(false)} onSaved={fetchExpenses} />}
      {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={() => { fetchExpenses(); setSelectedExp(new Set()); }} />}
      {moveToOpen && (
        <MoveToModal
          selectedIds={[...selectedExp]}
          onClose={() => setMoveToOpen(false)}
          onSaved={() => { fetchExpenses(); setSelectedExp(new Set()); setMoveToOpen(false); }}
        />
      )}

      {preview && (
        <AttachmentPreview
          name={preview.name}
          fetchUrl={preview.fetchUrl}
          onClose={() => setPreview(null)}
        />
      )}
    </Layout>
  );
};

export default Payments;
