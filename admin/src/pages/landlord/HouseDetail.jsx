import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Settings, Users, Home, DollarSign, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

/* ── Property type SVGs ─────────────────────────────────────── */
const TYPE_SVG = {
  SINGLE_FAMILY: (
    <svg width="56" height="56" viewBox="0 0 40 33" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M29.543 4.977h3.939v4.978h-1.969l-1.97-1.991ZM10.832 20.905h4.924v7.964h-4.924ZM20.68 20.905h8.863v3.982H20.68Z"/>
      <path fill="#042238" d="m20.495.166 7.837 5.881V4.23c0-.431.319-.787.73-.84l.104-.006h5a.84.84 0 0 1 .833.846l-.001 6.821 4.662 3.5c.647.484.309 1.526-.495 1.526l-4.167-.001v15.231h4.167c.425 0 .775.323.827.74l.006.107a.84.84 0 0 1-.833.846H.835a.84.84 0 0 1-.833-.846.84.84 0 0 1 .833-.846L5 31.307V16.076H.835c-.804 0-1.142-1.04-.495-1.526L19.505.166a.823.823 0 0 1 .99 0Z"/>
    </g></svg>
  ),
  TOWNHOUSE: (
    <svg width="56" height="56" viewBox="0 0 40 37" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M25.833 14.295c.92 0 1.667.754 1.667 1.682 0 .93-.746 1.682-1.667 1.682-.92 0-1.666-.753-1.666-1.682 0-.928.747-1.682 1.666-1.682ZM30 30.272v5.045h-3.333v-5.045ZM32 9h3v5h-3ZM8.167 11.632h-3v4l3-1ZM13.333 29.443v5.907H10v-5.907ZM13.333 18.81v3.454H10V18.81Z"/>
      <path fill="#042238" d="m18.884.21 11.949 10.61V8.409c0-.465.373-.841.834-.841H35c.46 0 .833.376.833.84v6.852l3.884 3.45c.346.306.38.838.075 1.186a.828.828 0 0 1-1.176.076L37.5 18.98v16.338h.834c.46 0 .834.377.834.841 0 .465-.373.841-.834.841H1.667a.837.837 0 0 1-.834-.84c0-.465.374-.842.834-.842H2.5V19.301l-1.233.758a.829.829 0 0 1-1.145-.28.845.845 0 0 1 .278-1.156l2.1-1.291v-.04l.067-.001 1.599-.982v-4.537c0-.464.374-.84.834-.84h3.333c.46 0 .834.376.834.84l-.001 1.466 10-6.143V2.701l-1.383-1.229a.846.846 0 0 1-.075-1.187.828.828 0 0 1 1.176-.075Z"/>
    </g></svg>
  ),
  CONDO: (
    <svg width="56" height="56" viewBox="0 0 33 40" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M7.5 39.167h5v-7.5h-5v7.5ZM5.833 15.833h5V12.5h-5v3.333Zm8.334 0h5V12.5h-5v3.333Zm8.333 0h5V12.5h-5v3.333ZM5.833 22.5h5v-3.333h-5V22.5Zm8.334 0h5v-3.333h-5V22.5Zm8.333 0h5v-3.333h-5V22.5Zm-1.667 16.667h5v-7.5h-5v7.5Z"/>
      <path fill="#042238" fillRule="nonzero" d="m16.695 0 .023.002a.837.837 0 0 1 .216.042l.043.016a.787.787 0 0 1 .135.069l9.554 6.033V4.167c0-.46.374-.834.834-.834h3.333c.46 0 .834.374.834.834l-.001 5.153 1.279.809a.833.833 0 0 1-.89 1.409l-.389-.247v27.042h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V11.292l-.388.246a.833.833 0 1 1-.89-1.41l15.834-10Z"/>
    </g></svg>
  ),
  MULTI_FAMILY: (
    <svg width="56" height="56" viewBox="0 0 40 33" fill="none"><g fillRule="nonzero">
      <path fill="#7FE3FF" d="M20 1.577V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H20Zm17.5 0V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H37.5ZM13.75 23.5v9.333h-5V23.5h5Zm17.5 0v9.333h-5V23.5h5Z"/>
      <path fill="#042238" d="m11.284 0 .024.002a.837.837 0 0 1 .107.014l.05.012a.655.655 0 0 1 .104.035l.059.028.071.04 4.134 2.646v-1.2c0-.46.373-.833.834-.833H20c.46 0 .833.373.833.833V4.89L28.269.132l.073-.042.061-.028a.886.886 0 0 1 .256-.06L28.69 0h.063l.025.002a.837.837 0 0 1 .256.06l.058.027.077.043 4.165 2.665v-1.22c0-.46.373-.833.834-.833H37.5c.46 0 .833.373.833.833v4.42l1.251.801c.356.228.48.68.307 1.052l-.054.1a.833.833 0 0 1-1.151.252l-.353-.226V32h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V7.955Z"/>
    </g></svg>
  ),
  APARTMENT: (
    <svg width="56" height="56" viewBox="0 0 31 40" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M17.222 33.333v5h-3.444v-5ZM26.337 1.667l1.722 1.666H2.94l1.722-1.666Z"/>
      <path fill="#042238" d="M26.693 0c.229 0 .448.088.609.244l3.444 3.333a.923.923 0 0 1 .091.103l.015.022a.783.783 0 0 1 .147.49v34.975c0 .46-.386.833-.862.833H.863c-.476 0-.861-.373-.861-.833L0 4.193a.789.789 0 0 1 .146-.49l.017-.023a.806.806 0 0 1 .09-.103L3.698.244A.876.876 0 0 1 4.307 0Zm2.583 5H1.724v33.333h10.331V32.5c0-.425.33-.775.754-.827l.108-.006h5.166c.476 0 .861.373.861.833v5.833h10.332V5Z"/>
    </g></svg>
  ),
  OTHER: (
    <svg width="56" height="56" viewBox="0 0 53 53" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M16.667 21.333C25.135 21.333 32 28.198 32 36.667 32 45.135 25.135 52 16.667 52 8.198 52 1.333 45.135 1.333 36.667c0-8.469 6.865-15.334 15.334-15.334Z"/>
      <path fill="#042238" d="M52.222 0c.614 0 1.111.497 1.111 1.111v6.667c0 .294-.117.577-.325.785l-1.897 1.895v2.875c0 .546-.393 1-.911 1.094l-.2.017h-2.876l-.457.458v2.876c0 .545-.393.999-.912 1.093l-.2.018H42.68l-.458.458v2.875c0 .546-.393 1-.911 1.093l-.2.018h-2.875l-6.416 6.418.251.573A16.53 16.53 0 0 1 33.333 36.667C33.333 45.872 25.872 53.333 16.667 53.333 7.46 53.333 0 45.873 0 36.667 0 27.462 7.462 20 16.667 20c2.201 0 4.346.435 6.345 1.264l.57.25L44.77.324c.167-.166.38-.275.61-.311L45.557 0Z"/>
    </g></svg>
  ),
};

const TABS = ['Overview', 'Tenants', 'Maintenance', 'Documents', 'Leases', 'Expenses'];

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

/* ── Create Maintenance Request Modal ───────────────────────── */
const CreateRequestModal = ({ house, onClose }) => {
  const [category, setCategory]       = useState('');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos]           = useState([]);
  const [preferredTime, setPreferredTime] = useState('ANYTIME');
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const [photoPreviews, setPhotoPreviews] = useState([]);

  const addFiles = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, { url: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    setPhotos(prev => [...prev, ...imageFiles]);
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handlePhotoInput = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('houseId', house._id);
      fd.append('category', category);
      fd.append('title', title);
      fd.append('description', description);
      fd.append('preferredTime', preferredTime);
      photos.forEach(f => fd.append('photos', f));

      await axios.post(`${backendUrl}${API.maintenance}`, fd);
      setSubmitted(true);
    } catch {
      // show generic error — keep modal open
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,34,56,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #e6e9f0',
          borderRadius: 4,
          minWidth: 544,
          maxWidth: 600,
          width: '100%',
          padding: 32,
          boxSizing: 'border-box',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: '"Inter", sans-serif',
          fontSize: 14,
          color: '#042238',
          lineHeight: 1.42857143,
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Success screen ─────────────────────────────────── */}
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            {/* Navy header with dotted arc */}
            <div style={{
              background: '#042238', borderRadius: '2px 2px 0 0',
              padding: '32px 32px 40px', position: 'relative', overflow: 'hidden',
              margin: '-32px -32px 0',
            }}>
              {/* Dotted arc SVG */}
              <svg
                style={{ position: 'absolute', left: -10, top: -10, opacity: 0.18 }}
                width="200" height="180" viewBox="0 0 200 180" fill="none"
              >
                {[30,50,70,90,110,130].map((r, i) => (
                  <path
                    key={i}
                    d={`M ${100 - r} 180 A ${r} ${r} 0 0 1 ${100 + r} 180`}
                    stroke="#4da6d0" strokeWidth="1.5" fill="none"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>
              {/* Green checkmark circle */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#10B981', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 6px rgba(16,185,129,0.25)',
                position: 'relative', zIndex: 1,
              }}>
                <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                  <path d="M2 10L9.5 17.5L24 2" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '28px 16px 24px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#042238', margin: '0 0 20px', lineHeight: 1.3 }}>
                Maintenance request<br />submitted!
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: '#033A6D', color: '#fff',
                  border: 'none', borderRadius: 24,
                  padding: '11px 36px', fontSize: 13,
                  fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: '"Inter", sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#022a52'}
                onMouseLeave={e => e.currentTarget.style.background = '#033A6D'}
              >
                Sounds good
              </button>
            </div>
          </div>
        ) : (
        <>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#042238', margin: 0 }}>Create Maintenance Request</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>Create a new maintenance request for your property.</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: '#9ca3af', fontSize: 20, lineHeight: 1 }}
            aria-label="Close"
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>

          {/* Property (read-only) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 6 }}>
              Property<span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
            </label>
            <button
              type="button"
              disabled
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: 4,
                background: '#f9fafb', color: '#374151', fontSize: 14,
                cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span>{house.address}{house.city ? `, ${house.city}` : ''}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#9ca3af">
                <path d="M2 4l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Section: Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e6e9f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#042238">
                <path d="M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z"/>
              </svg>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#042238', margin: 0 }}>Details</h4>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 6 }}>
              Category<span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', appearance: 'none', padding: '8px 36px 8px 12px',
                  border: '1px solid #d1d5db', borderRadius: 4,
                  background: '#fff', color: category ? '#042238' : '#9ca3af',
                  fontSize: 14, cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="" disabled>Select an option</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path d="M2 4l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 4 }}>
              Title<span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
              <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#9ca3af', marginLeft: 8, fontSize: 12 }}>
                e.g. "Leaky Kitchen Faucet"
              </span>
            </label>
            <input
              required
              maxLength={50}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: 4,
                fontSize: 14, color: '#042238', background: '#fff',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 4 }}>
              {title.length} / 50 characters used
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 4 }}>
              Description<span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
            </label>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              Add as much detail as possible, including the specific location and any troubleshooting you've already attempted.
            </p>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: 4,
                fontSize: 14, color: '#042238', background: '#fff',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Photos */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 4 }}>
              Photos
            </label>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Upload clear photos of the issue.</p>

            {/* Thumbnails row */}
            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {photoPreviews.map((p, idx) => (
                  <div
                    key={idx}
                    style={{ position: 'relative', width: 88, height: 88, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', border: 'none',
                        color: '#fff', fontSize: 11, lineHeight: 1,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                      }}
                      aria-label="Remove photo"
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handlePhotoDrop}
              style={{
                border: '2px dashed #c5d6e8', borderRadius: 4,
                padding: '22px 16px', textAlign: 'center',
                cursor: 'pointer', background: '#f8fbff',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7bafd4'; e.currentTarget.style.background = '#f0f7ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#c5d6e8'; e.currentTarget.style.background = '#f8fbff'; }}
            >
              <label htmlFor="mr-photos" style={{ cursor: 'pointer', display: 'block' }}>
                {/* Upload icon — monitor with up-arrow */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="24" height="16" rx="2" stroke="#4a90c4" strokeWidth="1.5" fill="none"/>
                    <line x1="8" y1="21" x2="18" y2="21" stroke="#4a90c4" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="13" y1="17" x2="13" y2="21" stroke="#4a90c4" strokeWidth="1.5" strokeLinecap="round"/>
                    <polyline points="9 10 13 6 17 10" stroke="#4a90c4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <line x1="13" y1="6" x2="13" y2="14" stroke="#4a90c4" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#4a90c4', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                  Click or drag to upload
                </p>
              </label>
              <input
                id="mr-photos"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoInput}
              />
            </div>
          </div>

          {/* Section: Scheduling */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e6e9f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#042238" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#042238', margin: 0 }}>Scheduling</h4>
          </div>

          {/* Preferred time */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#042238', marginBottom: 10 }}>
              Preferred time to enter<span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'ANYTIME', label: 'Anytime' },
                { value: 'COORDINATE', label: 'Coordinate a time first' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <div
                    onClick={() => setPreferredTime(value)}
                    style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${preferredTime === value ? '#033A6D' : '#ACB9C8'}`,
                      background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {preferredTime === value && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#033A6D' }} />
                    )}
                  </div>
                  <span style={{ fontSize: 14, color: '#042238' }} onClick={() => setPreferredTime(value)}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '12px 0',
              background: submitting ? '#6b9fd4' : '#033A6D',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              fontFamily: '"Inter", sans-serif',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#022a52'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#033A6D'; }}
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
};

/* Dot-pattern SVG path shared by both payment items */
const DOT_PATH = "M1.609 0c.206 0 .417.068.627.138.208.069.386.209.523.347.14.139.28.313.352.52.067.21.105.417.105.624 0 .21-.038.417-.105.591a1.394 1.394 0 0 1-.352.518c-.137.174-.315.28-.523.349a1.51 1.51 0 0 1-1.223 0 1.058 1.058 0 0 1-.524-.35 1.082 1.082 0 0 1-.351-.517A1.17 1.17 0 0 1 0 1.63c0-.207.036-.414.138-.624C.21.798.315.624.489.485.77.175 1.19 0 1.61 0m5.897 125.96a1.64 1.64 0 0 0-1.144.488 1.6 1.6 0 0 0 0 2.258 1.627 1.627 0 0 0 2.288 0 1.57 1.57 0 0 0-.034-2.258h.034a1.633 1.633 0 0 0-1.144-.488Zm83.407-1.732a1.668 1.668 0 0 0-1.52 1.81c.069.907.867 1.595 1.77 1.525.943-.075 1.63-.871 1.56-1.776-.075-.908-.801-1.56-1.666-1.56h-.144Zm-13.39.027a1.709 1.709 0 0 0-1.506 1.83c.108.897.896 1.578 1.792 1.472.934-.072 1.614-.863 1.508-1.793a1.644 1.644 0 0 0-1.651-1.509h-.143Zm-14.298-.046c-.073 0-.144 0-.217.04-.9.07-1.583.9-1.477 1.834.106.9.938 1.55 1.838 1.48a1.658 1.658 0 0 0 1.475-1.839 1.643 1.643 0 0 0-1.619-1.515Zm-14.187.037a1.72 1.72 0 0 0-1.437 1.903h.04c.103.897.966 1.542 1.863 1.4.896-.109 1.54-.972 1.396-1.869a1.66 1.66 0 0 0-1.649-1.434h-.213Zm-13.214.015c-.111 0-.216.035-.325.035-.907.177-1.486 1.032-1.304 1.922a1.679 1.679 0 0 0 1.953 1.32c.905-.181 1.522-1.036 1.34-1.961a1.694 1.694 0 0 0-1.664-1.316Zm82.467-.024a1.606 1.606 0 0 0-1.553 1.735h-.037c.075.939.867 1.662 1.772 1.591a1.716 1.716 0 0 0 1.59-1.773 1.662 1.662 0 0 0-1.662-1.553h-.11Zm-96.351-.015c-.18 0-.362.036-.54.073-.871.29-1.34 1.266-1.052 2.136a1.662 1.662 0 0 0 2.1 1.052c.87-.254 1.34-1.234 1.05-2.102a1.663 1.663 0 0 0-1.558-1.159Zm82.96-1.034c-.931.07-1.612.86-1.541 1.758.035.933.825 1.616 1.759 1.545.929-.037 1.613-.862 1.54-1.76-.07-.862-.79-1.543-1.65-1.543h-.108Zm27.363-.034a1.703 1.703 0 0 0-1.584 1.76c.071.935.828 1.618 1.764 1.58.902-.07 1.623-.824 1.552-1.759a1.636 1.636 0 0 0-1.657-1.58h-.075ZM8.095 83.08c-.788 0-1.508.573-1.65 1.4-.108.935.501 1.76 1.432 1.902a1.68 1.68 0 0 0 1.866-1.4c.143-.93-.5-1.757-1.395-1.902h-.253ZM1.61 13.936c.206 0 .417.034.627.105.208.069.386.208.523.348.318.315.457.734.457 1.154 0 .21-.038.42-.105.631-.073.174-.212.35-.352.522-.137.141-.315.244-.523.351-.384.14-.84.14-1.223 0-.21-.107-.384-.21-.524-.351a1.56 1.56 0 0 1-.351-.522 1.421 1.421 0 0 1-.138-.63c0-.454.176-.84.49-1.155.28-.313.699-.453 1.119-.453m0 13.4c.206 0 .417.038.627.107.208.104.386.211.523.351.14.174.28.349.352.525.067.21.105.42.105.63 0 .422-.14.842-.457 1.156-.556.596-1.676.596-2.27 0A1.65 1.65 0 0 1 0 28.95c0-.211.036-.42.138-.63.072-.177.177-.352.351-.526.281-.28.7-.458 1.12-.458m0 13.936c.206 0 .417.034.627.105.208.103.386.209.523.348.318.316.457.734.457 1.155 0 .21-.038.42-.105.631-.073.174-.212.348-.352.524-.137.141-.315.243-.523.35a1.862 1.862 0 0 1-1.223 0c-.21-.107-.384-.209-.524-.35a1.606 1.606 0 0 1-.351-.524A1.423 1.423 0 0 1 0 42.88c0-.42.176-.84.49-1.155.139-.14.313-.245.523-.348a1.62 1.62 0 0 1 .596-.105m0 13.4c.206 0 .417.036.627.105.208.103.386.21.523.348.318.315.457.736.457 1.154 0 .209-.038.42-.105.631a1.78 1.78 0 0 1-.352.522c-.137.141-.315.244-.523.351-.384.14-.84.14-1.223 0-.21-.107-.384-.21-.524-.351-.174-.14-.279-.348-.353-.522-.1-.21-.136-.422-.136-.63 0-.42.176-.84.49-1.155.28-.277.699-.453 1.119-.453m0 13.936c.206 0 .417.036.627.138.208.069.386.173.523.347.318.277.457.694.457 1.112 0 .206-.038.415-.105.622a1.41 1.41 0 0 1-.352.521 1.362 1.362 0 0 1-.523.345 1.494 1.494 0 0 1-1.223 0 1.362 1.362 0 0 1-.524-.345 1.11 1.11 0 0 1-.353-.521A1.409 1.409 0 0 1 0 70.205c0-.418.176-.835.49-1.112.28-.312.699-.485 1.119-.485m0 13.803c.206 0 .417.034.627.138.208.069.386.173.523.347.14.139.28.313.352.52.067.172.105.38.105.59 0 .242-.038.417-.105.625-.073.207-.212.38-.352.52-.137.14-.315.276-.523.347a1.51 1.51 0 0 1-1.223 0 1.366 1.366 0 0 1-.524-.347 1.124 1.124 0 0 1-.353-.52c-.1-.176-.136-.383-.136-.626 0-.208.036-.417.136-.59.074-.206.18-.38.353-.519.281-.312.7-.485 1.12-.485m0 13.936c.206 0 .417.07.627.138.208.07.386.21.523.349.318.31.457.693.457 1.142 0 .21-.038.417-.105.589a1.4 1.4 0 0 1-.352.519 1.37 1.37 0 0 1-.523.348 1.496 1.496 0 0 1-1.223 0 1.37 1.37 0 0 1-.524-.348 1.104 1.104 0 0 1-.353-.52A1.176 1.176 0 0 1 0 97.574c0-.449.176-.832.49-1.142.28-.31.699-.487 1.119-.487m0 13.936c.206 0 .417.038.627.107.208.07.386.21.523.35.14.139.28.315.352.526.067.174.105.385.105.63 0 .21-.038.422-.105.596-.073.211-.212.386-.352.527-.137.14-.315.28-.523.35a1.495 1.495 0 0 1-1.223 0 1.361 1.361 0 0 1-.524-.35 1.132 1.132 0 0 1-.353-.527 1.21 1.21 0 0 1-.136-.595c0-.457.176-.842.49-1.158.28-.316.699-.456 1.119-.456m0 13.936c.206 0 .417.068.627.138.208.069.386.209.523.347.318.311.457.694.457 1.144 0 .21-.038.417-.105.59a1.402 1.402 0 0 1-.352.519 1.058 1.058 0 0 1-.523.349 1.51 1.51 0 0 1-1.223 0 1.058 1.058 0 0 1-.524-.35 1.105 1.105 0 0 1-.353-.519c-.1-.172-.136-.379-.136-.59 0-.449.176-.832.49-1.143.28-.31.699-.485 1.119-.485m7.518 7.504c.21 0 .416.036.59.107.208.102.38.207.519.346.174.175.276.348.346.523.104.21.138.416.138.626 0 .207-.034.418-.138.626-.07.209-.172.382-.346.52a1.59 1.59 0 0 1-1.73.349 1.344 1.344 0 0 1-.521-.348 1.636 1.636 0 0 1-.481-1.147c0-.417.17-.835.48-1.15a1.69 1.69 0 0 1 1.143-.452";

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse]     = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab]         = useState('Overview');
  const [paymentView, setPaymentView]     = useState('Month');
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [houseRes, tenantsRes] = await Promise.all([
          axios.get(`${backendUrl}${API.houses}/${id}`),
          axios.get(`${backendUrl}${API.houses}/${id}/tenants`),
        ]);
        setHouse(houseRes.data.data);
        setTenants(tenantsRes.data.data || []);
      } catch {
        toast.error('Failed to load house details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const fetchMaintenance = () => {
    if (!id) return;
    setLoadingMaintenance(true);
    axios.get(`${backendUrl}${API.maintenance}?houseId=${id}`)
      .then(r => setMaintenanceRequests(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingMaintenance(false));
  };

  const toggleMaintenanceStar = async (reqId) => {
    setMaintenanceRequests(prev =>
      prev.map(r => r._id === reqId ? { ...r, starred: !r.starred } : r)
    );
    try {
      await axios.put(`${backendUrl}${API.maintenance}/${reqId}/star`);
    } catch {
      setMaintenanceRequests(prev =>
        prev.map(r => r._id === reqId ? { ...r, starred: !r.starred } : r)
      );
    }
  };

  useEffect(() => {
    if (id) fetchMaintenance();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  const received = useMemo(() =>
    tenants.filter(t => (t.balance || 0) >= 0).reduce((s, t) => s + (t.rentAmount || 0), 0),
  [tenants]);

  const pastDue = useMemo(() =>
    tenants.filter(t => (t.balance || 0) < 0).reduce((s, t) => s + Math.abs(t.balance || 0), 0),
  [tenants]);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-[#033A6D] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading property…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!house) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Home size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Property not found</p>
            <button onClick={() => navigate('/houses')} className="mt-4 text-sm text-[#033A6D] hover:underline">
              ← Back to properties
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const typeSvg      = TYPE_SVG[house.propertyType] || TYPE_SVG.SINGLE_FAMILY;
  const locationLine = [house.city, house.region, house.zipCode].filter(Boolean).join(', ');
  const shortId      = String(house._id).slice(-7).toUpperCase();

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50">

        {/* ── Sticky header ───────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">

          {/* Row 1 — breadcrumb bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center gap-2 text-xs text-gray-500">
              <button
                onClick={() => navigate('/houses')}
                className="inline-flex items-center gap-1.5 font-semibold text-gray-600 hover:text-[#033A6D] transition-colors"
              >
                <ArrowLeft size={12} strokeWidth={2.5} />
                Properties
              </button>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="font-medium text-gray-700 truncate max-w-[240px]">
                {house.address || house.name}
              </span>
              <span
                className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border ${
                  house.isOccupied
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-gray-500 bg-white border-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${house.isOccupied ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                {house.isOccupied ? 'OCCUPIED' : 'VACANT'}
              </span>
            </div>
          </div>

          {/* Row 2 — property identity + actions */}
          <div className="bg-white">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">

              {/* Left: icon + name/meta */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  {typeSvg}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
                    {house.address || house.name}
                  </h1>
                  {locationLine && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{locationLine}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-gray-400">
                      ID: <span className="font-semibold text-gray-600">{shortId}</span>
                    </span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span className="text-[11px] text-gray-400">
                      Rent: <span className="font-semibold text-gray-700">TZS {(house.rentAmount || 0).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                  <Settings size={13} strokeWidth={2} />
                  Settings
                </button>
                <Link
                  to="/tenants"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#033A6D] text-white px-4 py-2 rounded-lg hover:bg-[#022a52] transition-colors shadow-sm"
                >
                  <Users size={13} strokeWidth={2} />
                  Manage Tenants
                </Link>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="bg-white">
            <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'border-[#033A6D] text-[#033A6D]'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {tab === 'Maintenance' && maintenanceRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length > 0
                    ? `Maintenance (${maintenanceRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length})`
                    : tab}
                </button>
              ))}
              <div className="flex-1 border-b-2 border-transparent" />
            </div>
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────────── */}

        {/* ── Overview ─────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div className="max-w-xl mx-auto w-full px-5 py-6 space-y-4">

            {/* Stats row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex divide-x divide-gray-100">
                {[
                  {
                    label: 'TENANTS',
                    value: tenants.length,
                    href: '/tenants',
                    circleBg: '#4B7BE5',
                    icon: (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    ),
                  },
                  {
                    label: 'OCCUPIED',
                    value: house.isOccupied ? 'Yes' : 'No',
                    href: '#',
                    circleBg: house.isOccupied ? '#10B981' : '#94A3B8',
                    icon: (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    ),
                  },
                  {
                    label: 'MONTHLY RENT',
                    value: `TZS ${(house.rentAmount || 0).toLocaleString()}`,
                    href: '#',
                    circleBg: '#F59E0B',
                    icon: (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    ),
                  },
                ].map(({ label, value, href, circleBg, icon }) => (
                  <Link key={label} to={href} className="flex-1 flex flex-col items-center py-6 px-3 hover:bg-gray-50/80 transition-colors group">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: circleBg }}
                    >
                      {icon}
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Payments card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-[#033A6D] via-blue-400 to-transparent" />
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#033A6D]/10 flex items-center justify-center">
                    <DollarSign size={14} className="text-[#033A6D]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {paymentView === 'Year'
                      ? `${new Date().getFullYear()} Payments`
                      : `${monthName} Payments`}
                  </h3>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {['Month', 'Year'].map(v => (
                    <button
                      key={v}
                      onClick={() => setPaymentView(v)}
                      className={`px-3 py-1 text-xs font-semibold transition-all ${
                        paymentView === v
                          ? 'bg-[#033A6D] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex divide-x divide-gray-100 border-t border-gray-100">
                {/* Received */}
                <a href="#!" className="flex-1 flex flex-col px-5 pt-4 pb-5 bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">Received</span>
                  <span className="text-lg font-bold text-gray-900 mb-3">TZS {received.toLocaleString()}</span>
                  <div className="mt-auto flex justify-end">
                    <svg viewBox="0 0 134 134" width="52" height="52" fill="#10B981" fillOpacity="0.35">
                      <path fillRule="evenodd" d={DOT_PATH} />
                    </svg>
                  </div>
                </a>
                {/* Past due */}
                <a href="#!" className="flex-1 flex flex-col px-5 pt-4 pb-5 bg-red-50/60 hover:bg-red-50 transition-colors">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">Past due</span>
                  <span className="text-lg font-bold text-gray-900 mb-3">TZS {pastDue.toLocaleString()}</span>
                  <div className="mt-auto flex justify-end">
                    <svg viewBox="0 0 134 134" width="52" height="52" fill="#EF4444" fillOpacity="0.35">
                      <path fillRule="evenodd" d={DOT_PATH} />
                    </svg>
                  </div>
                </a>
              </div>
              <div className="border-t border-gray-100">
                <Link to="/tenants" className="flex items-center justify-center gap-1.5 w-full py-3 text-xs font-semibold text-[#033A6D] hover:bg-gray-50 transition-colors">
                  View Payments Dashboard
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Notes */}
            {house.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FileText size={14} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{house.description}</p>
              </div>
            )}

            {/* Leases card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-sky-400 via-blue-300 to-transparent" />
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <svg height="26" width="22" viewBox="0 0 42 50" fill="none">
                    <path fill="#7FE3FF" d="m21 48.03 1.212-6.06 13.334-12.121 4.848 4.848L27.06 46.819z"/>
                    <path d="m37.224 29.028 4.003 4.446c.553.614.514 1.55-.086 2.09L27.51 47.838c-.2.18-.445.3-.71.347l-5.578.998a1.515 1.515 0 0 1-1.711-1.9l1.575-5.444c.075-.259.22-.49.42-.67l13.631-12.274c.6-.54 1.535-.48 2.088.133ZM24.428.758a.92.92 0 0 1 .662.283l8.664 8.973.014.015a.951.951 0 0 1 .05.059l-.064-.074a.947.947 0 0 1 .23.4l.01.033a.93.93 0 0 1 .022.125l.007.111V25.64a.941.941 0 0 1-.93.951.941.941 0 0 1-.931-.951l-.001-14.005h-9.177a.941.941 0 0 1-.93-.952l-.001-8.022H2.255v42.966h13.51c.513 0 .93.426.93.952a.941.941 0 0 1-.93.951H1.324a.941.941 0 0 1-.931-.951V1.709c0-.525.417-.951.93-.951h23.104Zm-1.517 41.705-.05.046-1.36 4.702 4.817-.862.008-.008-3.415-3.878Zm9.756-8.784-8.358 7.526 3.414 3.878 8.358-7.525-3.414-3.88ZM14.25 36.653c.513 0 .93.426.93.952a.941.941 0 0 1-.93.952H7.1a.941.941 0 0 1-.93-.952c0-.526.417-.952.93-.952h7.15Zm21.864-6.076-2.05 1.844 3.404 3.866.01.013 2.093-1.884-3.457-3.84Zm-21.864.093c.513 0 .93.427.93.952a.941.941 0 0 1-.93.952H7.1a.941.941 0 0 1-.93-.952c0-.525.417-.952.93-.952h7.15Zm8.663-8.973c.514 0 .931.426.931.951a.941.941 0 0 1-.93.952H7.1a.941.941 0 0 1-.93-.952c0-.525.417-.951.93-.951h15.813Zm0-5.983c.514 0 .931.426.931.952a.941.941 0 0 1-.93.952H7.1a.941.941 0 0 1-.93-.952c0-.526.417-.952.93-.952h15.813ZM14.25 9.731c.513 0 .93.427.93.952a.941.941 0 0 1-.93.952H7.1a.941.941 0 0 1-.93-.952c0-.525.417-.952.93-.952h7.15Zm9.79-7.07h-.126v7.07h6.95l-6.825-7.07Z" fill="#042238" fillRule="nonzero"/>
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-900">Leases</h4>
                </div>
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#033A6D] border border-[#033A6D]/30 bg-[#033A6D]/5 px-3 py-1.5 rounded-lg hover:bg-[#033A6D] hover:text-white hover:border-[#033A6D] transition-all">
                  <svg height="12" width="12" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M9 16.7C13.3 16.7 16.7 13.3 16.7 9 16.7 4.7 13.3 1.3 9 1.3 4.7 1.3 1.3 4.7 1.3 9 1.3 13.3 4.7 16.7 9 16.7ZM9 18C4 18 0 14 0 9 0 4 4 0 9 0 14 0 18 4 18 9 18 14 14 18 9 18ZM9.8 8.2L12.2 8.2C12.6 8.2 13 8.6 13 9 13 9.4 12.6 9.8 12.2 9.8L9.8 9.8 9.8 12.2C9.8 12.6 9.4 13 9 13 8.6 13 8.2 12.6 8.2 12.2L8.2 9.8 5.8 9.8C5.4 9.8 5 9.4 5 9 5 8.6 5.4 8.2 5.8 8.2L8.2 8.2 8.2 5.8C8.2 5.4 8.6 5 9 5 9.4 5 9.8 5.4 9.8 5.8L9.8 8.2Z"/>
                  </svg>
                  New Lease
                </button>
              </div>

              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 mb-2">
                      DRAFT LEASE
                    </span>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {house.address}{house.city ? `, ${house.city}` : ''} — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Lease Term</p>
                    <p className="text-sm text-gray-400 font-medium">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Unpaid Charges</p>
                    <p className="text-sm font-bold text-gray-800">TZS 0</p>
                  </div>
                </div>
              </div>

              <Link to="/tenants" className="flex items-center justify-center gap-1.5 w-full py-3 text-xs font-semibold text-[#033A6D] hover:bg-gray-50 transition-colors">
                View All Leases
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* ── Maintenance card ──────────────────────────── */}
            {(() => {
              const activeReqs = maintenanceRequests.filter(r => r.status === 'open' || r.status === 'in_progress');
              return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-0.5 bg-gradient-to-r from-slate-400 via-slate-300 to-transparent" />

                  {/* Header */}
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#042238]/5 flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#042238">
                        <path d="M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Open Maintenance{activeReqs.length > 0 ? `: (${activeReqs.length})` : ''}
                    </h4>
                  </div>

                  {/* Body — list of active requests */}
                  <div className="px-5 pb-4 flex flex-col gap-2">
                    {activeReqs.length === 0 ? (
                      <p className="text-xs text-gray-400 py-1">No active maintenance requests.</p>
                    ) : (
                      activeReqs.slice(0, 5).map(req => {
                        const st = STATUS_MAP[req.status] || STATUS_MAP.open;
                        return (
                          <div
                            key={req._id}
                            className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors"
                            onClick={() => navigate(`/maintenance/${req._id}`)}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{req.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                Requested by {req.submittedBy === 'tenant' ? (req.tenant?.name || 'Tenant') : 'You'} in {house?.address || house?.name || ''}
                              </p>
                            </div>
                            <span
                              className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                            >
                              {st.label}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/60 flex items-center justify-center">
                    <button
                      onClick={() => setActiveTab('Maintenance')}
                      className="text-xs font-bold text-[#033A6D] tracking-wide uppercase hover:underline"
                    >
                      View All Maintenance
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ── Tenants tab ───────────────────────────────────────── */}
        {activeTab === 'Tenants' && (
          <div className="max-w-4xl mx-auto w-full px-5 py-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Tenants</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''} on this property</p>
                </div>
                <Link to="/tenants" className="inline-flex items-center gap-1 text-xs font-semibold text-[#033A6D] hover:underline">
                  Manage all
                  <ChevronRight size={13} />
                </Link>
              </div>
              {tenants.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Users size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">No tenants yet</p>
                  <p className="text-xs text-gray-300 mt-1">Tenants assigned to this property will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tenant</th>
                        <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                        <th className="text-right px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Rent</th>
                        <th className="text-right px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                        <th className="text-center px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Due Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#033A6D]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[#033A6D]">
                                  {(t.name || 'T').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <Link to={`/tenants/${t._id}`} className="font-semibold text-gray-800 hover:text-[#033A6D] transition-colors">
                                {t.name}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400 text-xs">{t.email}</td>
                          <td className="px-6 py-3.5 text-right font-medium text-gray-700">
                            {(t.rentAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              (t.balance || 0) < 0
                                ? 'text-red-700 bg-red-50'
                                : 'text-emerald-700 bg-emerald-50'
                            }`}>
                              {(t.balance || 0) < 0 ? '▼' : '▲'} {Math.abs(t.balance || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                              {t.rentDueDate || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Maintenance tab ──────────────────────────────────── */}
        {activeTab === 'Maintenance' && (
          <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-6">
            {/* Tab header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#042238', margin: 0, fontFamily: '"Inter", sans-serif' }}>Maintenance</h2>
              <button
                onClick={() => setShowCreateRequest(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#033A6D', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}
              >
                <svg viewBox="0 0 18 18" width="13" height="13" fill="currentColor">
                  <path d="M9 16.7C13.3 16.7 16.7 13.3 16.7 9 16.7 4.7 13.3 1.3 9 1.3 4.7 1.3 1.3 4.7 1.3 9 1.3 13.3 4.7 16.7 9 16.7ZM9 18C4 18 0 14 0 9 0 4 4 0 9 0 14 0 18 4 18 9 18 14 14 18 9 18ZM9.8 8.2L12.2 8.2C12.6 8.2 13 8.6 13 9 13 9.4 12.6 9.8 12.2 9.8L9.8 9.8 9.8 12.2C9.8 12.6 9.4 13 9 13 8.6 13 8.2 12.6 8.2 12.2L8.2 9.8 5.8 9.8C5.4 9.8 5 9.4 5 9 5 8.6 5.4 8.2 5.8 8.2L8.2 8.2 8.2 5.8C8.2 5.4 8.6 5 9 5 9.4 5 9.8 5.4 9.8 5.8L9.8 8.2Z"/>
                </svg>
                Create Request
              </button>
            </div>

            {loadingMaintenance ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
                <div className="w-8 h-8 border-[3px] border-[#033A6D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : maintenanceRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center py-14 px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-5 shadow-inner">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#94A3B8">
                    <path d="M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z"/>
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-800 mb-2">No Maintenance Requests Yet</h2>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
                  Your tenants can submit a maintenance request from their portal. Or you can create one yourself.
                </p>
                <button
                  onClick={() => setShowCreateRequest(true)}
                  className="inline-flex items-center gap-2 bg-[#033A6D] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#022a52] transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 18 18" width="13" height="13" fill="currentColor">
                    <path d="M9 16.7C13.3 16.7 16.7 13.3 16.7 9 16.7 4.7 13.3 1.3 9 1.3 4.7 1.3 1.3 4.7 1.3 9 1.3 13.3 4.7 16.7 9 16.7ZM9 18C4 18 0 14 0 9 0 4 4 0 9 0 14 0 18 4 18 9 18 14 14 18 9 18ZM9.8 8.2L12.2 8.2C12.6 8.2 13 8.6 13 9 13 9.4 12.6 9.8 12.2 9.8L9.8 9.8 9.8 12.2C9.8 12.6 9.4 13 9 13 8.6 13 8.2 12.6 8.2 12.2L8.2 9.8 5.8 9.8C5.4 9.8 5 9.4 5 9 5 8.6 5.4 8.2 5.8 8.2L8.2 8.2 8.2 5.8C8.2 5.4 8.6 5 9 5 9.4 5 9.8 5.4 9.8 5.8L9.8 8.2Z"/>
                  </svg>
                  Create Request
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Inter", sans-serif' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {['Date Added', 'Title', 'Last Activity', 'Status', ''].map(col => (
                        <th key={col} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.map(req => {
                      const st = STATUS_MAP[req.status] || STATUS_MAP.open;
                      return (
                        <tr key={req._id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' }}
                          onClick={() => navigate(`/maintenance/${req._id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#042238' }}>{req.title}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{req.category}</div>
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 13, color: '#6b7280' }}>{new Date(req.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(req.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '')}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, letterSpacing: '0.03em' }}>
                              {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <button
                              onClick={e => { e.stopPropagation(); toggleMaintenanceStar(req._id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: req.starred ? '#F59E0B' : '#d1d5db', padding: 2, display: 'inline-flex', transition: 'color 0.15s' }}
                              title={req.starred ? 'Unstar' : 'Star'}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill={req.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
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
          </div>
        )}

        {/* ── Placeholder tabs ─────────────────────────────────── */}
        {['Documents', 'Leases', 'Expenses'].includes(activeTab) && (
          <div className="max-w-4xl mx-auto w-full px-5 py-10">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">{activeTab}</p>
              <p className="text-xs text-gray-300 mt-1">This section is coming soon.</p>
            </div>
          </div>
        )}

      </div>

      {/* ── Create Request Modal ─────────────────────────────── */}
      {showCreateRequest && house && (
        <CreateRequestModal
          house={house}
          onClose={() => { setShowCreateRequest(false); fetchMaintenance(); }}
        />
      )}
    </Layout>
  );
};

export default HouseDetail;
