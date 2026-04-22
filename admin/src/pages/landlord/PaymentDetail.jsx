import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const BLUE = '#033A6D';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

const STATUS_OPTIONS = [
  { value: 'paid',    label: 'Paid'    },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const STATUS_PILL = {
  paid:    { bg: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' },
  overdue: { bg: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' },
  pending: { bg: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
};

const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const toInputDate = d => d ? new Date(d).toISOString().slice(0, 10) : '';
const fmt = n => `TZS ${Number(n || 0).toLocaleString()}`;

const cardStyle = {
  background: '#fff', borderRadius: 8,
  border: '1px solid #dde3ec', padding: '20px 24px',
  marginBottom: 14, boxShadow: '0 1px 4px rgba(4,34,56,0.07)',
};

const labelStyle = {
  display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
  color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '8px 10px', fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1px solid #dde3ec', borderRadius: 6, outline: 'none', background: '#fff',
};

const PaymentDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [record,  setRecord]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState({ open: false });
  const closeConfirm = () => setConfirm({ open: false });

  /* draft state for the edit form */
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    axios
      .get(`${backendUrl}${API.payments}/${id}`)
      .then(r => setRecord(r.data.data))
      .catch(() => navigate('/payments'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const openEdit = () => {
    setDraft({
      amount:   String(record.amount ?? ''),
      status:   record.status  || 'pending',
      notes:    record.notes   || '',
      paidDate: toInputDate(record.paidDate),
      dueDate:  toInputDate(record.dueDate),
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!draft.amount || Number(draft.amount) <= 0) {
      toast.error('Amount must be a positive number'); return;
    }
    setSaving(true);
    try {
      const { data } = await axios.put(`${backendUrl}${API.payments}/${id}`, {
        amount:   Number(draft.amount),
        status:   draft.status,
        notes:    draft.notes,
        paidDate: draft.paidDate || null,
        dueDate:  draft.dueDate  || null,
      });
      setRecord(data.data);
      setEditing(false);
      toast.success('Payment record updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = () => {
    setConfirm({
      open: true,
      title: 'Delete Payment Record',
      message: 'This payment record will be permanently deleted.\nThis action cannot be undone.',
      confirmLabel: 'Delete Record',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, loading: true }));
        setDeleting(true);
        try {
          await axios.delete(`${backendUrl}${API.payments}/${id}`);
          toast.success('Payment record deleted');
          navigate('/payments');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete');
          setDeleting(false);
          setConfirm({ open: false });
        }
      },
    });
  };

  /* ── Loading spinner ── */
  if (loading) return (
    <Layout>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `3px solid ${BLUE}`, borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    </Layout>
  );

  if (!record) return null;

  const pill = STATUS_PILL[record.status] || STATUS_PILL.pending;
  const statusLabel = STATUS_OPTIONS.find(s => s.value === record.status)?.label || record.status;
  const tenant  = record.tenant  || {};
  const house   = record.house   || {};

  return (
    <Layout>
      <div style={{
        flex: 1, overflowY: 'auto',
        background: '#f4f6f9', padding: '20px 28px 40px',
        fontFamily: FONT, color: NAVY, boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* ── Back ── */}
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          </div>

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: 18, gap: 16,
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
                {tenant.name || 'Payment Record'}
              </h2>
              <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: '#6b7c93' }}>
                {[house.name, house.address, house.city].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 2 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 14px', borderRadius: 20,
                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: pill.bg, color: pill.color, border: pill.border,
                boxShadow: '0 1px 3px rgba(4,34,56,0.1)',
              }}>
                {statusLabel}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: NAVY }}>
                {fmt(record.amount)}
              </span>
            </div>
          </div>

          {/* ── Details card ── */}
          <div style={cardStyle}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY }}>Details</h3>
              {!editing && (
                <button
                  onClick={openEdit}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: FONT, fontSize: 12, fontWeight: 700,
                    color: BLUE, letterSpacing: '0.07em', textTransform: 'uppercase', padding: 0,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill={BLUE} fillRule="evenodd">
                    <path d="M13.673 1.633a.612.612 0 01.083 1.22l-.083.005H1.224v15.918H15.51V9.184c0-.31.23-.566.53-.607l.082-.005c.31 0 .567.23.607.529l.006.083v10.204c0 .31-.23.566-.53.606l-.083.006H.612a.612.612 0 01-.606-.53L0 19.389V2.246c0-.31.23-.566.53-.607l.082-.006h13.06zM17.548.431c.602-.602 1.463-.548 2.016.004.553.553.607 1.414.006 2.016l-7.794 7.793a.612.612 0 01-.159.114L9.31 11.513c-.526.263-1.085-.296-.822-.822l1.155-2.31a.612.612 0 01.114-.158L16.39 1.59a.625.625 0 01.005-.005l.004-.006z"/>
                  </svg>
                  EDIT
                </button>
              )}
            </div>

            {/* ── EDIT FORM ── */}
            {editing && draft ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Amount (TZS)<span style={{ color: '#ef4444', marginLeft: 2 }}>*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={draft.amount}
                    onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
                    style={inputStyle}
                    placeholder="e.g. 500000"
                  />
                </div>

                {/* Status */}
                <div>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {STATUS_OPTIONS.map(opt => (
                      <label key={opt.value} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: FONT, fontSize: 13, color: NAVY, cursor: 'pointer',
                      }}>
                        <input
                          type="radio"
                          name="status"
                          value={opt.value}
                          checked={draft.status === opt.value}
                          onChange={() => setDraft(d => ({ ...d, status: opt.value }))}
                          style={{ accentColor: BLUE }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Paid Date */}
                <div>
                  <label style={labelStyle}>Paid Date</label>
                  <input
                    type="date"
                    value={draft.paidDate}
                    onChange={e => setDraft(d => ({ ...d, paidDate: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input
                    type="date"
                    value={draft.dueDate}
                    onChange={e => setDraft(d => ({ ...d, dueDate: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    rows={3}
                    value={draft.notes}
                    onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                    placeholder="Optional notes…"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
                  />
                </div>

                {/* Save / Cancel */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{
                      flex: 1, padding: '9px 0',
                      background: saving ? '#8a9ab0' : NAVY,
                      color: '#fff', border: 'none', borderRadius: 6,
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    style={{
                      flex: 1, padding: '9px 0',
                      background: 'transparent', color: '#6b7c93',
                      border: '1px solid #dde3ec', borderRadius: 6,
                      fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {/* Delete */}
                <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: 14, marginTop: 4 }}>
                  <button
                    onClick={deleteRecord}
                    disabled={deleting || saving}
                    style={{
                      width: '100%', padding: '9px 0',
                      background: 'transparent',
                      color: deleting ? '#fca5a5' : '#ef4444',
                      border: '1px solid #fca5a5', borderRadius: 6,
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      cursor: deleting || saving ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.04em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}
                    onMouseEnter={e => { if (!deleting && !saving) e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                    {deleting ? 'Deleting…' : 'Delete Record'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Row label="Tenant"    value={tenant.name  || '—'} />
                <Row label="Email"     value={tenant.email || '—'} />
                {tenant.phone && <Row label="Phone" value={tenant.phone} />}
                <Row label="Property"  value={[house.name, house.address, house.city].filter(Boolean).join(', ') || '—'} />
                <Row label="Month"     value={record.month || '—'} />
                <Row label="Amount"    value={fmt(record.amount)} highlight />
                <Row label="Status"    value={statusLabel} />
                <Row label="Due Date"  value={record.dueDate  ? fmtDate(record.dueDate)  : '—'} />
                <Row label="Paid Date" value={record.paidDate ? fmtDate(record.paidDate) : '—'} />
                {record.notes && <Row label="Notes" value={record.notes} />}
                <Row label="Recorded"  value={fmtDate(record.createdAt)} />
                <Row label="Updated"   value={fmtDate(record.updatedAt)} />
              </div>
            )}
          </div>

        </div>
      </div>

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

const Row = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
    <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#6b7c93', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 90, flexShrink: 0, paddingTop: 1 }}>
      {label}
    </span>
    <span style={{ fontFamily: FONT, fontSize: 14, color: highlight ? NAVY : '#374151', fontWeight: highlight ? 700 : 400, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {value}
    </span>
  </div>
);

export default PaymentDetail;
