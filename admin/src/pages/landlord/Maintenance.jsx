import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const CATEGORIES = [
  'Appliances', 'Cabinets/Countertops', 'Doors/Windows', 'Electrical',
  'Fencing', 'Fireplace', 'Flooring', 'Garage',
  'Heating and Cooling', 'Inspections', 'Keys/Locks', 'Landscaping',
  'Pest Control', 'Plumbing', 'Pool', 'Roof', 'General', 'Other',
];

const STATUS_MAP = {
  open:        { label: 'Open',        bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  in_progress: { label: 'In Progress', bg: '#FEF9C3', color: '#A16207', border: '#FDE047' },
  resolved:    { label: 'Resolved',    bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  closed:      { label: 'Closed',      bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
};

const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');

/* ── Create Request Modal ──────────────────────────────────── */
const PRIORITY_COLORS = { low: '#16a34a', medium: '#d97706', high: '#dc2626' };

const CreateModal = ({ houses, onClose, onCreated }) => {
  const [houseId, setHouseId]         = useState('');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus]           = useState('open');
  const [dueDate, setDueDate]         = useState('');
  const [priority, setPriority]       = useState('medium');
  const [viewableBy, setViewableBy]   = useState('all');
  const [photos, setPhotos]           = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const addFiles = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPhotoPreviews(prev => [...prev, { url: e.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
    setPhotos(prev => [...prev, ...imageFiles]);
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!houseId || !title.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('houseId', houseId);
      fd.append('category', 'General');
      fd.append('title', title);
      fd.append('description', description);
      fd.append('status', status);
      fd.append('priority', priority);
      if (dueDate) fd.append('dueDate', dueDate);
      fd.append('viewableBy', viewableBy);
      photos.forEach(f => fd.append('photos', f));
      await axios.post(`${backendUrl}${API.maintenance}`, fd);
      setSubmitted(true);
      onCreated && onCreated();
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldInput = {
    width: '100%', boxSizing: 'border-box',
    padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 6,
    fontSize: 13, color: '#042238', background: '#fff', outline: 'none',
    fontFamily: '"Inter", sans-serif', appearance: 'none',
  };

  const FieldRow = ({ icon, label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', alignItems: 'center', borderBottom: '1px solid #f3f4f6', padding: '9px 0', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', fontWeight: 500 }}>
        {icon}
        {label}
      </div>
      <div>{children}</div>
    </div>
  );

  const chevronSvg = (
    <svg width="13" height="13" viewBox="0 0 14 14" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="M2 4l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(4,34,56,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ background: '#fff', borderRadius: 12, minWidth: 0, maxWidth: 600, width: '100%', boxSizing: 'border-box', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: '"Inter", sans-serif', color: '#042238' }}
        onClick={e => e.stopPropagation()}
      >

        {submitted ? (
          /* ── Success screen ── */
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#10B981', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 8px rgba(16,185,129,0.15)' }}>
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                <path d="M2 10L9.5 17.5L24 2" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#042238', margin: '0 0 8px' }}>Request submitted!</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>The maintenance request has been created.</p>
            <button onClick={onClose} style={{ background: '#033A6D', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Maintenance Request</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <input
                required maxLength={50} value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Enter title"
                style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: '#042238', fontFamily: '"Inter", sans-serif', background: 'transparent', padding: 0 }}
              />
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px' }}>
              <form id="createMaintForm" onSubmit={handleSubmit}>

                {/* Field rows */}
                <FieldRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>} label="Property">
                  <div style={{ position: 'relative' }}>
                    <select required value={houseId} onChange={e => setHouseId(e.target.value)} style={{ ...fieldInput, color: houseId ? '#042238' : '#9ca3af', paddingRight: 28 }}>
                      <option value="" disabled>Select property</option>
                      {houses.map(h => <option key={h._id} value={h._id}>{h.address}{h.city ? `, ${h.city}` : ''}</option>)}
                    </select>
                    {chevronSvg}
                  </div>
                </FieldRow>

                <FieldRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M5.33 20H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1.33c1.1 0 2 .9 2 2v12c0 1.1-.89 2-2 2M22 18V6c0-1.1-.9-2-2-2h-1.33c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2H20c1.11 0 2-.9 2-2m-7.33 0V6c0-1.1-.9-2-2-2h-1.33c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h1.33c1.1 0 2-.9 2-2"/></svg>} label="Status">
                  <div style={{ position: 'relative' }}>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...fieldInput, paddingRight: 28 }}>
                      <option value="open">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    {chevronSvg}
                  </div>
                </FieldRow>

                <FieldRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 18H4V8h16z"/></svg>} label="Due date">
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={fieldInput} />
                </FieldRow>

                <FieldRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>} label="Priority">
                  <div style={{ position: 'relative' }}>
                    <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...fieldInput, paddingRight: 28, color: PRIORITY_COLORS[priority] || '#042238', fontWeight: 600 }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {chevronSvg}
                  </div>
                </FieldRow>

                <FieldRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"/></svg>} label="Viewable by">
                  <div style={{ position: 'relative' }}>
                    <select value={viewableBy} onChange={e => setViewableBy(e.target.value)} style={{ ...fieldInput, paddingRight: 28 }}>
                      <option value="all">Landlord and Tenants</option>
                      <option value="landlord">Landlord only</option>
                    </select>
                    {chevronSvg}
                  </div>
                </FieldRow>

                {/* Description */}
                <div style={{ padding: '14px 0 10px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Description</p>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Enter description..."
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, color: '#042238', background: '#fff', outline: 'none', fontFamily: '"Inter", sans-serif', resize: 'vertical', lineHeight: 1.55 }}
                  />
                </div>

                {/* Images */}
                <div style={{ paddingBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Images</p>
                  {photoPreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 8 }}>
                      {photoPreviews.map((p, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', height: 100 }}>
                          <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removePhoto(i)}
                            style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed #c5d6e8', borderRadius: 6, background: '#f8fbff', padding: '14px 16px', cursor: 'pointer', height: 80, boxSizing: 'border-box' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#4a90c4">
                      <path d="M11 10V0H5v10H2l6 6 6-6h-3zm0 0" fillRule="evenodd"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4a90c4' }}>Browse or drag and drop files</span>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                  </label>
                </div>

              </form>
            </div>

            {/* ── Footer ── */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button type="submit" form="createMaintForm" disabled={submitting}
                style={{ padding: '9px 24px', background: submitting ? '#93c5fd' : '#033A6D', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: '"Inter", sans-serif' }}>
                {submitting ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: '9px 24px', background: 'none', color: '#6b7280', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────── */
const Maintenance = () => {
  const navigate = useNavigate();
  const [requests, setRequests]   = useState([]);
  const [houses, setHouses]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);

  // filters
  const [statusFilter, setStatusFilter]   = useState('all');
  const [houseFilter, setHouseFilter]     = useState('all');
  const [search, setSearch]               = useState('');
  const [starredOnly, setStarredOnly]     = useState(false);

  // dropdown visibility
  const [statusOpen, setStatusOpen] = useState(false);
  const [rentalsOpen, setRentalsOpen] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    axios.get(`${backendUrl}${API.maintenance}`)
      .then(r => setRequests(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    axios.get(`${backendUrl}${API.houses}`)
      .then(r => setHouses(r.data.data || []))
      .catch(() => {});
  }, []);

  const toggleStar = async (id) => {
    // Optimistic update
    setRequests(prev => prev.map(r => r._id === id ? { ...r, starred: !r.starred } : r));
    try {
      await axios.put(`${backendUrl}${API.maintenance}/${id}/star`);
    } catch {
      // Revert on failure
      setRequests(prev => prev.map(r => r._id === id ? { ...r, starred: !r.starred } : r));
    }
  };

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (houseFilter !== 'all' && (r.house?._id || r.house) !== houseFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (starredOnly && !r.starred) return false;
    return true;
  });

  const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap' };

  return (
    <Layout>
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#f9fafb', fontFamily: '"Inter", sans-serif' }}
        onClick={() => { setStatusOpen(false); setRentalsOpen(false); }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Page header ────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#042238', margin: 0 }}>Maintenance</h1>
          <button
            onClick={() => setModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#033A6D', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = '#022a52'}
            onMouseLeave={e => e.currentTarget.style.background = '#033A6D'}
          >
            <svg viewBox="0 0 18 18" width="13" height="13" fill="currentColor">
              <path d="M9 16.7C13.3 16.7 16.7 13.3 16.7 9 16.7 4.7 13.3 1.3 9 1.3 4.7 1.3 1.3 4.7 1.3 9 1.3 13.3 4.7 16.7 9 16.7ZM9 18C4 18 0 14 0 9 0 4 4 0 9 0 14 0 18 4 18 9 18 14 14 18 9 18ZM9.8 8.2L12.2 8.2C12.6 8.2 13 8.6 13 9 13 9.4 12.6 9.8 12.2 9.8L9.8 9.8 9.8 12.2C9.8 12.6 9.4 13 9 13 8.6 13 8.2 12.6 8.2 12.2L8.2 9.8 5.8 9.8C5.4 9.8 5 9.4 5 9 5 8.6 5.4 8.2 5.8 8.2L8.2 8.2 8.2 5.8C8.2 5.4 8.6 5 9 5 9.4 5 9.8 5.4 9.8 5.8L9.8 8.2Z"/>
            </svg>
            Create Request
          </button>
        </div>

        {/* ── Filter bar ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
          onClick={e => e.stopPropagation()}>

          {/* All Status dropdown */}
          <div style={{ position: 'relative' }}>
            <button style={{ ...btnBase, background: statusFilter !== 'all' ? '#EEF3FA' : '#fff', color: statusFilter !== 'all' ? '#033A6D' : '#374151', borderColor: statusFilter !== 'all' ? '#c3d7f0' : '#e5e7eb' }}
              onClick={() => { setStatusOpen(o => !o); setRentalsOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {statusFilter === 'all' ? 'All Status' : STATUS_MAP[statusFilter]?.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {statusOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 30, minWidth: 160, overflow: 'hidden' }}>
                {[['all', 'All Status'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved'], ['closed', 'Closed']].map(([val, lbl]) => (
                  <button key={val} onClick={() => { setStatusFilter(val); setStatusOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, background: statusFilter === val ? '#EEF3FA' : 'transparent', color: statusFilter === val ? '#033A6D' : '#374151', border: 'none', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontWeight: statusFilter === val ? 700 : 400 }}>
                    {lbl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rentals dropdown */}
          <div style={{ position: 'relative' }}>
            <button style={{ ...btnBase, background: houseFilter !== 'all' ? '#EEF3FA' : '#fff', color: houseFilter !== 'all' ? '#033A6D' : '#374151', borderColor: houseFilter !== 'all' ? '#c3d7f0' : '#e5e7eb' }}
              onClick={() => { setRentalsOpen(o => !o); setStatusOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {houseFilter === 'all' ? 'Rentals' : (houses.find(h => h._id === houseFilter)?.address || 'Rental')}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {rentalsOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 30, minWidth: 220, overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
                <button onClick={() => { setHouseFilter('all'); setRentalsOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, background: houseFilter === 'all' ? '#EEF3FA' : 'transparent', color: houseFilter === 'all' ? '#033A6D' : '#374151', border: 'none', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontWeight: houseFilter === 'all' ? 700 : 400 }}>
                  All Rentals
                </button>
                {houses.map(h => (
                  <button key={h._id} onClick={() => { setHouseFilter(h._id); setRentalsOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, background: houseFilter === h._id ? '#EEF3FA' : 'transparent', color: houseFilter === h._id ? '#033A6D' : '#374151', border: 'none', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontWeight: houseFilter === h._id ? 700 : 400 }}>
                    {h.address}{h.city ? `, ${h.city}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Starred toggle */}
          <button
            style={{ ...btnBase, background: starredOnly ? '#FFFBEB' : '#fff', color: starredOnly ? '#B45309' : '#374151', borderColor: starredOnly ? '#FDE68A' : '#e5e7eb' }}
            onClick={() => setStarredOnly(o => !o)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={starredOnly ? '#F59E0B' : 'none'} stroke={starredOnly ? '#F59E0B' : 'currentColor'} strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Starred
          </button>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', flex: 1, minWidth: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title…"
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', flex: 1, background: 'transparent', fontFamily: '"Inter", sans-serif' }}
            />
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="w-10 h-10 border-[3px] border-[#033A6D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#94A3B8">
                <path d="M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>No maintenance requests</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              {requests.length === 0
                ? 'Create a request to get started, or your tenants can submit from their portal.'
                : 'No requests match your current filters.'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Inter", sans-serif', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Date Added', 'Title', 'Rental', 'Last Activity', 'Status', ''].map(col => (
                    <th key={col} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => {
                  const st = STATUS_MAP[req.status] || STATUS_MAP.open;
                  const isStarred = !!req.starred;
                  const houseName = req.house?.address || req.house?.name || '—';
                  const houseCity = req.house?.city || '';
                  return (
                    <tr key={req._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s', cursor: 'pointer' }}
                      onClick={() => navigate(`/maintenance/${req._id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {fmtDate(req.createdAt)}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#042238' }}>{req.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{req.category}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                        {houseName}{houseCity ? `, ${houseCity}` : ''}
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{fmtDate(req.updatedAt)}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{fmtTime(req.updatedAt)}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, letterSpacing: '0.03em' }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button onClick={e => { e.stopPropagation(); toggleStar(req._id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isStarred ? '#F59E0B' : '#d1d5db', padding: 2, display: 'inline-flex', transition: 'color 0.15s' }} title={isStarred ? 'Unstar' : 'Star'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>{/* /maxWidth wrapper */}
      </main>

      {modal && (
        <CreateModal
          houses={houses}
          onClose={() => setModal(false)}
          onCreated={fetchRequests}
        />
      )}
    </Layout>
  );
};

export default Maintenance;
