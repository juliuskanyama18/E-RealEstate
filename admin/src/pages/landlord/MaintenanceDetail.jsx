import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

/* ─── categories (matches create form) ───────────────────────── */
const CATEGORIES = [
  'Appliances', 'Cabinets/Countertops', 'Doors/Windows', 'Electrical',
  'Fencing', 'Fireplace', 'Flooring', 'Garage',
  'Heating and Cooling', 'Inspections', 'Keys/Locks', 'Landscaping',
  'Pest Control', 'Plumbing', 'Pool', 'Roof', 'General', 'Other',
];

/* ─── status pill colors ──────────────────────────────────────── */
const STATUS_PILL = {
  open:        { bg: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' },
  in_progress: { bg: '#FEF9C3', color: '#A16207', border: '1px solid #FDE047' },
  resolved:    { bg: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' },
  closed:      { bg: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' },
};

/* ─── status options ──────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
];

/* ─── date/time helpers ───────────────────────────────────────── */
const fmtDate = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = d =>
  new Date(d)
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .replace(/^0/, '');

/* ─── design tokens ───────────────────────────────────────────── */
const NAVY     = '#042238';
const BLUE     = '#033A6D';
const TEAL     = '#069ED9';
const FONT     = '"Inter", sans-serif';

/* base styles */
const pageStyle = {
  flex: 1, overflowY: 'auto',
  background: '#f4f6f9',
  padding: '20px 28px 40px',
  fontFamily: FONT,
  color: NAVY,
};
const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  border: '1px solid #dde3ec',
  padding: '20px 24px',
  marginBottom: 14,
  boxShadow: '0 1px 4px rgba(4,34,56,0.07)',
};

/* ─── SVG path constants ──────────────────────────────────────── */
const WRENCH_PATH =
  'M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z';

const EDIT_PATH =
  'M13.673 1.633a.612.612 0 01.083 1.22l-.083.005H1.224v15.918H15.51V9.184c0-.31.23-.566.53-.607l.082-.005c.31 0 .567.23.607.529l.006.083v10.204c0 .31-.23.566-.53.606l-.083.006H.612a.612.612 0 01-.606-.53L0 19.389V2.246c0-.31.23-.566.53-.607l.082-.006h13.06zM17.548.431c.602-.602 1.463-.548 2.016.004.553.553.607 1.414.006 2.016l-7.794 7.793a.612.612 0 01-.159.114L9.31 11.513c-.526.263-1.085-.296-.822-.822l1.155-2.31a.612.612 0 01.114-.158L16.39 1.59a.625.625 0 01.005-.005l.004-.006z';

const PERSON_PATH =
  'M10 0c5.523 0 10 4.477 10 10a9.967 9.967 0 0 1-2.882 7.022l-.007.007A9.964 9.964 0 0 1 10 20a9.97 9.97 0 0 1-7.11-2.968A9.969 9.969 0 0 1 0 10C0 4.477 4.477 0 10 0ZM8.553 5.659a.612.612 0 0 1-.714.452c-.29-.058-.359-.035-.389.018-.061.108-.08.364-.032.718.027.2.073.417.136.662.032.128.065.243.122.446.064.23.08.295.08.412 0 .291-.204.535-.476.597a.732.732 0 0 0-.03.22c0 .085.012.164.03.22a.612.612 0 0 1 .475.596c0 .75.18 1.259.465 1.591.15.176.286.259.341.277.25.084.419.318.419.581v2.04a.612.612 0 0 1-.396.573 67.717 67.717 0 0 1-1.329.489c-1.434.52-2.3.857-2.906 1.161A8.733 8.733 0 0 0 10 18.776a8.733 8.733 0 0 0 5.658-2.07c-.248-.124-.54-.253-.875-.39-.25-.103-.815-.316-1.412-.537l-.36-.133c-.838-.31-1.628-.596-1.593-.583a.612.612 0 0 1-.398-.573v-2.041c0-.263.169-.497.419-.58.055-.02.19-.102.341-.278.285-.332.465-.841.465-1.591 0-.29.203-.534.475-.597a.732.732 0 0 0 .03-.22.732.732 0 0 0-.03-.219.612.612 0 0 1-.475-.597c0-.163.278-1.037.262-.979.116-.407.189-.769.209-1.1.014-.24 0-.452-.045-.63-.253-1.014-3.864-1.014-4.118 0Z';

const DOWNLOAD_PATH =
  'M19.362 14.653c.352 0 .638.286.638.639v1.628c0 1.7-1.38 3.08-3.08 3.08H3.08A3.08 3.08 0 010 16.92v-1.628a.638.638 0 111.277 0v1.628c0 .996.807 1.803 1.803 1.803h13.84c.996 0 1.803-.807 1.803-1.803v-1.628c0-.353.286-.639.639-.639zM10 0c.353 0 .638.286.638.638v13.019l4.868-4.867a.638.638 0 11.903.902L10.45 15.65l-.019.018a.642.642 0 01-.035.03l.054-.048a.642.642 0 01-.683.143.628.628 0 01-.22-.143L3.592 9.692a.638.638 0 01.903-.902l4.867 4.866V.638C9.362.286 9.648 0 10 0z';

const STAR_FILLED =
  'M10.098.007c.057.012.072.013.126.035a.615.615 0 0 1 .297.248c.03.05.034.064.057.118l2.305 6.53h6.506l.065.004.065.01a.618.618 0 0 1 .297 1.036c-.015.016-.033.03-.05.044l-5.375 4.224 2.313 6.939.018.064c.003.023.008.044.01.067a.615.615 0 0 1-.66.672.614.614 0 0 1-.255-.08c-.02-.01-.037-.024-.056-.036l-5.76-4.225-5.762 4.225-.056.037-.06.03a.614.614 0 0 1-.844-.69c.004-.022.012-.043.017-.064l2.313-6.939L.233 8.032l-.05-.043L.14 7.94a.614.614 0 0 1 .159-.915.614.614 0 0 1 .248-.083l.066-.004h6.506L9.423.408l.025-.061c.028-.051.033-.065.069-.111a.616.616 0 0 1 .581-.229Z';

/* ══════════════════════════════════════════════════════════════ */

const EMPTY_PRO = { name: '', phone: '', email: '', notes: '' };

const MaintenanceDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [request, setRequest]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState('open');
  const [saving, setSaving]         = useState(false);
  const [starred, setStarred]       = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Details edit state
  const [detailEdit, setDetailEdit]   = useState(false);
  const [detailDraft, setDetailDraft] = useState(null);
  const [detailSaving, setDetailSaving] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // Activity info tooltip
  const [infoTooltip, setInfoTooltip] = useState(false);

  // Note state
  const [noteOpen, setNoteOpen]   = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Assigned Technicians state
  const [pros, setPros]               = useState([]);
  const [proAddOpen, setProAddOpen]   = useState(false);
  const [proDraft, setProDraft]       = useState(EMPTY_PRO);
  const [proSaving, setProSaving]     = useState(false);
  const [proEditIdx, setProEditIdx]   = useState(null);
  const [proEditDraft, setProEditDraft] = useState(EMPTY_PRO);

  useEffect(() => {
    axios
      .get(`${backendUrl}${API.maintenance}/${id}`)
      .then(r => {
        const data = r.data.data;
        setRequest(data);
        setStatus(data.status);
        setStarred(!!data.starred);
        if (data.proContacts?.length > 0) {
          setPros(data.proContacts);
        }
      })
      .catch(() => navigate('/maintenance'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const addPro = async () => {
    if (!proDraft.name.trim()) return;
    setProSaving(true);
    const updated = [...pros, { ...proDraft }];
    try {
      const res = await axios.put(`${backendUrl}${API.maintenance}/${id}/pro`, { proContacts: updated });
      setPros(res.data.data.proContacts || updated);
      setProAddOpen(false);
      setProDraft(EMPTY_PRO);
    } catch {
      toast.error('Failed to save technician. Please try again.');
    } finally {
      setProSaving(false);
    }
  };

  const deletePro = async (index) => {
    setProSaving(true);
    const updated = pros.filter((_, i) => i !== index);
    try {
      const res = await axios.put(`${backendUrl}${API.maintenance}/${id}/pro`, { proContacts: updated });
      setPros(res.data.data.proContacts || updated);
    } catch {
      toast.error('Failed to delete technician. Please try again.');
    } finally {
      setProSaving(false);
    }
  };

  const savePro = async (index) => {
    if (!proEditDraft.name.trim()) return;
    setProSaving(true);
    const updated = pros.map((p, i) => i === index ? { ...proEditDraft } : p);
    try {
      const res = await axios.put(`${backendUrl}${API.maintenance}/${id}/pro`, { proContacts: updated });
      setPros(res.data.data.proContacts || updated);
      setProEditIdx(null);
      setProEditDraft(EMPTY_PRO);
    } catch {
      toast.error('Failed to update technician. Please try again.');
    } finally {
      setProSaving(false);
    }
  };

  const openDetailEdit = () => {
    setDetailDraft({
      category: request.category || '',
      title: request.title || '',
      description: request.description || '',
      preferredTime: request.preferredTime || 'ANYTIME',
      existingPhotos: [...(request.photos || [])],
      newPhotos: [],
    });
    setDetailEdit(true);
  };

  const saveDetail = async () => {
    setDetailSaving(true);
    try {
      const fd = new FormData();
      fd.append('category', detailDraft.category);
      fd.append('title', detailDraft.title);
      fd.append('description', detailDraft.description);
      fd.append('preferredTime', detailDraft.preferredTime);
      fd.append('existingPhotos', JSON.stringify(detailDraft.existingPhotos));
      detailDraft.newPhotos.forEach(f => fd.append('photos', f));
      const res = await axios.put(`${backendUrl}${API.maintenance}/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRequest(res.data.data);
      setDetailEdit(false);
    } catch { /* silent */ }
    finally { setDetailSaving(false); }
  };

  const deleteRequest = async () => {
    if (!window.confirm('Delete this maintenance request? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`${backendUrl}${API.maintenance}/${id}`);
      toast.success('Maintenance request deleted');
      navigate('/maintenance');
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const addNote = async () => {
    if (!noteDraft.trim()) return;
    setNoteSaving(true);
    try {
      const res = await axios.post(`${backendUrl}${API.maintenance}/${id}/note`, { note: noteDraft });
      setRequest(res.data.data);
      setNoteDraft('');
      setNoteOpen(false);
    } catch { /* silent */ }
    finally { setNoteSaving(false); }
  };

  const changeStatus = async val => {
    setStatusOpen(false);
    if (val === status) return;
    setSaving(true);
    try {
      await axios.put(`${backendUrl}${API.maintenance}/${id}/status`, { status: val });
      setStatus(val);
      setRequest(p => ({ ...p, status: val, updatedAt: new Date().toISOString() }));
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  /* ── spinner ── */
  if (loading) return (
    <Layout>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `3px solid ${BLUE}`, borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }}/>
      </div>
    </Layout>
  );

  if (!request) return null;

  const house       = request.house || {};
  const statusLabel = STATUS_OPTIONS.find(s => s.value === status)?.label || 'Open';
  const propLine    = [house.address, house.city].filter(Boolean).join(', ');
  const pillStyle   = STATUS_PILL[status] || STATUS_PILL.open;

  return (
    <Layout>
      <div style={pageStyle} onClick={() => setStatusOpen(false)}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── ① Back ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: 12, fontWeight: 700,
              color: BLUE, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: 0,
            }}
          >
            {/* ← arrow */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
        </div>

        {/* ── ② Page header (no card) ─────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18, gap: 16,
        }}>
          {/* Left: circle icon + title + address */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

            {/* Wrench circle — 52 px, light gray fill + border */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#e8edf2', border: '1.5px solid #cdd5de',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 2,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={NAVY}>
                <path d={WRENCH_PATH}/>
              </svg>
            </div>

            {/* Title block */}
            <div>
              {/* Title + download icon on same line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <h2 style={{
                  margin: 0, fontFamily: FONT,
                  fontSize: 22, fontWeight: 700,
                  color: NAVY, lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {request.title}
                </h2>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  title="Download"
                  style={{ display: 'inline-flex', lineHeight: 1, color: BLUE, marginTop: 1 }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill={BLUE}>
                    <path d={DOWNLOAD_PATH}/>
                  </svg>
                </a>
              </div>
              {/* Property address */}
              {propLine && (
                <p style={{
                  margin: 0, fontFamily: FONT,
                  fontSize: 13, color: '#6b7c93',
                  lineHeight: 1.4,
                }}>
                  {propLine}
                </p>
              )}
            </div>
          </div>

          {/* Right: status pill + star */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 2 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Status dropdown pill */}
            <div style={{ position: 'relative' }}>
              <button
                disabled={saving}
                onClick={() => setStatusOpen(o => !o)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px 7px 15px',
                  borderRadius: 20, fontFamily: FONT,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: pillStyle.bg, color: pillStyle.color,
                  border: pillStyle.border, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.75 : 1,
                  boxShadow: '0 1px 3px rgba(4,34,56,0.12)',
                  whiteSpace: 'nowrap',
                }}
              >
                {statusLabel}
                <svg viewBox="0 0 10 6" width="9" height="5" fill="currentColor">
                  <path
                    d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>

              {statusOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                  background: '#fff', border: '1px solid #dde3ec',
                  borderRadius: 6, boxShadow: '0 6px 24px rgba(4,34,56,0.13)',
                  zIndex: 60, minWidth: 148, overflow: 'hidden',
                }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => changeStatus(opt.value)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 15px', fontFamily: FONT, fontSize: 13,
                        background: status === opt.value ? '#f0f4f8' : '#fff',
                        color: status === opt.value ? NAVY : '#374151',
                        fontWeight: status === opt.value ? 700 : 400,
                        border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Star toggle */}
            <button
              onClick={async () => {
                const next = !starred;
                setStarred(next);
                try {
                  await axios.put(`${backendUrl}${API.maintenance}/${id}/star`);
                } catch {
                  setStarred(!next); // revert on failure
                }
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px', display: 'inline-flex',
                color: starred ? '#F5A623' : '#c5cdd8',
                transition: 'color 0.15s',
              }}
              title={starred ? 'Unstar' : 'Star'}
            >
              <svg width="22" height="22" viewBox="0 0 20 20"
                fill="currentColor">
                <path d={STAR_FILLED} fillRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── ③ Two-column body ──────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* ════ LEFT: Details card ══════════════════════════════ */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={cardStyle}>

              {/* Card header: "Details" + EDIT */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <h3 style={{
                  margin: 0, fontFamily: FONT,
                  fontSize: 16, fontWeight: 700, color: NAVY,
                }}>
                  Details
                </h3>
                {!detailEdit && (
                  <button
                    onClick={openDetailEdit}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: FONT, fontSize: 12, fontWeight: 700,
                      color: BLUE, letterSpacing: '0.07em',
                      textTransform: 'uppercase', padding: 0,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill={BLUE} fillRule="evenodd">
                      <path d={EDIT_PATH}/>
                    </svg>
                    EDIT
                  </button>
                )}
              </div>

              {/* ── EDIT FORM ── */}
              {detailEdit && detailDraft ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Category */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                      color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
                    }}>Category</label>
                    <select
                      value={detailDraft.category}
                      onChange={e => setDetailDraft(d => ({ ...d, category: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', fontFamily: FONT, fontSize: 14, color: NAVY,
                        border: '1px solid #dde3ec', borderRadius: 6, outline: 'none',
                        background: '#fff', cursor: 'pointer',
                      }}
                    >
                      <option value="">Select category…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                      color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
                    }}>Title</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={detailDraft.title}
                      onChange={e => setDetailDraft(d => ({ ...d, title: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', fontFamily: FONT, fontSize: 14, color: NAVY,
                        border: '1px solid #dde3ec', borderRadius: 6, outline: 'none', background: '#fff',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                      color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
                    }}>Description</label>
                    <textarea
                      rows={4}
                      value={detailDraft.description}
                      onChange={e => setDetailDraft(d => ({ ...d, description: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', fontFamily: FONT, fontSize: 14, color: NAVY,
                        border: '1px solid #dde3ec', borderRadius: 6, outline: 'none',
                        background: '#fff', resize: 'vertical', lineHeight: 1.55,
                      }}
                    />
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                      color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
                    }}>Preferred Time to Enter</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[
                        { value: 'ANYTIME', label: 'Anytime' },
                        { value: 'COORDINATE', label: 'Call first to coordinate' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: FONT, fontSize: 13, color: NAVY,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="preferredTime"
                            value={opt.value}
                            checked={detailDraft.preferredTime === opt.value}
                            onChange={() => setDetailDraft(d => ({ ...d, preferredTime: opt.value }))}
                            style={{ accentColor: BLUE }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Existing photos */}
                  {detailDraft.existingPhotos.length > 0 && (
                    <div>
                      <label style={{
                        display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
                      }}>Current Photos</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {detailDraft.existingPhotos.map((p, i) => (
                          <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                              width: 90, height: 68, borderRadius: 6,
                              border: '1px solid #dde3ec',
                              backgroundImage: `url(${backendUrl}${p})`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                            }}/>
                            <button
                              onClick={() => setDetailDraft(d => ({
                                ...d,
                                existingPhotos: d.existingPhotos.filter((_, j) => j !== i),
                              }))}
                              title="Remove photo"
                              style={{
                                position: 'absolute', top: -6, right: -6,
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#ef4444', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, lineHeight: 1,
                                padding: 0,
                              }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New photo upload */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
                      color: '#6b7c93', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
                    }}>Add New Photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setDetailDraft(d => ({ ...d, newPhotos: [...d.newPhotos, ...files] }));
                        e.target.value = '';
                      }}
                      style={{ fontFamily: FONT, fontSize: 13, color: '#374151' }}
                    />
                    {detailDraft.newPhotos.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {detailDraft.newPhotos.map((f, i) => (
                          <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                              width: 90, height: 68, borderRadius: 6,
                              border: '1px solid #dde3ec',
                              backgroundImage: `url(${URL.createObjectURL(f)})`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                            }}/>
                            <button
                              onClick={() => setDetailDraft(d => ({
                                ...d,
                                newPhotos: d.newPhotos.filter((_, j) => j !== i),
                              }))}
                              title="Remove"
                              style={{
                                position: 'absolute', top: -6, right: -6,
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#ef4444', border: 'none',
                                color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, lineHeight: 1, padding: 0,
                              }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save / Cancel */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                    <button
                      onClick={saveDetail}
                      disabled={detailSaving || !detailDraft.title.trim() || !detailDraft.category}
                      style={{
                        flex: 1, padding: '9px 0',
                        background: detailSaving || !detailDraft.title.trim() || !detailDraft.category
                          ? '#8a9ab0' : NAVY,
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontFamily: FONT, fontSize: 13, fontWeight: 700,
                        cursor: detailSaving || !detailDraft.title.trim() || !detailDraft.category
                          ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {detailSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setDetailEdit(false)}
                      disabled={detailSaving}
                      style={{
                        flex: 1, padding: '9px 0',
                        background: 'transparent', color: '#6b7c93',
                        border: '1px solid #dde3ec', borderRadius: 6,
                        fontFamily: FONT, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Delete */}
                  <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: 14, marginTop: 4 }}>
                    <button
                      onClick={deleteRequest}
                      disabled={deleting || detailSaving}
                      style={{
                        width: '100%', padding: '9px 0',
                        background: 'transparent',
                        color: deleting ? '#fca5a5' : '#ef4444',
                        border: '1px solid #fca5a5',
                        borderRadius: 6,
                        fontFamily: FONT, fontSize: 13, fontWeight: 700,
                        cursor: deleting || detailSaving ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.04em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}
                      onMouseEnter={e => { if (!deleting && !detailSaving) { e.currentTarget.style.background = '#fef2f2'; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                      {deleting ? 'Deleting…' : 'Delete Request'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Detail rows: bold label + teal value inline ── */}

                  {/* Requested On */}
                  <p style={{ margin: '0 0 9px', fontFamily: FONT, fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
                    <strong style={{ fontWeight: 700 }}>Requested On: </strong>
                    <span style={{ color: TEAL }}>
                      {fmtDate(request.createdAt)} | {fmtTime(request.createdAt).toLowerCase()}
                    </span>
                  </p>

                  {/* Preferred Time */}
                  <p style={{ margin: '0 0 9px', fontFamily: FONT, fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
                    <strong style={{ fontWeight: 700 }}>Preferred Time to Enter: </strong>
                    <span>
                      {request.preferredTime === 'ANYTIME' ? 'Anytime' : 'Call first to coordinate'}
                    </span>
                  </p>

                  {/* Category */}
                  <p style={{ margin: '0 0 9px', fontFamily: FONT, fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
                    <strong style={{ fontWeight: 700 }}>Category: </strong>
                    <span>{request.category}</span>
                  </p>

                  {/* Description — label on its own line, text below */}
                  <p style={{
                    margin: '0 0 4px', fontFamily: FONT,
                    fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1.55,
                  }}>
                    Description:
                  </p>
                  <p style={{
                    margin: '0 0 18px', fontFamily: FONT,
                    fontSize: 14, color: '#374151',
                    lineHeight: 1.65, whiteSpace: 'pre-wrap',
                  }}>
                    {request.description}
                  </p>

                  {/* Photos grid */}
                  {request.photos && request.photos.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {request.photos.map((p, i) => (
                        <a
                          key={i}
                          href={`${backendUrl}${p}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block', width: 196, height: 148,
                            borderRadius: 6, border: '1px solid #dde3ec',
                            flexShrink: 0,
                            backgroundImage: `url(${backendUrl}${p})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ════ RIGHT: stacked cards ════════════════════════════ */}
          <div style={{ width: 296, flexShrink: 0 }}>

            {/* ── Available Technicians card ───────────────────────── */}
            <div style={cardStyle}>

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#e8f0f7', border: '1px solid #c3d7f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={BLUE} strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY }}>
                    Available Technicians
                  </h3>
                </div>

                {/* + Add button — always shown when form is closed */}
                {!proAddOpen && (
                  <button
                    onClick={() => { setProDraft({ ...EMPTY_PRO }); setProAddOpen(true); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: NAVY, color: '#fff',
                      border: 'none', borderRadius: 16,
                      padding: '5px 11px',
                      fontFamily: FONT, fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.04em',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add
                  </button>
                )}
              </div>

              {/* ── EMPTY STATE ── */}
              {pros.length === 0 && !proAddOpen && (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  padding: '10px 0 4px',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#f0f4f8', border: '1.5px dashed #c3d7f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="#ACB9C8" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <p style={{ margin: '0 0 3px', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY }}>
                    No technicians assigned yet
                  </p>
                  <p style={{ margin: 0, fontFamily: FONT, fontSize: 12, color: '#8a9ab0', lineHeight: 1.45 }}>
                    Add contact details of technicians available for this {request.category || 'repair'}.
                  </p>
                </div>
              )}

              {/* ── TECHNICIAN LIST ── */}
              {pros.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: proAddOpen ? 12 : 0 }}>
                  {pros.map((p, idx) => (
                    <div key={idx}>
                      {/* ── Inline edit form ── */}
                      {proEditIdx === idx ? (
                        <div style={{
                          background: '#f0f6ff', border: '1.5px solid #bfdbfe',
                          borderRadius: 8, padding: 14,
                          display: 'flex', flexDirection: 'column', gap: 10,
                        }}>
                          <p style={{
                            margin: '0 0 2px', fontFamily: FONT,
                            fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: '0.03em',
                          }}>
                            Edit Technician
                          </p>
                          {[
                            { key: 'name',  label: 'Name *',  placeholder: 'e.g. John Smith',         type: 'text'  },
                            { key: 'phone', label: 'Phone',   placeholder: 'e.g. +1 555 123 4567',    type: 'tel'   },
                            { key: 'email', label: 'Email',   placeholder: 'e.g. john@repairs.com',   type: 'email' },
                            { key: 'notes', label: 'Notes',   placeholder: 'e.g. available weekdays', type: 'text', multi: true },
                          ].map(field => (
                            <div key={field.key}>
                              <label style={{
                                display: 'block', fontFamily: FONT,
                                fontSize: 10, fontWeight: 700,
                                color: '#6b7c93', letterSpacing: '0.06em',
                                textTransform: 'uppercase', marginBottom: 3,
                              }}>
                                {field.label}
                              </label>
                              {field.multi ? (
                                <textarea
                                  rows={2}
                                  value={proEditDraft[field.key]}
                                  onChange={e => setProEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  style={{
                                    width: '100%', boxSizing: 'border-box',
                                    padding: '6px 9px', fontFamily: FONT,
                                    fontSize: 12, color: NAVY,
                                    border: '1px solid #bfdbfe', borderRadius: 6,
                                    outline: 'none', resize: 'none',
                                    background: '#fff', lineHeight: 1.5,
                                  }}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={proEditDraft[field.key]}
                                  onChange={e => setProEditDraft(d => ({ ...d, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  style={{
                                    width: '100%', boxSizing: 'border-box',
                                    padding: '6px 9px', fontFamily: FONT,
                                    fontSize: 12, color: NAVY,
                                    border: '1px solid #bfdbfe', borderRadius: 6,
                                    outline: 'none', background: '#fff',
                                  }}
                                />
                              )}
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            <button
                              onClick={() => savePro(idx)}
                              disabled={proSaving || !proEditDraft.name.trim()}
                              style={{
                                flex: 1, padding: '7px 0',
                                background: proSaving || !proEditDraft.name.trim() ? '#8a9ab0' : '#1d4ed8',
                                color: '#fff', border: 'none', borderRadius: 6,
                                fontFamily: FONT, fontSize: 11, fontWeight: 700,
                                cursor: proSaving || !proEditDraft.name.trim() ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {proSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              onClick={() => { setProEditIdx(null); setProEditDraft(EMPTY_PRO); }}
                              disabled={proSaving}
                              style={{
                                flex: 1, padding: '7px 0',
                                background: 'transparent', color: '#6b7c93',
                                border: '1px solid #dde3ec', borderRadius: 6,
                                fontFamily: FONT, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── View card ── */
                        <div style={{
                          background: '#f8fafc', border: '1px solid #e8edf4',
                          borderRadius: 8, padding: '10px 10px 10px 12px',
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#e8f0f7', border: '1.5px solid #c3d7f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 1,
                          }}>
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="#ACB9C8">
                              <path d={PERSON_PATH}/>
                            </svg>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 1px', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: NAVY }}>
                              {p.name}
                            </p>
                            <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, color: '#8a9ab0' }}>
                              {request.category || 'Specialist'}
                            </p>
                            {(p.phone || p.email || p.notes) && (
                              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {p.phone && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                      stroke="#8a9ab0" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.34 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/>
                                    </svg>
                                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#374151' }}>{p.phone}</span>
                                  </div>
                                )}
                                {p.email && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                      stroke="#8a9ab0" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                      <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#374151' }}>{p.email}</span>
                                  </div>
                                )}
                                {p.notes && (
                                  <p style={{
                                    margin: '2px 0 0', fontFamily: FONT,
                                    fontSize: 11, color: '#6b7c93',
                                    lineHeight: 1.4, fontStyle: 'italic',
                                  }}>
                                    {p.notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action buttons: Edit + Delete */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                            {/* Edit button */}
                            <button
                              onClick={() => { setProEditIdx(idx); setProEditDraft({ ...p }); }}
                              disabled={proSaving}
                              title="Edit technician"
                              style={{
                                background: 'none', border: 'none',
                                cursor: proSaving ? 'not-allowed' : 'pointer',
                                padding: '3px 4px', borderRadius: 4,
                                color: '#1d4ed8', opacity: proSaving ? 0.4 : 0.7,
                                display: 'flex', alignItems: 'center',
                                transition: 'opacity 0.15s',
                              }}
                              onMouseEnter={e => { if (!proSaving) e.currentTarget.style.opacity = '1'; }}
                              onMouseLeave={e => { if (!proSaving) e.currentTarget.style.opacity = '0.7'; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => deletePro(idx)}
                              disabled={proSaving}
                              title="Remove technician"
                              style={{
                                background: 'none', border: 'none',
                                cursor: proSaving ? 'not-allowed' : 'pointer',
                                padding: '3px 4px', borderRadius: 4,
                                color: '#dc2626', opacity: proSaving ? 0.4 : 0.7,
                                display: 'flex', alignItems: 'center',
                                transition: 'opacity 0.15s',
                              }}
                              onMouseEnter={e => { if (!proSaving) e.currentTarget.style.opacity = '1'; }}
                              onMouseLeave={e => { if (!proSaving) e.currentTarget.style.opacity = '0.7'; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── ADD FORM ── */}
              {proAddOpen && (
                <div style={{
                  background: '#f8fafc', border: '1px solid #e8edf4',
                  borderRadius: 8, padding: 14,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <p style={{
                    margin: '0 0 2px', fontFamily: FONT,
                    fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: '0.03em',
                  }}>
                    New Technician
                  </p>
                  {[
                    { key: 'name',  label: 'Name *',  placeholder: 'e.g. John Smith',         type: 'text'  },
                    { key: 'phone', label: 'Phone',   placeholder: 'e.g. +1 555 123 4567',    type: 'tel'   },
                    { key: 'email', label: 'Email',   placeholder: 'e.g. john@repairs.com',   type: 'email' },
                    { key: 'notes', label: 'Notes',   placeholder: 'e.g. available weekdays', type: 'text', multi: true },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{
                        display: 'block', fontFamily: FONT,
                        fontSize: 10, fontWeight: 700,
                        color: '#6b7c93', letterSpacing: '0.06em',
                        textTransform: 'uppercase', marginBottom: 3,
                      }}>
                        {field.label}
                      </label>
                      {field.multi ? (
                        <textarea
                          rows={2}
                          value={proDraft[field.key]}
                          onChange={e => setProDraft(d => ({ ...d, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '6px 9px', fontFamily: FONT,
                            fontSize: 12, color: NAVY,
                            border: '1px solid #dde3ec', borderRadius: 6,
                            outline: 'none', resize: 'none',
                            background: '#fff', lineHeight: 1.5,
                          }}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={proDraft[field.key]}
                          onChange={e => setProDraft(d => ({ ...d, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '6px 9px', fontFamily: FONT,
                            fontSize: 12, color: NAVY,
                            border: '1px solid #dde3ec', borderRadius: 6,
                            outline: 'none', background: '#fff',
                          }}
                        />
                      )}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button
                      onClick={addPro}
                      disabled={proSaving || !proDraft.name.trim()}
                      style={{
                        flex: 1, padding: '7px 0',
                        background: proSaving || !proDraft.name.trim() ? '#8a9ab0' : NAVY,
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontFamily: FONT, fontSize: 11,
                        fontWeight: 700,
                        cursor: proSaving || !proDraft.name.trim() ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {proSaving ? 'Saving…' : 'Add Technician'}
                    </button>
                    <button
                      onClick={() => { setProAddOpen(false); setProDraft(EMPTY_PRO); }}
                      disabled={proSaving}
                      style={{
                        flex: 1, padding: '7px 0',
                        background: 'transparent', color: '#6b7c93',
                        border: '1px solid #dde3ec', borderRadius: 6,
                        fontFamily: FONT, fontSize: 11,
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Activity card ──────────────────────────────────── */}
            {(() => {
              const STATUS_LABEL = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

              // Build log: use stored entries (newest first) or synthesize from createdAt
              const rawLog = request.activityLog?.length > 0
                ? [...request.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                : [{ entryType: 'created', addedBy: request.submittedBy || 'landlord', timestamp: request.createdAt }];

              return (
                <div style={cardStyle}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY }}>
                        Activity
                      </h3>
                      {/* ⓘ icon with tooltip */}
                      <div
                        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'default' }}
                        onMouseEnter={() => setInfoTooltip(true)}
                        onMouseLeave={() => setInfoTooltip(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="8.5"/>
                          <line x1="12" y1="11.5" x2="12" y2="16"/>
                        </svg>
                        {infoTooltip && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#1a2b3c', color: '#fff',
                            fontFamily: FONT, fontSize: 12, lineHeight: 1.5,
                            padding: '10px 12px', borderRadius: 6,
                            width: 240, zIndex: 100,
                            boxShadow: '0 4px 16px rgba(4,34,56,0.25)',
                            pointerEvents: 'none',
                          }}>
                            Activity Log is visible to both you and all of the tenants on the lease. Notes are only visible to you.
                            {/* arrow */}
                            <div style={{
                              position: 'absolute', top: '100%', left: '50%',
                              transform: 'translateX(-50%)',
                              width: 0, height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '6px solid #1a2b3c',
                            }}/>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setNoteOpen(o => !o)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: FONT, fontSize: 12, fontWeight: 700,
                        color: BLUE, letterSpacing: '0.07em',
                        textTransform: 'uppercase', padding: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill={BLUE} fillRule="evenodd">
                        <path d={EDIT_PATH}/>
                      </svg>
                      Add Note
                    </button>
                  </div>

                  {/* Add Note form */}
                  {noteOpen && (
                    <div style={{
                      background: '#f8fafc', border: '1px solid #dde3ec',
                      borderRadius: 7, padding: '12px', marginBottom: 14,
                    }}>
                      <textarea
                        autoFocus
                        rows={3}
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        placeholder="Add a note about this request…"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '7px 10px', fontFamily: FONT, fontSize: 13,
                          color: NAVY, border: '1px solid #dde3ec', borderRadius: 6,
                          outline: 'none', background: '#fff', resize: 'vertical',
                          lineHeight: 1.5, marginBottom: 8,
                        }}
                      />
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button
                          onClick={addNote}
                          disabled={noteSaving || !noteDraft.trim()}
                          style={{
                            flex: 1, padding: '7px 0',
                            background: noteSaving || !noteDraft.trim() ? '#8a9ab0' : NAVY,
                            color: '#fff', border: 'none', borderRadius: 6,
                            fontFamily: FONT, fontSize: 12, fontWeight: 700,
                            cursor: noteSaving || !noteDraft.trim() ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {noteSaving ? 'Saving…' : 'Save Note'}
                        </button>
                        <button
                          onClick={() => { setNoteOpen(false); setNoteDraft(''); }}
                          style={{
                            flex: 1, padding: '7px 0',
                            background: 'transparent', color: '#6b7c93',
                            border: '1px solid #dde3ec', borderRadius: 6,
                            fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Activity log entries */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {rawLog.map((entry, i) => {
                      const isStatus = entry.entryType === 'status_update';
                      const isNote   = entry.entryType === 'note';
                      const isCreated = entry.entryType === 'created';

                      const title = isStatus
                        ? `Status Update: ${STATUS_LABEL[entry.status] || entry.status}`
                        : isNote
                          ? 'Note Added by You'
                          : `Requested by ${entry.addedBy === 'tenant' ? (request.tenant?.name || 'Tenant') : 'You'}`;

                      return (
                        <div key={i} style={{
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                          paddingBottom: 12, marginBottom: 12,
                          borderBottom: i < rawLog.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                          {/* Icon circle */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#e8edf2', border: '1.5px solid #cdd5de',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 1,
                          }}>
                            {isNote ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            ) : isCreated ? (
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="#ACB9C8">
                                <path d={PERSON_PATH}/>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={NAVY}>
                                <path d={WRENCH_PATH}/>
                              </svg>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              margin: '0 0 2px', fontFamily: FONT,
                              fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.3,
                            }}>
                              {title}
                            </h4>
                            <p style={{
                              margin: isNote && entry.note ? '0 0 5px' : 0,
                              fontFamily: FONT, fontSize: 11, color: '#8a9ab0', lineHeight: 1.4,
                            }}>
                              {fmtDate(entry.timestamp)} | {fmtTime(entry.timestamp).toUpperCase()}
                            </p>
                            {isNote && entry.note && (
                              <p style={{
                                margin: 0, fontFamily: FONT,
                                fontSize: 12, color: '#374151',
                                lineHeight: 1.5, whiteSpace: 'pre-wrap',
                              }}>
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>{/* end right column */}
        </div>{/* end two-column */}
        </div>{/* /maxWidth wrapper */}
      </div>
    </Layout>
  );
};

export default MaintenanceDetail;
