import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { backendUrl } from '../../config/constants';

const INPUT  = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const LABEL  = 'block text-xs font-semibold text-gray-700 mb-1';

const YesNo = ({ name, value, onChange }) => (
  <div className="flex gap-3">
    {['true', 'false'].map(v => (
      <label key={v} className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all select-none
        ${value === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
        <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only"/>
        {v === 'true' ? 'Yes' : 'No'}
      </label>
    ))}
  </div>
);

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const photoSectionRef = useRef(null);

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [confirm, setConfirm]     = useState({ open: false });
  const closeConfirm = () => setConfirm({ open: false });

  /* form fields */
  const [name, setName]           = useState('');
  const [address, setAddress]     = useState('');
  const [city, setCity]           = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [bedrooms, setBedrooms]   = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');
  const [isOccupied, setIsOccupied] = useState('false');

  /* photo */
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [newPhoto, setNewPhoto]   = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('rental_token');
    axios.get(`${backendUrl}/api/landlord/houses/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const h = r.data.data;
        setName(h.name || '');
        setAddress(h.address || '');
        setCity(h.city || '');
        setRentAmount(h.rentAmount != null ? String(h.rentAmount) : '');
        setBedrooms(h.bedrooms != null ? String(h.bedrooms) : '');
        setBathrooms(h.bathrooms != null ? String(h.bathrooms) : '');
        setDescription(h.description || '');
        setIsOccupied(h.isOccupied ? 'true' : 'false');
        setCurrentPhoto(h.photo || null);
      })
      .catch(() => toast.error('Failed to load property'))
      .finally(() => {
        setLoading(false);
        if (location.hash === '#photo') {
          setTimeout(() => photoSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
        }
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !address || !city || !rentAmount) {
      toast.error('Name, address, city, and rent are required');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('rental_token');
      await axios.put(`${backendUrl}/api/landlord/houses/${id}`,
        { name, address, city, rentAmount, bedrooms, bathrooms, description, isOccupied: isOccupied === 'true' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Property updated');
      navigate(`/houses/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setConfirm({
      open: true,
      title: `Delete "${name}"`,
      message: 'This will permanently remove the property and all associated data.\nThis action cannot be undone.',
      confirmLabel: 'Delete Property',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, loading: true }));
        try {
          const token = localStorage.getItem('rental_token');
          await axios.delete(`${backendUrl}/api/landlord/houses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Property deleted');
          navigate('/houses');
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to delete');
          setConfirm({ open: false });
        }
      },
    });
  };

  const handlePhotoSave = async () => {
    const token = localStorage.getItem('rental_token');
    setPhotoSaving(true);
    try {
      const fd = new FormData();
      if (newPhoto) {
        fd.append('photo', newPhoto);
      } else if (removePhoto) {
        fd.append('removePhoto', 'true');
      } else {
        toast.error('No photo change to save');
        setPhotoSaving(false);
        return;
      }
      await axios.put(`${backendUrl}/api/landlord/houses/${id}/photo`, fd, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Photo updated');
      if (newPhoto) setCurrentPhoto(URL.createObjectURL(newPhoto));
      if (removePhoto) setCurrentPhoto(null);
      setNewPhoto(null);
      setRemovePhoto(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update photo');
    } finally {
      setPhotoSaving(false);
    }
  };

  const photoPreview = newPhoto
    ? URL.createObjectURL(newPhoto)
    : removePhoto
      ? null
      : currentPhoto?.startsWith('http')
        ? currentPhoto
        : currentPhoto
          ? `${backendUrl}${currentPhoto}`
          : null;

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
          Loading…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <button type="button" onClick={() => navigate(`/houses/${id}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

          {/* ── Property Details ─────────────────────────────── */}
          <form onSubmit={handleSave}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Property</h2>
            <p className="text-sm text-gray-500 mb-6">Update your property details below.</p>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              {/* Property name */}
              <div>
                <label className={LABEL}>Property Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Sunrise Apartments"/>
              </div>

              {/* Address */}
              <div>
                <label className={LABEL}>Street Address *</label>
                <input required value={address} onChange={e => setAddress(e.target.value)} className={INPUT} placeholder="123 Uhuru Street"/>
              </div>

              {/* District */}
              <div>
                <label className={LABEL}>District *</label>
                <input required value={city} onChange={e => setCity(e.target.value)} className={INPUT} placeholder="Kinondoni"/>
              </div>

              {/* Beds + Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Beds</label>
                  <input type="number" min="0" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className={INPUT} placeholder="e.g. 2"/>
                </div>
                <div>
                  <label className={LABEL}>Baths</label>
                  <input type="number" min="0" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className={INPUT} placeholder="e.g. 1"/>
                </div>
              </div>

              {/* Rent */}
              <div>
                <label className={LABEL}>Monthly Rent *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">TZS</span>
                  <input required type="number" min="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="0"/>
                </div>
              </div>

              {/* Occupied */}
              <div>
                <label className={`${LABEL} mb-3`}>Is this rental currently occupied?</label>
                <YesNo name="occupied" value={isOccupied} onChange={setIsOccupied}/>
              </div>

              {/* Description */}
              <div>
                <label className={LABEL}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" placeholder="Optional notes..."/>
              </div>
            </div>

            {/* Footer bar: Delete ← → Save */}
            <div className="mt-6 bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Delete Property
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white text-sm font-bold tracking-widest uppercase transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* ── Property Photo ───────────────────────────────── */}
          <div ref={photoSectionRef}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Property Photo</h2>
            <p className="text-sm text-gray-500 mb-6">Upload or replace the property's featured photo.</p>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              {/* Current / new preview */}
              {photoPreview && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Current Photo</p>
                  <div style={{ position: 'relative', display: 'inline-block', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <img src={photoPreview} alt="Property" style={{ width: 220, height: 150, objectFit: 'cover', display: 'block' }}/>
                    <span style={{ position: 'absolute', top: 7, left: 7, background: '#042238', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 4 }}>FEATURED</span>
                    <button type="button"
                      onClick={() => { setNewPhoto(null); setRemovePhoto(true); }}
                      style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300 }}
                      title="Remove photo">×</button>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <label
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { setNewPhoto(f); setRemovePhoto(false); } }}
              >
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only"
                  onChange={e => { if (e.target.files[0]) { setNewPhoto(e.target.files[0]); setRemovePhoto(false); } }}/>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f0f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5a8fc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="text-sm font-bold text-gray-700">{newPhoto ? newPhoto.name : 'Click or drag to upload a new photo'}</div>
                  <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP or GIF · max 10 MB</div>
                </div>
              </label>

              {removePhoto && !newPhoto && (
                <p className="text-sm text-red-500 font-medium">Photo will be removed when you click Save Photo.</p>
              )}
            </div>

            <button type="button"
              onClick={handlePhotoSave}
              disabled={photoSaving || (!newPhoto && !removePhoto)}
              className="w-full mt-6 bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm tracking-widest uppercase transition-colors">
              {photoSaving ? 'Saving...' : 'Save Photo'}
            </button>
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
}
