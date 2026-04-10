import { useEffect, useState, useMemo, useRef } from 'react';
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

const TABS = ['Overview', 'Tenants', 'Maintenance', 'Documents', 'Reminders'];

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
          minWidth: 0,
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

/* ── Documents Tab ───────────────────────────────────────────────────────── */
const DocumentsTab = ({ houseId, backendUrl }) => {
  const [docTab, setDocTab]           = useState('property');
  const [docs, setDocs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [pickedFile, setPickedFile]   = useState(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocs = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rental_token');
      const res = await axios.get(`${backendUrl}/api/landlord/houses/${houseId}/documents?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      setDocs(res.data.data || []);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(docTab); }, [docTab, houseId]);

  const openUpload = () => { setPickedFile(null); setDescription(''); setUploadOpen(true); };
  const closeUpload = () => { setUploadOpen(false); setPickedFile(null); setDescription(''); };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setPickedFile(f); };
  const handleFileInput = (e) => { const f = e.target.files[0]; if (f) setPickedFile(f); };

  const handleSave = async () => {
    if (!pickedFile) { toast.error('Please select a file'); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem('rental_token');
      const fd = new FormData();
      fd.append('file', pickedFile);
      fd.append('description', description);
      fd.append('type', docTab);
      await axios.post(`${backendUrl}/api/landlord/houses/${houseId}/documents`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      closeUpload();
      fetchDocs(docTab);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const token = localStorage.getItem('rental_token');
      await axios.delete(`${backendUrl}/api/landlord/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
      setDocs(prev => prev.filter(d => d._id !== docId));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = docs.filter(d => (d.originalName || d.fileName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', padding: '24px 20px', boxSizing: 'border-box' }}>
      {/* Tabs */}
      <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 0, minWidth: 'max-content' }}>
        {[{ key: 'property', label: 'Property documents' }, { key: 'lease', label: 'Lease documents' }].map(t => (
          <button key={t.key} onClick={() => setDocTab(t.key)}
            style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: docTab === t.key ? '#042238' : '#6b7280', borderBottom: docTab === t.key ? '2px solid #042238' : '2px solid transparent', marginBottom: -2 }}
          >{t.label}</button>
        ))}
      </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
          <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '6px 30px 6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={openUpload}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#e3eaf2', color: '#042238', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
          New
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#042238', letterSpacing: '0.06em' }}>FILE NAME</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#042238', letterSpacing: '0.06em' }}>DESCRIPTION</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#042238', letterSpacing: '0.06em' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>DATE UPLOADED
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
                </span>
              </th>
              <th style={{ padding: '10px 16px', width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#d1d5db" style={{ display: 'block', margin: '0 auto 8px' }}>
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5m0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5M7 19h14v-2H7zm0-6h14v-2H7zm0-8v2h14V5z"/>
                  </svg>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>No data to show</span>
                </td>
              </tr>
            ) : filtered.map(doc => (
              <tr key={doc._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 16px' }}>
                  <a href={`${backendUrl}${doc.filePath}`} target="_blank" rel="noreferrer"
                    style={{ color: '#042238', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>
                    {doc.originalName || doc.fileName}
                  </a>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{doc.description || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(doc._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'inline-flex', alignItems: 'center' }}
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal */}
      {uploadOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, width: 520, maxWidth: '92vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#042238' }}>Upload document</h2>
              <button onClick={closeUpload} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              {/* Drop zone */}
              {!pickedFile ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{ border: `2px dashed ${dragOver ? '#042238' : '#9aafbc'}`, borderRadius: 8, padding: '36px 24px', textAlign: 'center', background: dragOver ? '#eef2f6' : '#f8faff', marginBottom: 16, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ width: 48, height: 56, background: '#d6e3ec', borderRadius: 6, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#042238"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  </div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: '#374151' }}>Drag your file here</p>
                  <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: 13 }}>────────── OR ──────────</p>
                  <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={{ border: '1px solid #042238', background: '#fff', color: '#042238', borderRadius: 6, padding: '6px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Browse files
                  </button>
                  <input ref={fileInputRef} type="file" hidden onChange={handleFileInput}
                    accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.csv,.png,.jpg,.jpeg,.eml,.txt" />
                </div>
              ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: '#f9fafb' }}>
                  <svg width="28" height="32" viewBox="0 0 24 24" fill="#6b7280"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  <span style={{ flex: 1, fontSize: 13, color: '#374151', wordBreak: 'break-all' }}>{pickedFile.name}</span>
                  <button onClick={() => setPickedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0a.996.996 0 0 1 0-1.41L10.59 12 7.7 9.11a.996.996 0 0 1 0-1.41c.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41"/></svg>
                  </button>
                </div>
              )}
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#9ca3af' }}>Supported documents: pdf, xls(x), doc(x), ppt(x), csv, png, jpg, eml, etc</p>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 6 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={256}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#f9fafb' }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 24px 20px', borderTop: '1px solid #f3f4f6' }}>
              <button disabled={uploading} onClick={handleSave}
                style={{ padding: '8px 28px', background: '#042238', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >{uploading ? 'Uploading…' : 'Save'}</button>
              <button onClick={closeUpload}
                style={{ padding: '8px 20px', background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Reminders Section ───────────────────────────────────────────────────── */
const REMINDER_CATEGORIES = ['Rent'];

const RemindersSection = ({ houseId, houseName, backendUrl: bUrl }) => {
  const [reminders, setReminders]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [reminderTab, setReminderTab]     = useState('Reminders');
  const [filterOpen, setFilterOpen]       = useState(false);
  const [filterPos, setFilterPos]         = useState({ top: 0, left: 0 });
  const [statusFilters, setStatusFilters] = useState({ complete: true, upcoming: true, overdue: true });
  const [addOpen, setAddOpen]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [form, setForm]                   = useState({ dateTime: '', category: 'Rent', notes: '' });

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${bUrl}/api/landlord/houses/${houseId}/reminders`);
      setReminders(data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchReminders(); }, [houseId]);

  const filtered = reminders.filter(r => statusFilters[r.status]);

  const toggleFilter = (key) => setStatusFilters(p => ({ ...p, [key]: !p[key] }));
  const allSelected = Object.values(statusFilters).every(Boolean);
  const toggleAll = () => {
    const next = !allSelected;
    setStatusFilters({ complete: next, upcoming: next, overdue: next });
  };

  const handleSave = async () => {
    if (!form.dateTime) return toast.error('Date & Time is required');
    try {
      setSaving(true);
      await axios.post(`${bUrl}/api/landlord/houses/${houseId}/reminders`, form);
      toast.success('Reminder added');
      setAddOpen(false);
      setForm({ dateTime: '', category: 'Rent', notes: '' });
      fetchReminders();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleMarkComplete = async (r) => {
    try {
      await axios.put(`${bUrl}/api/landlord/reminders/${r._id}`, { status: 'complete' });
      fetchReminders();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (r) => {
    try {
      await axios.delete(`${bUrl}/api/landlord/reminders/${r._id}`);
      fetchReminders();
    } catch { toast.error('Failed to delete'); }
  };

  const STATUS_CHIP = {
    upcoming: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'Upcoming' },
    overdue:  { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Overdue' },
    complete: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', label: 'Complete' },
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'visible' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 0, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          {['Reminders', 'Recurring reminders'].map(t => (
            <button key={t} onClick={() => setReminderTab(t)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: reminderTab === t ? 700 : 400, background: reminderTab === t ? '#042238' : '#fff', color: reminderTab === t ? '#fff' : '#6b7280', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Filter button */}
          <button
            onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setFilterPos({ top: r.bottom + 4, left: r.left });
              setFilterOpen(v => !v);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.25 5.66a.5.5 0 0 1 .5-.5h14.5a.5.5 0 0 1 .35.86L13.5 12v6.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V12L4.25 6.52a.5.5 0 0 1-.1-.3l.1-.56Z"/></svg>
            Filter
          </button>
          {/* + New */}
          <button
            onClick={() => setAddOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#042238', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
            New
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', minHeight: 100 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="w-7 h-7 border-[3px] border-[#042238] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 10 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#d1d5db">
              <path d="M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"/>
            </svg>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>No reminders</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((r, i) => {
              const chip = STATUS_CHIP[r.status] || STATUS_CHIP.upcoming;
              const dt = new Date(r.dateTime);
              const dateStr = dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              return (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#042238' }}>{r.category}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{dateStr} · {timeStr}{r.notes ? ` · ${r.notes}` : ''}</div>
                  </div>
                  <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: chip.bg, color: chip.color, border: `1px solid ${chip.border}` }}>{chip.label}</span>
                  {r.status !== 'complete' && (
                    <button onClick={() => handleMarkComplete(r)} title="Mark complete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0, display: 'inline-flex' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </button>
                  )}
                  <button onClick={() => handleDelete(r)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0, display: 'inline-flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter dropdown (fixed) */}
      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 490 }} />
          <div style={{ position: 'fixed', top: filterPos.top, left: filterPos.left, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, minWidth: 180, padding: '6px 0' }}>
            <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#042238' }}>Status</span>
              <button onClick={toggleAll} style={{ background: 'none', border: 'none', fontSize: 11, color: '#042238', cursor: 'pointer', fontWeight: 600 }}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {[['complete','Complete'],['upcoming','Upcoming'],['overdue','Overdue']].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                <input type="checkbox" checked={statusFilters[key]} onChange={() => toggleFilter(key)} style={{ accentColor: '#042238' }} />
                {label}
              </label>
            ))}
          </div>
        </>
      )}

      {/* Add Reminder Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: '"Inter",sans-serif', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#042238' }}>Add reminder</span>
              <button onClick={() => setAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'inline-flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            {/* Modal body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Property (readonly) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Property</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb', borderRadius: 6, padding: '9px 12px', background: '#f9fafb', cursor: 'default' }}>
                  <span style={{ fontSize: 13, color: '#042238', fontWeight: 500 }}>{houseName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </div>
              </div>
              {/* Date&Time + Category side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.dateTime}
                    onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))}
                    lang="en-GB"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    {REMINDER_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Notes */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add any notes here..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              {/* Recurring (PRO) */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#042238' }}>Is this a recurring reminder?</span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="radio" name="recurring" value="yes" style={{ accentColor: '#042238' }} />
                    Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="radio" name="recurring" value="no" defaultChecked style={{ accentColor: '#042238' }} />
                    No
                  </label>
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setAddOpen(false)} style={{ padding: '8px 20px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '8px 22px', background: '#042238', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse]     = useState(null);
  const [tenants, setTenants] = useState([]);
  const [lease, setLease]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab]         = useState('Overview');
  const [paymentView, setPaymentView]     = useState('Month');
  const [payExpTab, setPayExpTab]         = useState('Payments');
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  /* ── Edit lease dropdown ── */
  const [editLeaseDropdown, setEditLeaseDropdown] = useState(false);

  /* ── Link tenant modal state ── */
  const [linkModalOpen, setLinkModalOpen]   = useState(false);
  const [linkView, setLinkView]             = useState('select'); // 'select' | 'new'
  const [allTenants, setAllTenants]         = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [savingLink, setSavingLink]         = useState(false);
  const [newTenant, setNewTenant] = useState({
    firstName: '', lastName: '', email: '', phone: '', notes: '',
  });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [pendingTenantData, setPendingTenantData] = useState(null);
  const [tenantMenuOpenId, setTenantMenuOpenId] = useState(null);
  const [tenantMenuPos, setTenantMenuPos] = useState({ top: 0, left: 0 });
  const [tenantMenuItems, setTenantMenuItems] = useState([]);
  const [invitingExistingTenant, setInvitingExistingTenant] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [houseRes, tenantsRes, leaseRes] = await Promise.all([
          axios.get(`${backendUrl}${API.houses}/${id}`),
          axios.get(`${backendUrl}${API.houses}/${id}/tenants`),
          axios.get(`${backendUrl}/api/landlord/houses/${id}/lease`).catch(() => ({ data: { data: null } })),
        ]);
        setHouse(houseRes.data.data);
        setTenants(tenantsRes.data.data || []);
        setLease(leaseRes.data.data || null);
      } catch {
        toast.error('Failed to load house details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  /* ── Due date helpers ── */
  const getNextDueDate = (paymentDay) => {
    const now = new Date();
    let yr = now.getFullYear(), mo = now.getMonth();
    const day = paymentDay === 31 ? new Date(yr, mo + 1, 0).getDate() : paymentDay;
    let due = new Date(yr, mo, day);
    if (due < now) {
      const nm = mo + 1 > 11 ? 0 : mo + 1;
      const ny = mo + 1 > 11 ? yr + 1 : yr;
      const d2 = paymentDay === 31 ? new Date(ny, nm + 1, 0).getDate() : paymentDay;
      due = new Date(ny, nm, d2);
    }
    return due;
  };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const fmtDueDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  const nextDueDate = lease ? getNextDueDate(lease.paymentDay) : null;
  const isOverdue   = nextDueDate ? new Date() > nextDueDate : false;

  /* ── Open link modal and fetch all tenants ── */
  const openLinkModal = async () => {
    setLinkModalOpen(true);
    setLinkView('select');
    setSelectedTenantId(null);
    setNewTenant({ tenantType: 'Person', firstName: '', lastName: '', email: '', phone: '', notes: '' });
    setLoadingTenants(true);
    try {
      const token = localStorage.getItem('rental_token');
      const res = await axios.get(`${backendUrl}/api/landlord/tenants`, { headers: { Authorization: `Bearer ${token}` } });
      setAllTenants(res.data.data || []);
    } catch { setAllTenants([]); }
    finally { setLoadingTenants(false); }
  };

  const closeLinkModal = () => { setLinkModalOpen(false); setSelectedTenantId(null); };

  const handleSaveLinked = async () => {
    if (!lease) return;
    setSavingLink(true);
    try {
      const token = localStorage.getItem('rental_token');
      const res = await axios.put(`${backendUrl}/api/landlord/leases/${lease._id}/tenant`,
        { tenantId: selectedTenantId }, { headers: { Authorization: `Bearer ${token}` } });
      setLease(res.data.data);
      toast.success('Tenant linked to lease');
      closeLinkModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to link tenant');
    } finally { setSavingLink(false); }
  };

  const handleSaveNewTenant = () => {
    if (!lease) return;
    const { firstName, email } = newTenant;
    if (!firstName) { toast.error('First name is required'); return; }
    if (!email) { toast.error('Email is required'); return; }
    // Close link modal, show invite choice
    setLinkModalOpen(false);
    setPendingTenantData({ ...newTenant });
    setInviteModalOpen(true);
  };

  const handleInviteChoice = async (sendInvite) => {
    if (!lease || !pendingTenantData) return;
    setSavingLink(true);
    try {
      const token = localStorage.getItem('rental_token');
      const res = await axios.post(
        `${backendUrl}/api/landlord/leases/${lease._id}/tenant`,
        { ...pendingTenantData, sendInvite },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLease(res.data.data.lease);
      toast.success(sendInvite ? 'Tenant created and invite sent' : 'Tenant created and linked');
      setInviteModalOpen(false);
      setPendingTenantData(null);
      setSelectedTenantId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create tenant');
      setInviteModalOpen(false);
    } finally { setSavingLink(false); }
  };

  const ntChange = (field, val) => setNewTenant(prev => ({ ...prev, [field]: val }));

  const handleUnlinkTenant = async () => {
    if (!lease) return;
    try {
      const token = localStorage.getItem('rental_token');
      const res = await axios.put(
        `${backendUrl}/api/landlord/leases/${lease._id}/tenant`,
        { tenantId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLease(res.data.data);
      toast.success('Tenant unlinked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unlink tenant');
    }
  };

  const openExistingInviteModal = (tenant) => {
    setInvitingExistingTenant(tenant);
    setInviteModalOpen(true);
  };

  const handleSendExistingInvite = async () => {
    if (!invitingExistingTenant) return;
    setSavingLink(true);
    try {
      const token = localStorage.getItem('rental_token');
      await axios.post(
        `${backendUrl}/api/landlord/tenants/${invitingExistingTenant._id}/invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Invite sent');
      setInviteModalOpen(false);
      setInvitingExistingTenant(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invite');
    } finally { setSavingLink(false); }
  };

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
                <div className="w-14 h-14 rounded-2xl border border-gray-200 shadow-sm flex-shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                  {house.photo
                    ? <img src={`${backendUrl}${house.photo}`} alt={house.name} className="w-full h-full object-cover" />
                    : typeSvg
                  }
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
          <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '24px 20px 40px', boxSizing: 'border-box' }}>

            {/* ── Two action cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

              {/* Left: Rent overview (if lease) or Add lease */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {lease ? (
                  <>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#042238' }}>Rent overview</span>
                      {isOverdue && (
                        <span style={{ border: '1px solid #ef4444', color: '#ef4444', borderRadius: 100, padding: '1px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>OVERDUE</span>
                      )}
                      {/* Edit lease button group */}
                      <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'visible' }}>
                        <button
                          onClick={() => navigate(`/houses/${id}/create-lease`)}
                          style={{ padding: '5px 14px', background: '#f9fafb', border: 'none', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', borderRadius: '6px 0 0 6px' }}
                        >Edit lease</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditLeaseDropdown(p => !p); }}
                          style={{ padding: '5px 8px', background: '#f9fafb', border: 'none', borderLeft: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '0 6px 6px 0' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#374151"><path d="m7 10 5 5 5-5z"/></svg>
                        </button>
                        {editLeaseDropdown && (
                          <div
                            onClick={() => setEditLeaseDropdown(false)}
                            style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 210, padding: '4px 0' }}
                          >
                            {['Schedule rent change', 'View lease history'].map(opt => (
                              <button key={opt}
                                onClick={() => toast.info(`${opt} — coming soon`)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 14, color: '#374151', cursor: 'pointer', textAlign: 'left' }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#042238">
                                  {opt === 'Schedule rent change'
                                    ? <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    : <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z"/>
                                  }
                                </svg>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Amount */}
                    <p style={{ fontSize: 26, fontWeight: 700, color: '#042238', margin: '0 0 4px', fontFamily: '"Inter", sans-serif' }}>
                      TZS {lease.rentAmount.toLocaleString()}
                    </p>
                    {/* Due date */}
                    <span style={{ fontSize: 12, color: '#1565c0' }}>Due {fmtDueDate(nextDueDate)}</span>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#9ca3af">
                          <path d="m18.85 10.39 1.06-1.06c.78-.78.78-2.05 0-2.83L18.5 5.09c-.78-.78-2.05-.78-2.83 0l-1.06 1.06zm-5.66-2.83L4 16.76V21h4.24l9.19-9.19zM19 17.5c0 2.19-2.54 3.5-5 3.5-.55 0-1-.45-1-1s.45-1 1-1c1.54 0 3-.73 3-1.5 0-.47-.48-.87-1.23-1.2l1.48-1.48c1.07.63 1.75 1.47 1.75 2.68M4.58 13.35C3.61 12.79 3 12.06 3 11c0-1.8 1.89-2.63 3.56-3.36C7.59 7.18 9 6.56 9 6c0-.41-.78-1-2-1-1.26 0-1.8.61-1.83.64-.35.41-.98.46-1.4.12-.41-.34-.49-.95-.15-1.38C3.73 4.24 4.76 3 7 3s4 1.32 4 3c0 1.87-1.93 2.72-3.64 3.47C6.42 9.88 5 10.5 5 11c0 .31.43.6 1.07.86z"/>
                        </svg>
                      </div>
                      <button
                        onClick={() => navigate(`/houses/${id}/create-lease`)}
                        style={{ background: '#042238', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >Add lease</button>
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                      Start by adding your lease and start tracking your rent payments.<br/>No document upload needed.
                    </span>
                  </>
                )}
              </div>

              {/* Right: Tenants section */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#042238' }}>
                    Tenants ({lease?.tenant ? 1 : 0})
                  </span>
                  <button
                    disabled={!lease}
                    onClick={lease ? openLinkModal : undefined}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: lease ? '#042238' : '#e5e7eb', color: lease ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 13, fontWeight: 600, cursor: lease ? 'pointer' : 'not-allowed' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                    New
                  </button>
                </div>

                {lease?.tenant ? (
                  <>
                    {/* Tenant row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fde8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#c05a3a' }}>
                            {(lease.tenant.name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#042238' }}>{lease.tenant.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{lease.tenant.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {lease.tenant.portalActivated
                          ? <span style={{ border: '1px solid #16a34a', color: '#16a34a', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>ACTIVE</span>
                          : <span style={{ border: '1px solid #f59e0b', color: '#d97706', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>NOT INVITED</span>
                        }
                        <div>
                          <button
                            onClick={e => {
                              const menuKey = `ov-${lease.tenant._id}`;
                              if (tenantMenuOpenId === menuKey) { setTenantMenuOpenId(null); return; }
                              const r = e.currentTarget.getBoundingClientRect();
                              setTenantMenuPos({ top: r.bottom + 4, left: r.right - 168 });
                              setTenantMenuItems([
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"/></svg>, label: 'Send email', color: '#374151', onClick: () => { window.location.href = `mailto:${lease.tenant.email}`; setTenantMenuOpenId(null); } },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>, label: 'Invite tenant', color: '#374151', onClick: () => { setTenantMenuOpenId(null); openExistingInviteModal(lease.tenant); } },
                                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z"/></svg>, label: 'Un-link tenant', color: '#ef4444', onClick: () => { setTenantMenuOpenId(null); handleUnlinkTenant(); } },
                              ]);
                              setTenantMenuOpenId(menuKey);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#9ca3af', borderRadius: 4 }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('Tenants')} style={{ background: 'none', border: 'none', color: '#042238', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px 0 0', display: 'block' }}>View all</button>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0 4px', gap: 6 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#d1d5db"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m-9-2V7H4v3H1v2h3v3h2v-3h3v-2zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"/></svg>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>No tenant linked yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Payments / Expenses card ── */}
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                {['Payments', 'Expenses'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPayExpTab(tab)}
                    style={{
                      padding: '12px 20px',
                      fontSize: 14,
                      fontWeight: payExpTab === tab ? 600 : 400,
                      color: payExpTab === tab ? '#042238' : '#6b7280',
                      background: 'none',
                      border: 'none',
                      borderBottom: payExpTab === tab ? '2px solid #042238' : '2px solid transparent',
                      cursor: 'pointer',
                      marginBottom: -1,
                    }}
                  >{tab}</button>
                ))}
              </div>

              {/* Payments tab – empty state */}
              {payExpTab === 'Payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                  <svg width="56" height="64" viewBox="0 0 56 64" fill="none" style={{ marginBottom: 16 }}>
                    <rect x="4" y="4" width="48" height="56" rx="5" fill="#e5e7eb"/>
                    <rect x="12" y="16" width="22" height="3" rx="1.5" fill="#d1d5db"/>
                    <rect x="12" y="24" width="32" height="3" rx="1.5" fill="#d1d5db"/>
                    <rect x="12" y="32" width="28" height="3" rx="1.5" fill="#d1d5db"/>
                    <circle cx="46" cy="48" r="13" fill="#9ca3af"/>
                    <path d="M46 42v12M40 48h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>No payments logged</p>
                  <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 380, lineHeight: 1.5, margin: '0 0 20px' }}>
                    You haven&apos;t added any payments to this property. Log payments to keep your records up to date.
                  </p>
                  <button
                    onClick={() => navigate('/payments/record')}
                    style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >Log payment</button>
                </div>
              )}

              {/* Expenses tab */}
              {payExpTab === 'Expenses' && (
                <div style={{ padding: 16 }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '0 0 200px', position: 'relative' }}>
                      <input type="text" placeholder="Search"
                        style={{ width: '100%', padding: '6px 30px 6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
                      {['Expenses', 'Recurring expenses'].map((t, i) => (
                        <button key={t} style={{ padding: '6px 12px', fontSize: 12, fontWeight: i === 0 ? 600 : 400, background: i === 0 ? '#042238' : '#fff', color: i === 0 ? '#fff' : '#374151', border: 'none', cursor: 'pointer' }}>{t}</button>
                      ))}
                    </div>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0288d1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                      New
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                          <th style={{ width: 36, padding: '8px 12px' }}><input type="checkbox"/></th>
                          {['DATE', 'CATEGORY', 'DESCRIPTION', 'STATUS', 'AMOUNT'].map((col, i) => (
                            <th key={col} style={{ padding: '8px 12px', textAlign: i >= 3 ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}>{col}</th>
                          ))}
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Tenants tab ───────────────────────────────────────── */}
        {activeTab === 'Tenants' && (
          <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-6">
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#042238' }}>Tenants ({tenants.length})</span>
                <button
                  disabled={!lease}
                  onClick={lease ? openLinkModal : undefined}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: lease ? '#042238' : '#e5e7eb', color: lease ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: lease ? 'pointer' : 'not-allowed' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                  New
                </button>
              </div>

              {tenants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Users size={22} color="#d1d5db" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', margin: '0 0 4px' }}>No tenants yet</p>
                  <p style={{ fontSize: 12, color: '#d1d5db', margin: 0 }}>Tenants assigned to this property will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {['NAME', 'EMAIL', 'MOBILE', 'STATUS', 'DATE ADDED', ''].map(h => (
                          <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#042238', letterSpacing: '0.06em', background: '#fff', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => {
                        const leaseTenantId = lease?.tenant?._id?.toString() || lease?.tenant?.toString();
                        const isCurrent = !!leaseTenantId && leaseTenantId === t._id?.toString();
                        const initials = (t.name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const menuKey = `tab-${t._id}`;
                        const addedDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                        return (
                          <tr key={t._id} style={{ borderBottom: '1px solid #f9fafb' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                          >
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fde8e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#c05a3a' }}>{initials}</span>
                                </div>
                                <Link to={`/tenants/${t._id}`} style={{ fontWeight: 700, color: '#042238', textDecoration: 'none' }}>{t.name}</Link>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: 13 }}>{t.email}</td>
                            <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: 13 }}>{t.phone || '—'}</td>
                            <td style={{ padding: '14px 20px' }}>
                              {isCurrent ? (
                                <span style={{ border: '1px solid #34d399', color: '#059669', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>CURRENT</span>
                              ) : (
                                <span style={{ border: '1px solid #d1d5db', color: '#9ca3af', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>PREVIOUS</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>{addedDate}</td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <button
                                onClick={e => {
                                  if (tenantMenuOpenId === menuKey) { setTenantMenuOpenId(null); return; }
                                  const r = e.currentTarget.getBoundingClientRect();
                                  setTenantMenuPos({ top: r.bottom + 4, left: r.right - 168 });
                                  setTenantMenuItems([
                                    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"/></svg>, label: 'Send email', color: '#374151', onClick: () => { window.location.href = `mailto:${t.email}`; setTenantMenuOpenId(null); } },
                                    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>, label: 'Invite tenant', color: '#374151', onClick: () => { setTenantMenuOpenId(null); openExistingInviteModal(t); } },
                                    ...(isCurrent ? [{ icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z"/></svg>, label: 'Un-link tenant', color: '#ef4444', onClick: () => { setTenantMenuOpenId(null); handleUnlinkTenant(); } }] : []),
                                  ]);
                                  setTenantMenuOpenId(menuKey);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center', color: '#9ca3af', borderRadius: 4 }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"/></svg>
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
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Inter", sans-serif', minWidth: 500 }}>
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

        {/* ── Documents tab ────────────────────────────────────── */}
        {activeTab === 'Documents' && (
          <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-6">
            <DocumentsTab houseId={id} backendUrl={backendUrl} />
          </div>
        )}

        {/* ── Reminders tab ────────────────────────────────────── */}
        {activeTab === 'Reminders' && (
          <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-6">
            <RemindersSection houseId={id} houseName={house?.address || house?.name || ''} backendUrl={backendUrl} />
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

      {/* ── Edit lease dropdown outside-click dismiss ── */}
      {editLeaseDropdown && (
        <div
          onClick={() => setEditLeaseDropdown(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 190 }}
        />
      )}

      {/* ── Link Tenant Modal ─────────────────────────────────── */}
      {linkModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 11px 15px -7px rgba(0,0,0,0.2),0 24px 38px 3px rgba(0,0,0,0.14)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#042238' }}>Link tenant</h2>
              <button onClick={closeLinkModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px' }}>

              {/* ── SELECT TENANT view ── */}
              {linkView === 'select' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
                    <span style={{ fontSize: 14, color: '#374151' }}>Select tenant</span>
                    <button onClick={() => setLinkView('new')} style={{ background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add new</button>
                  </div>

                  {loadingTenants ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading tenants…</div>
                  ) : allTenants.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No tenants found. Use "Add new" to create one.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {allTenants.map(t => {
                        const initials = (t.name || 'T').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        const selected = selectedTenantId === t._id;
                        return (
                          <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#c62828', flexShrink: 0 }}>
                                {initials}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#374151' }}>{t.name}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{t.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedTenantId(selected ? null : t._id)}
                              style={{ background: 'none', border: 'none', color: selected ? '#042238' : '#042238', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: selected ? 1 : 0.8 }}
                            >
                              {selected ? '✓ Selected' : 'Select'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 0' }}>
                    <button
                      disabled={!selectedTenantId || savingLink}
                      onClick={handleSaveLinked}
                      style={{ padding: '9px 24px', background: selectedTenantId ? '#042238' : '#e5e7eb', color: selectedTenantId ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: selectedTenantId ? 'pointer' : 'not-allowed' }}
                    >{savingLink ? 'Saving…' : 'Save'}</button>
                    <button onClick={closeLinkModal} style={{ padding: '9px 24px', background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </>
              )}

              {/* ── NEW TENANT view ── */}
              {linkView === 'new' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
                    <span style={{ fontSize: 14, color: '#374151' }}>New tenant</span>
                    <button onClick={() => setLinkView('select')} style={{ background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Select saved tenant</button>
                  </div>


                  {/* Name row */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    {[['First name', 'firstName'], ['Last name', 'lastName']].map(([lbl, key]) => (
                      <div key={key} style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{lbl}</label>
                        <input value={newTenant[key]} onChange={e => ntChange(key, e.target.value)} type="text" maxLength={256}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email address</label>
                    <input value={newTenant.email} onChange={e => ntChange('email', e.target.value)} type="email" maxLength={256}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Phone number */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phone number</label>
                    <input value={newTenant.phone} onChange={e => ntChange('phone', e.target.value)} type="text" maxLength={256}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notes</label>
                    <textarea value={newTenant.notes} onChange={e => ntChange('notes', e.target.value)} rows={4} maxLength={1000}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '4px 0 16px' }}>
                    <button
                      disabled={savingLink}
                      onClick={handleSaveNewTenant}
                      style={{ padding: '9px 24px', background: '#042238', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: savingLink ? 'not-allowed' : 'pointer' }}
                    >{savingLink ? 'Saving…' : 'Save'}</button>
                    <button onClick={closeLinkModal} style={{ padding: '9px 24px', background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tenant row actions dropdown (fixed, escapes table overflow) ── */}
      {tenantMenuOpenId && tenantMenuItems.length > 0 && (
        <>
          <div onClick={() => setTenantMenuOpenId(null)} style={{ position: 'fixed', inset: 0, zIndex: 490 }} />
          <div style={{ position: 'fixed', top: tenantMenuPos.top, left: tenantMenuPos.left, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14)', zIndex: 500, minWidth: 168, overflow: 'hidden' }}>
            {tenantMenuItems.map(item => (
              <button key={item.label} onClick={item.onClick}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', fontSize: 14, color: item.color, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >{item.icon}{item.label}</button>
            ))}
          </div>
        </>
      )}

      {/* ── Invite Tenant Modal ───────────────────────────────── */}
      {inviteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '28px 28px 20px', width: 380, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#042238' }}>Invite tenant</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#374151' }}>
              Would you like to invite this tenant to the tenant portal?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {invitingExistingTenant ? (
                <>
                  <button
                    disabled={savingLink}
                    onClick={() => { setInviteModalOpen(false); setInvitingExistingTenant(null); }}
                    style={{ padding: '8px 20px', background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >Cancel</button>
                  <button
                    disabled={savingLink}
                    onClick={handleSendExistingInvite}
                    style={{ padding: '8px 20px', background: '#042238', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: savingLink ? 'not-allowed' : 'pointer' }}
                  >{savingLink ? 'Sending…' : 'Send invite'}</button>
                </>
              ) : (
                <>
                  <button
                    disabled={savingLink}
                    onClick={() => handleInviteChoice(false)}
                    style={{ padding: '8px 20px', background: 'none', border: 'none', color: '#042238', fontSize: 14, fontWeight: 600, cursor: savingLink ? 'not-allowed' : 'pointer' }}
                  >Skip invite</button>
                  <button
                    disabled={savingLink}
                    onClick={() => handleInviteChoice(true)}
                    style={{ padding: '8px 20px', background: '#042238', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: savingLink ? 'not-allowed' : 'pointer' }}
                  >{savingLink ? 'Sending…' : 'Send invite'}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HouseDetail;
