import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { backendUrl, API } from '../../config/constants';

const emptyForm = { name: '', address: '', city: '', bedrooms: 1, bathrooms: 1, description: '' };

/* ── Property type SVGs ───────────────────────────────────── */
const TYPE_SVG = {
  SINGLE_FAMILY: (
    <svg width="64" height="64" viewBox="0 0 40 33" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M29.543 4.977h3.939v4.978h-1.969l-1.97-1.991ZM10.832 20.905h4.924v7.964h-4.924ZM20.68 20.905h8.863v3.982H20.68Z"/>
      <path fill="#042238" d="m20.495.166 7.837 5.881V4.23c0-.431.319-.787.73-.84l.104-.006h5a.84.84 0 0 1 .833.846l-.001 6.821 4.662 3.5c.647.484.309 1.526-.495 1.526l-4.167-.001v15.231h4.167c.425 0 .775.323.827.74l.006.107a.84.84 0 0 1-.833.846H.835a.84.84 0 0 1-.833-.846.84.84 0 0 1 .833-.846L5 31.307V16.076H.835c-.804 0-1.142-1.04-.495-1.526L19.505.166a.823.823 0 0 1 .99 0Zm12.837 15.91H6.668v15.23h1.666v-2.538a.84.84 0 0 1 .834-.846H10v-7.615a.84.84 0 0 1 .834-.846h5a.84.84 0 0 1 .833.846l-.001 7.615h.834a.84.84 0 0 1 .833.846v2.538h15v-15.23ZM16.667 29.615H10v1.692h6.666v-1.692ZM15 21.153h-3.333v6.77H15v-6.77Zm14.166-1.692a.84.84 0 0 1 .833.846v5.077a.84.84 0 0 1-.833.846h-8.333a.84.84 0 0 1-.833-.846v-5.077a.84.84 0 0 1 .833-.846h8.333Zm-.833 1.692h-6.666v3.385h6.666v-3.385ZM20 1.898 3.364 14.385l2.455-.001h30.817L20 1.899Zm13.332 3.178H30V7.3L33.332 9.8V5.076Z"/>
    </g></svg>
  ),
  TOWNHOUSE: (
    <svg width="64" height="64" viewBox="0 0 40 37" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M25.833 14.295c.92 0 1.667.754 1.667 1.682 0 .93-.746 1.682-1.667 1.682-.92 0-1.666-.753-1.666-1.682 0-.928.747-1.682 1.666-1.682ZM30 30.272v5.045h-3.333v-5.045ZM32 9h3v5h-3ZM8.167 11.632h-3v4l3-1ZM13.333 29.443v5.907H10v-5.907ZM13.333 18.81v3.454H10V18.81Z"/>
      <path fill="#042238" d="m18.884.21 11.949 10.61V8.409c0-.465.373-.841.834-.841H35c.46 0 .833.376.833.84v6.852l3.884 3.45c.346.306.38.838.075 1.186a.828.828 0 0 1-1.176.076L37.5 18.98v16.338h.834c.46 0 .834.377.834.841 0 .465-.373.841-.834.841H1.667a.837.837 0 0 1-.834-.84c0-.465.374-.842.834-.842H2.5V19.301l-1.233.758a.829.829 0 0 1-1.145-.28.845.845 0 0 1 .278-1.156l2.1-1.291v-.04l.067-.001 1.599-.982v-4.537c0-.464.374-.84.834-.84h3.333c.46 0 .834.376.834.84l-.001 1.466 10-6.143V2.701l-1.383-1.229a.846.846 0 0 1-.075-1.187.828.828 0 0 1 1.176-.075Z"/>
    </g></svg>
  ),
  CONDO: (
    <svg width="64" height="64" viewBox="0 0 33 40" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M7.5 39.167h5v-7.5h-5v7.5ZM5.833 15.833h5V12.5h-5v3.333Zm8.334 0h5V12.5h-5v3.333Zm8.333 0h5V12.5h-5v3.333ZM5.833 22.5h5v-3.333h-5V22.5Zm8.334 0h5v-3.333h-5V22.5Zm8.333 0h5v-3.333h-5V22.5Zm-1.667 16.667h5v-7.5h-5v7.5Z"/>
      <path fill="#042238" fillRule="nonzero" d="m16.695 0 .023.002a.837.837 0 0 1 .216.042l.043.016a.787.787 0 0 1 .135.069l9.554 6.033V4.167c0-.46.374-.834.834-.834h3.333c.46 0 .834.374.834.834l-.001 5.153 1.279.809a.833.833 0 0 1-.89 1.409l-.389-.247v27.042h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V11.292l-.388.246a.833.833 0 1 1-.89-1.41l15.834-10Z"/>
    </g></svg>
  ),
  MULTI_FAMILY: (
    <svg width="64" height="64" viewBox="0 0 40 33" fill="none"><g fillRule="nonzero">
      <path fill="#7FE3FF" d="M20 1.577V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H20Zm17.5 0V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H37.5ZM13.75 23.5v9.333h-5V23.5h5Zm17.5 0v9.333h-5V23.5h5Z"/>
      <path fill="#042238" d="m11.284 0 .024.002a.837.837 0 0 1 .107.014l.05.012a.655.655 0 0 1 .104.035l.059.028.071.04 4.134 2.646v-1.2c0-.46.373-.833.834-.833H20c.46 0 .833.373.833.833V4.89L28.269.132l.073-.042.061-.028a.886.886 0 0 1 .256-.06L28.69 0h.063l.025.002a.837.837 0 0 1 .256.06l.058.027.077.043 4.165 2.665v-1.22c0-.46.373-.833.834-.833H37.5c.46 0 .833.373.833.833v4.42l1.251.801c.356.228.48.68.307 1.052l-.054.1a.833.833 0 0 1-1.151.252l-.353-.226V32h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V7.955Z"/>
    </g></svg>
  ),
  APARTMENT: (
    <svg width="64" height="64" viewBox="0 0 31 40" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M17.222 33.333v5h-3.444v-5ZM26.337 1.667l1.722 1.666H2.94l1.722-1.666Z"/>
      <path fill="#042238" d="M26.693 0c.229 0 .448.088.609.244l3.444 3.333a.923.923 0 0 1 .091.103l.015.022a.783.783 0 0 1 .147.49v34.975c0 .46-.386.833-.862.833H.863c-.476 0-.861-.373-.861-.833L0 4.193a.789.789 0 0 1 .146-.49l.017-.023a.806.806 0 0 1 .09-.103L3.698.244A.876.876 0 0 1 4.307 0Zm2.583 5H1.724v33.333h10.331V32.5c0-.425.33-.775.754-.827l.108-.006h5.166c.476 0 .861.373.861.833v5.833h10.332V5Z"/>
    </g></svg>
  ),
  OTHER: (
    <svg width="64" height="64" viewBox="0 0 53 53" fill="none"><g fillRule="evenodd">
      <path fill="#7FE3FF" d="M16.667 21.333C25.135 21.333 32 28.198 32 36.667 32 45.135 25.135 52 16.667 52 8.198 52 1.333 45.135 1.333 36.667c0-8.469 6.865-15.334 15.334-15.334Z"/>
      <path fill="#042238" d="M52.222 0c.614 0 1.111.497 1.111 1.111v6.667c0 .294-.117.577-.325.785l-1.897 1.895v2.875c0 .546-.393 1-.911 1.094l-.2.017h-2.876l-.457.458v2.876c0 .545-.393.999-.912 1.093l-.2.018H42.68l-.458.458v2.875c0 .546-.393 1-.911 1.093l-.2.018h-2.875l-6.416 6.418.251.573A16.53 16.53 0 0 1 33.333 36.667C33.333 45.872 25.872 53.333 16.667 53.333 7.46 53.333 0 45.873 0 36.667 0 27.462 7.462 20 16.667 20c2.201 0 4.346.435 6.345 1.264l.57.25L44.77.324c.167-.166.38-.275.61-.311L45.557 0Z"/>
    </g></svg>
  ),
};

/* ── helpers ──────────────────────────────────────────────── */
const getRentStatus = (h) => {
  if (!h.isOccupied) return 'VACANT';
  if (h.rentStatus === 'overdue') return 'OVERDUE';
  if (h.rentStatus === 'due_soon') return 'DUE SOON';
  return 'DUE LATER';
};

const STATUS_CHIP = {
  'OVERDUE':   'border border-red-400 text-red-600 bg-red-50',
  'DUE SOON':  'border border-yellow-400 text-yellow-700 bg-yellow-50',
  'DUE LATER': 'border border-green-400 text-green-700 bg-green-50',
  'VACANT':    'border border-gray-300 text-gray-500 bg-gray-50',
};

const TABS = ['All', 'Rent overdue', 'Rent due soon', 'Rent due later', 'Vacant', 'Multi-Unit'];

const tabMatch = (tab, h) => {
  const s = getRentStatus(h);
  if (tab === 'All')           return true;
  if (tab === 'Rent overdue')  return s === 'OVERDUE';
  if (tab === 'Rent due soon') return s === 'DUE SOON';
  if (tab === 'Rent due later')return s === 'DUE LATER';
  if (tab === 'Vacant')        return s === 'VACANT';
  if (tab === 'Multi-Unit')    return (h.units ?? 0) > 1;
  return true;
};

const PAGE_SIZE = 100;

/* ── Occupancy Ring ────────────────────────────────────────── */
const OccupancyRing = ({ occupied, total }) => {
  const R = 29;
  const circumference = 2 * Math.PI * R; // ≈ 182.21
  const progress = total > 0 ? occupied / total : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64">
        <circle stroke="#E6E9F0" fill="transparent" strokeWidth="6" r={R} cx="32" cy="32" />
        <circle
          stroke="#009e74"
          fill="transparent"
          strokeWidth="6"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          r={R} cx="32" cy="32"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px', transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#6B7280">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
    </div>
  );
};

/* ── Empty State Illustration ─────────────────────────────── */
const EmptyIllustration = () => (
  <svg viewBox="0 0 200 160" width="180" height="144" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ground */}
    <ellipse cx="100" cy="148" rx="72" ry="8" fill="#F3F4F6"/>
    {/* Building body */}
    <rect x="38" y="60" width="124" height="88" rx="4" fill="#E5E7EB"/>
    {/* Roof */}
    <polygon points="30,62 100,18 170,62" fill="#D1D5DB"/>
    {/* Door */}
    <rect x="84" y="108" width="32" height="40" rx="3" fill="#9CA3AF"/>
    <circle cx="112" cy="129" r="2.5" fill="#6B7280"/>
    {/* Windows row 1 */}
    <rect x="48" y="75" width="26" height="20" rx="2" fill="#BFDBFE"/>
    <rect x="126" y="75" width="26" height="20" rx="2" fill="#BFDBFE"/>
    {/* Windows row 2 */}
    <rect x="48" y="103" width="26" height="20" rx="2" fill="#BFDBFE"/>
    <rect x="126" y="103" width="26" height="20" rx="2" fill="#BFDBFE"/>
    {/* Chimney */}
    <rect x="128" y="28" width="14" height="28" rx="2" fill="#D1D5DB"/>
    {/* Tree */}
    <rect x="16" y="118" width="6" height="22" rx="2" fill="#9CA3AF"/>
    <ellipse cx="19" cy="108" rx="14" ry="18" fill="#BBF7D0"/>
    {/* Tree 2 */}
    <rect x="175" y="122" width="5" height="18" rx="2" fill="#9CA3AF"/>
    <ellipse cx="177" cy="113" rx="11" ry="14" fill="#BBF7D0"/>
  </svg>
);

/* ── component ────────────────────────────────────────────── */
const Houses = () => {
  const navigate = useNavigate();
  const [houses, setHouses]       = useState([]);
  const [tenantMap, setTenantMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [totalModal, setTotalModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [photoModal, setPhotoModal]       = useState(null);
  const [photoNickname, setPhotoNickname] = useState('');
  const [photoFile, setPhotoFile]         = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoDeleted, setPhotoDeleted]   = useState(false);
  const [photoSaving, setPhotoSaving]     = useState(false);
  const [confirm, setConfirm] = useState({ open: false });
  const closeConfirm = () => setConfirm({ open: false });

  const fetchHouses = async () => {
    try {
      const [housesRes, tenantsRes] = await Promise.all([
        axios.get(`${backendUrl}${API.houses}`),
        axios.get(`${backendUrl}${API.tenants}`),
      ]);
      setHouses(housesRes.data.data || []);
      const map = {};
      for (const t of (tenantsRes.data.data || [])) {
        const hid = t.house?._id || t.house;
        if (!hid) continue;
        map[hid] = map[hid] ? `${map[hid]}, ${t.name}` : t.name;
      }
      setTenantMap(map);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  const occupiedCount = useMemo(() => houses.filter(h => h.isOccupied).length, [houses]);

  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach(t => { counts[t] = houses.filter(h => tabMatch(t, h)).length; });
    return counts;
  }, [houses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return houses.filter(h => {
      const matchTab = tabMatch(activeTab, h);
      const matchSearch = !q ||
        h.address?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.name?.toLowerCase().includes(q) ||
        tenantMap[h._id]?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [houses, activeTab, search, tenantMap]);

  const pageRows  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (h) => {
    setForm({ name: h.name, address: h.address, city: h.city, bedrooms: h.bedrooms, bathrooms: h.bathrooms, description: h.description || '' });
    setEditId(h._id); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditId(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        await axios.put(`${backendUrl}${API.houses}/${editId}`, form);
        toast.success('Property updated');
      } else {
        await axios.post(`${backendUrl}${API.houses}`, form);
        toast.success('Property added');
      }
      closeModal(); fetchHouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    setConfirm({
      open: true,
      title: 'Delete Property',
      message: 'This property will be permanently deleted.\nThis action cannot be undone.',
      confirmLabel: 'Delete Property',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, loading: true }));
        try {
          await axios.delete(`${backendUrl}${API.houses}/${id}`);
          toast.success('Property deleted');
          fetchHouses();
          setConfirm({ open: false });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Delete failed');
          setConfirm({ open: false });
        }
      },
    });
  };

  const field = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openPhotoModal = (h) => {
    setPhotoModal(h);
    setPhotoNickname(h.nickname || '');
    setPhotoFile(null);
    setPhotoPreview(h.photo ? `${backendUrl}${h.photo}` : null);
    setPhotoRotation(0);
    setPhotoDeleted(false);
  };
  const closePhotoModal = () => {
    setPhotoModal(null);
    setPhotoNickname('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoRotation(0);
    setPhotoDeleted(false);
  };
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoDeleted(false);
  };
  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoDeleted(false);
  };
  const handlePhotoSave = async (e) => {
    e.preventDefault();
    setPhotoSaving(true);
    try {
      const fd = new FormData();
      fd.append('nickname', photoNickname);
      if (photoFile) {
        fd.append('photo', photoFile);
      } else if (photoDeleted) {
        fd.append('removePhoto', 'true');
      }
      await axios.put(`${backendUrl}${API.houses}/${photoModal._id}/photo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Property updated');
      closePhotoModal();
      fetchHouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setPhotoSaving(false);
    }
  };

  return (
    <Layout>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Properties header row ──────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <Link
            to="/houses/new"
            className="inline-flex items-center border border-[#033A6D] text-[#033A6D] hover:bg-[#033A6D] hover:text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
          >
            Add new Property
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : houses.length === 0 ? (

          /* ── Empty state ────────────────────────────────── */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 flex flex-col items-center text-center px-6">
            <EmptyIllustration />
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Add Your Rental Property</h2>
            <p className="text-sm text-gray-500 max-w-sm mb-7">
              Whether you are looking to track rent or manage tenants, you first need to add your property.
            </p>
            <Link
              to="/houses/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-7 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Add My Property
            </Link>
          </div>

        ) : (
          <>
            {/* ── Tabs ──────────────────────────────────────── */}
            <div style={{ overflowX: 'auto' }}>
            <div className="flex gap-0 border-b border-gray-200 mb-4" style={{ minWidth: 'max-content' }}>
              {TABS.map(tab => {
                const count = tabCounts[tab] ?? 0;
                const hasCount = tab !== 'All' && tab !== 'Multi-Unit';
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setPage(0); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {hasCount && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
            </div>

            {/* ── Search ────────────────────────────────────── */}
            <div className="mb-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full max-w-sm">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Search address or tenants"
                  className="text-sm outline-none flex-1 placeholder-gray-400"
                />
              </div>
            </div>

            {/* ── Property Table ─────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

              {pageRows.length === 0 ? (
                <div className="py-14 text-center text-sm text-gray-400">No properties match your search.</div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="flex items-center border-b border-gray-200" style={{ height: 40, paddingLeft: 16, paddingRight: 16 }}>
                    <div style={{ width: 80, flexShrink: 0 }} />
                    <div style={{ flex: '1 1 0', minWidth: 0, paddingRight: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>ADDRESS</p>
                    </div>
                    <div style={{ flex: '0 0 155px', paddingRight: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>TENANTS</p>
                    </div>
                    <div style={{ flex: '0 0 124px', paddingRight: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>DUE DATE</p>
                    </div>
                    <div style={{ flex: '0 0 130px', paddingRight: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>RENT DUE</p>
                    </div>
                    <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>STATUS</p>
                    </div>
                  </div>

                  {/* Table rows */}
                  {pageRows.map((h, idx) => {
                    const locationLine = h.address || '';
                    const lease = h.lease;
                    const tenantName = lease?.tenant?.name || tenantMap[h._id] || null;
                    const status = getRentStatus(h);
                    const statusClass = STATUS_CHIP[status] || STATUS_CHIP['VACANT'];

                    let dueDateStr = '—';
                    if (lease?.paymentDay) {
                      const now = new Date();
                      const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), lease.paymentDay);
                      // Advance to next month only if current month's due date has passed AND rent is paid (not overdue)
                      const isPaid = currentMonthDue < now && h.rentStatus !== 'overdue';
                      const due = isPaid
                        ? new Date(now.getFullYear(), now.getMonth() + 1, lease.paymentDay)
                        : currentMonthDue;
                      dueDateStr = due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                    }

                    const rentDue = lease?.rentAmount ?? h.rentAmount;

                    return (
                      <div
                        key={h._id}
                        onClick={() => navigate(`/houses/${h._id}`)}
                        className={`flex items-center hover:bg-gray-50 cursor-pointer transition-colors${idx < pageRows.length - 1 ? ' border-b border-gray-100' : ''}`}
                        style={{ height: 70, paddingLeft: 0, paddingRight: 16 }}
                      >
                        {/* Photo thumbnail */}
                        <div className="group relative flex-shrink-0" style={{ width: 64, height: 70, borderRadius: '8px 0 0 8px', marginRight: 16, overflow: 'hidden', background: '#e8f0f8', flexShrink: 0 }}>
                          {h.photo ? (
                            <img src={`${backendUrl}${h.photo}`} alt={h.address} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" width="28" height="28" fill="#93b4d4"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                            </div>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); openPhotoModal(h); }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil size={11} color="white" />
                          </button>
                        </div>

                        {/* Address */}
                        <div style={{ flex: '1 1 0', minWidth: 0, paddingRight: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#042238', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                              {h.nickname || h.name || h.address}
                            </p>
                            <button onClick={e => { e.stopPropagation(); openEdit(h); }} className="flex-shrink-0 opacity-0 hover:opacity-100 group-hover:opacity-100">
                              <Pencil size={10} color="#9CA3AF" />
                            </button>
                          </div>
                          {locationLine && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{locationLine}</p>}
                        </div>

                        {/* Tenants */}
                        <div style={{ flex: '0 0 155px', paddingRight: 16 }}>
                          <p style={{ fontSize: 13, color: tenantName ? '#042238' : '#d1d5db' }}>{tenantName || '—'}</p>
                        </div>

                        {/* Due Date */}
                        <div style={{ flex: '0 0 124px', paddingRight: 16 }}>
                          <p style={{ fontSize: 13, color: dueDateStr === '—' ? '#d1d5db' : '#042238' }}>{dueDateStr}</p>
                        </div>

                        {/* Rent Due */}
                        <div style={{ flex: '0 0 130px', paddingRight: 16 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: rentDue ? '#042238' : '#d1d5db' }}>
                            {rentDue ? `TZS ${Number(rentDue).toLocaleString()}` : '—'}
                          </p>
                        </div>

                        {/* Status */}
                        <div style={{ flex: '0 0 120px', display: 'flex', justifyContent: 'center' }}>
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${statusClass}`} style={{ letterSpacing: '0.04em' }}>
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-between mt-3 px-1 text-xs text-gray-500">
                <span>{filtered.length === 0 ? '0–0 of 0' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        </div>{/* end max-w-4xl */}

        {/* ── Add / Edit Modal ────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">{editId ? 'Edit Property' : 'Add Property'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input required value={form.name} onChange={e => field('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sunrise Apartments" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                    <input required value={form.address} onChange={e => field('address', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123 Main Street" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                    <input required value={form.city} onChange={e => field('city', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dar es Salaam" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input type="number" min="1" value={form.bedrooms} onChange={e => field('bedrooms', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input type="number" min="1" value={form.bathrooms} onChange={e => field('bathrooms', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={form.description} onChange={e => field('description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional notes..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Total Modal ────────────────────────────── */}
        {totalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7 relative">
              <button
                onClick={() => setTotalModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Edit your rental count</h2>
              <p className="text-sm text-gray-500 mb-6">How many units do you own/manage?</p>
              <div className="flex items-center justify-center gap-4 mb-7">
                <button
                  type="button"
                  onClick={() => setDraftCount(c => Math.max(0, c - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-xl font-light"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={draftCount}
                  onChange={e => setDraftCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setDraftCount(c => c + 1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-xl font-light"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setTotalCount(draftCount); setTotalModal(false); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm tracking-wide transition-colors"
              >
                UPDATE
              </button>
            </div>
          </div>
        )}

        {/* ── Photo / Nickname Modal ───────────────────────── */}
        {photoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">

              {/* Close */}
              <button
                type="button"
                onClick={closePhotoModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={14} />
              </button>

              {/* Header */}
              <div className="px-7 pt-7 pb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Edit Property Nickname &amp; Photo</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Edit your property nickname and photo here. These will be used for your own organizational purposes and only you will see it. Other changes may be made on the property page.
                </p>
              </div>

              <form onSubmit={handlePhotoSave} className="px-7 pb-7 space-y-5">

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5" htmlFor="pm-nickname">
                    Property Nickname
                    <span className="ml-1.5 text-xs font-normal text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="pm-nickname"
                    type="text"
                    maxLength={50}
                    value={photoNickname}
                    onChange={e => setPhotoNickname(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#033A6D]/30 focus:border-[#033A6D] transition"
                    placeholder="e.g. Beach House, Downtown Unit B"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Property Photo
                  </label>

                  {/* RWPX4 — horizontal row: photo preview (left) + upload area (right) */}
                  <div style={{ display: 'flex', gap: 12, height: 114, boxSizing: 'border-box' }}>

                    {/* DK-iL — photo preview + action buttons (only when photo exists) */}
                    {photoPreview && (
                      <div style={{ display: 'flex', flex: '0 0 auto', width: 160, height: '100%', borderRadius: 6, border: '1px solid #e5e7eb', overflow: 'hidden', boxSizing: 'border-box' }}>
                        {/* KrybB — photo */}
                        <div style={{ flex: 1, overflow: 'hidden', background: '#f0f4f8' }}>
                          <img
                            src={photoPreview}
                            alt="Property preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transform: `rotate(${photoRotation}deg)`,
                              transition: 'transform 0.3s',
                            }}
                          />
                        </div>
                        {/* Action buttons — stacked vertically, right edge */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e5e7eb', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setPhotoRotation(r => (r + 90) % 360)}
                            title="Rotate"
                            style={{
                              flex: 1, width: 36, border: 'none', borderBottom: '1px solid #e5e7eb',
                              background: '#fff', cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            <svg width="16" height="14" viewBox="0 0 19 16" fill="#033A6D">
                              <path d="M2.89 9.343l-.06-.074L.578 5.98a.62.62 0 01.18-.874.66.66 0 01.838.101l.06.074 1.135 1.66C3.35 3.13 6.361.392 10.215.254c4.295-.153 7.904 3.11 8.06 7.289.161 4.18-3.193 7.693-7.488 7.846a.64.64 0 01-.67-.607.638.638 0 01.623-.653c3.58-.127 6.375-3.056 6.241-6.54-.13-3.483-3.139-6.203-6.718-6.075-3.235.116-5.754 2.415-6.2 5.672L5.51 5.581a.66.66 0 01.838-.115l.076.056c.245.208.29.556.119.815l-.058.074L3.9 9.288a.65.65 0 01-.477.26h-.1a.651.651 0 01-.433-.205z"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); setPhotoRotation(0); setPhotoDeleted(true); }}
                            title="Remove photo"
                            style={{
                              flex: 1, width: 36, border: 'none',
                              background: '#fff', cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            <svg width="15" height="17" viewBox="0 0 18 20" fill="#033A6D">
                              <path d="M12.445 0c.357 0 .646.274.646.612l-.001 1.836 4.317.001a.6.6 0 01.585.513l.008.1a.603.603 0 01-.593.611h-1.044v15.715a.622.622 0 01-.63.612H2.267a.622.622 0 01-.632-.612V3.673H.593a.6.6 0 01-.585-.512L0 3.06c0-.338.266-.612.593-.612l4.316-.001V.612C4.91.274 5.2 0 5.555 0h6.89zm2.656 3.673H2.9v15.103H15.1V3.673zm-9.456 1.94c.34 0 .614.273.614.611v9.796a.613.613 0 01-1.227 0V6.224c0-.338.275-.612.613-.612zm3.273 0c.34 0 .614.273.614.611v9.796a.613.613 0 01-1.227 0V6.224c0-.338.274-.612.613-.612zm3.273 0c.339 0 .614.273.614.611v9.796a.613.613 0 01-1.228 0V6.224c0-.338.275-.612.614-.612zm-.392-4.389H6.201V2.45h5.598V1.224z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ojOk0 ux5Nd — upload drop zone (right side, or full width when no preview) */}
                    <div
                      style={{ flex: 1, height: '100%', boxSizing: 'border-box' }}
                      className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden"
                      onDragOver={e => e.preventDefault()}
                      onDrop={handlePhotoDrop}
                    >
                      <label
                        htmlFor="pm-photo"
                        className="flex flex-col items-center justify-center gap-2 h-full px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#042238">
                          <path d="M24 5.633v17.632c0 .372-.276.68-.635.728l-.1.007H5.633v-1.47H22.53V5.634H24zm-1.96-2.94v18.613c0 .372-.276.68-.634.728l-.1.007H2.694v-1.47H20.57V2.694h1.47zM19.348 0c.406 0 .735.329.735.735v18.612a.735.735 0 01-.735.735H.735A.735.735 0 010 19.347V.735C0 .329.329 0 .735 0zm-.735 16.163H1.469v2.45h17.143v-2.45zm0-14.694H1.47v13.224h2.768l2.725-4.54a.735.735 0 011.12-.17l.074.077 1.818 2.182 3.374-5.058a.735.735 0 011.254.05l.045.1 2.759 7.359h1.206V1.469zm-4.838 7.724l-3.122 4.684a.735.735 0 01-1.098.143l-.078-.08-1.787-2.145-1.739 2.898h9.887l-2.063-5.5zM6.122 2.94a2.204 2.204 0 110 4.408 2.204 2.204 0 010-4.408zm0 1.47a.735.735 0 10.002 1.47.735.735 0 00-.002-1.47z" fillRule="evenodd"/>
                        </svg>
                        <p className="text-xs text-gray-400 text-center">Click or drag to upload</p>
                      </label>
                      <input
                        id="pm-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />
                    </div>

                  </div>
                </div>

                {/* Save */}
                <button
                  type="submit"
                  disabled={photoSaving}
                  className="w-full bg-[#033A6D] hover:bg-[#022d56] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm tracking-wide transition-colors"
                >
                  {photoSaving ? 'Saving…' : 'Save'}
                </button>

              </form>
            </div>
          </div>
        )}

      </main>

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

export default Houses;
