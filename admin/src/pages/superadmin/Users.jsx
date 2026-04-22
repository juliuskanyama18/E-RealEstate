import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Search, UserCog, ToggleLeft, ToggleRight,
  Archive, ArchiveRestore, Trash2, KeyRound,
  AlertTriangle, Users as UsersIcon, Building2, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { backendUrl, API } from '../../config/constants';

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
  if (role === 'landlord') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      <Building2 size={10} /> Landlord
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
      <UsersIcon size={10} /> Tenant
    </span>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ user }) => {
  if (user.isDeleted) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Deleted</span>
  );
  if (!user.isActive) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Suspended</span>
  );
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>
  );
};

/* ── Confirm hard-delete modal ── */
const HardDeleteModal = ({ user, onConfirm, onCancel, loading }) => {
  const [typed, setTyped] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Permanently Delete User</h3>
            <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-1.5">
          <p className="text-sm font-semibold text-red-700">⚠ You are about to permanently delete:</p>
          <p className="text-sm text-red-600"><strong>{user.name}</strong> ({user.email})</p>
          {user.role === 'landlord' && (
            <p className="text-xs text-red-500 mt-1">
              This will also delete all of their houses, tenants, rent records, and maintenance requests.
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Type <strong className="font-mono text-red-600">DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== 'DELETE' || loading}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Trash2 size={14} />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Force password reset confirmation modal ── */
const ResetPasswordModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <KeyRound size={18} className="text-purple-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Force Password Reset</h3>
          <p className="text-xs text-gray-400 mt-0.5">A secure reset link will be emailed to the user</p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
        <p className="text-sm text-gray-700">
          A password reset link will be sent to:
        </p>
        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-purple-600 mt-2">
          The admin never sets or sees the password — the user resets it themselves via the secure link.
          Link expires in 60 minutes.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <KeyRound size={14} />}
          Send Reset Link
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */

const Users = () => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');

  // Per-row action states (keyed by user _id)
  const [acting,      setActing]      = useState({});   // { [id]: 'suspend'|'activate'|'soft-delete'|'restore' }

  // Modals
  const [hardDeleteTarget,  setHardDeleteTarget]  = useState(null);
  const [hardDeleting,      setHardDeleting]      = useState(false);
  const [resetTarget,       setResetTarget]       = useState(null);
  const [resetting,         setResetting]         = useState(false);
  const [confirm, setConfirm] = useState({ open: false });
  const closeConfirm = () => setConfirm({ open: false });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    axios.get(`${backendUrl}${API.admin.users}`)
      .then(res => setUsers(res.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Derived counts ── */
  const counts = useMemo(() => ({
    total:     users.length,
    landlords: users.filter(u => u.role === 'landlord' && !u.isDeleted).length,
    tenants:   users.filter(u => u.role === 'tenant'   && !u.isDeleted).length,
    suspended: users.filter(u => !u.isActive && !u.isDeleted).length,
    deleted:   users.filter(u => u.isDeleted).length,
  }), [users]);

  /* ── Filtered list ── */
  const filtered = useMemo(() =>
    users.filter(u => {
      const matchSearch = !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.landlord?.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all'       ? !u.isDeleted :
        filter === 'landlords' ? u.role === 'landlord' && !u.isDeleted :
        filter === 'tenants'   ? u.role === 'tenant'   && !u.isDeleted :
        filter === 'suspended' ? !u.isActive && !u.isDeleted :
        filter === 'deleted'   ? u.isDeleted :
        true;
      return matchSearch && matchFilter;
    }),
  [users, search, filter]);

  /* ── Helpers ── */
  const setRowActing = (id, action) => setActing(prev => ({ ...prev, [id]: action }));
  const clearRowActing = (id) => setActing(prev => { const n = { ...prev }; delete n[id]; return n; });

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const fmtRelative = (d) => {
    if (!d) return 'Never';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return fmtDate(d);
  };

  /* ── Actions ── */
  const handleSuspend = async (user) => {
    setRowActing(user._id, 'suspend');
    try {
      await axios.patch(`${backendUrl}${API.admin.users}/${user._id}/suspend`);
      toast.success(`${user.name} suspended`);
      setUsers(prev => prev.map(u =>
        u._id === user._id ? { ...u, isActive: false } :
        // If landlord suspended, cascade to their tenants in local state
        (user.role === 'landlord' && u.landlord?._id === user._id) ? { ...u, isActive: false } : u
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      clearRowActing(user._id);
    }
  };

  const handleActivate = async (user) => {
    setRowActing(user._id, 'activate');
    try {
      await axios.patch(`${backendUrl}${API.admin.users}/${user._id}/activate`);
      toast.success(`${user.name} activated`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: true } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      clearRowActing(user._id);
    }
  };

  const handleSoftDelete = (user) => {
    setConfirm({
      open: true,
      title: `Archive "${user.name}"`,
      message: `Their data will be preserved and the account can be restored later.`,
      confirmLabel: 'Archive Account',
      danger: false,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, loading: true }));
        setRowActing(user._id, 'soft-delete');
        try {
          await axios.patch(`${backendUrl}${API.admin.users}/${user._id}/soft-delete`);
          toast.success(`${user.name} archived`);
          setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isDeleted: true, isActive: false } : u));
          setConfirm({ open: false });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Action failed');
          setConfirm({ open: false });
        } finally {
          clearRowActing(user._id);
        }
      },
    });
  };

  const handleRestore = async (user) => {
    setRowActing(user._id, 'restore');
    try {
      await axios.patch(`${backendUrl}${API.admin.users}/${user._id}/restore`);
      toast.success(`${user.name} restored`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isDeleted: false, isActive: true, deletedAt: null } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      clearRowActing(user._id);
    }
  };

  const handleHardDeleteConfirm = async () => {
    if (!hardDeleteTarget) return;
    setHardDeleting(true);
    try {
      await axios.delete(`${backendUrl}${API.admin.users}/${hardDeleteTarget._id}`, {
        data: { confirm: 'CONFIRM_DELETE' },
      });
      toast.success(`${hardDeleteTarget.name} permanently deleted`);
      setUsers(prev => prev.filter(u => u._id !== hardDeleteTarget._id));
      setHardDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setHardDeleting(false);
    }
  };

  const handleForceReset = async () => {
    if (!resetTarget) return;
    setResetting(true);
    try {
      await axios.post(`${backendUrl}${API.admin.users}/${resetTarget._id}/force-reset-password`);
      toast.success(`Reset link sent to ${resetTarget.email}`);
      setResetTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setResetting(false);
    }
  };

  /* ── Render ── */
  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Suspend, archive, restore, and manage access for all platform users
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Users',  value: counts.total,     color: 'bg-gray-50   text-gray-700' },
              { label: 'Landlords',    value: counts.landlords, color: 'bg-blue-50   text-blue-700' },
              { label: 'Tenants',      value: counts.tenants,   color: 'bg-purple-50 text-purple-700' },
              { label: 'Suspended',    value: counts.suspended, color: 'bg-red-50    text-red-600' },
              { label: 'Archived',     value: counts.deleted,   color: 'bg-orange-50 text-orange-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border border-gray-100 shadow-sm p-4 ${color} bg-white`}>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 leading-relaxed">
              <strong>Security principle:</strong> Passwords are never visible or settable by the admin.
              Use "Force Reset" to send a secure reset link directly to the user's email.
              Hard delete is irreversible — use "Archive" (soft delete) as the default.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all',       label: 'All Active',  count: counts.total - counts.deleted },
              { key: 'landlords', label: 'Landlords',   count: counts.landlords },
              { key: 'tenants',   label: 'Tenants',     count: counts.tenants },
              { key: 'suspended', label: 'Suspended',   count: counts.suspended },
              { key: 'deleted',   label: 'Archived',    count: counts.deleted },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  filter === key
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  filter === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or landlord…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                {search ? (
                  <>
                    <p className="text-sm font-medium text-gray-400">No results match your search</p>
                    <button onClick={() => setSearch('')} className="text-xs text-blue-600 hover:underline mt-2">
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <UserCog size={28} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">
                      {filter === 'deleted' ? 'No archived users' : 'No users found'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-6 py-3 font-medium">User</th>
                      <th className="text-center px-6 py-3 font-medium">Role</th>
                      <th className="text-left px-6 py-3 font-medium">Landlord</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                      <th className="text-center px-6 py-3 font-medium">Last Login</th>
                      <th className="text-center px-6 py-3 font-medium">Since</th>
                      <th className="text-right px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const rowActing = acting[u._id];
                      const isSpinning = (action) => rowActing === action;

                      return (
                        <tr
                          key={u._id}
                          className={`border-b border-gray-50 transition-colors ${
                            u.isDeleted ? 'bg-gray-50/50 opacity-70' : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* User info */}
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                            {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                          </td>

                          {/* Role */}
                          <td className="px-6 py-3.5 text-center">
                            <RoleBadge role={u.role} />
                          </td>

                          {/* Landlord (tenants only) */}
                          <td className="px-6 py-3.5 text-xs text-gray-500">
                            {u.role === 'tenant'
                              ? u.landlord?.name || <span className="text-gray-300">—</span>
                              : <span className="text-gray-300">—</span>}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-3.5 text-center">
                            <StatusBadge user={u} />
                            {u.isDeleted && u.deletedAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(u.deletedAt)}</p>
                            )}
                          </td>

                          {/* Last login */}
                          <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                            {fmtRelative(u.lastLogin)}
                          </td>

                          {/* Member since */}
                          <td className="px-6 py-3.5 text-center text-xs text-gray-400">
                            {fmtDate(u.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-end gap-1">

                              {/* ── ARCHIVED VIEW: only Restore + Hard Delete ── */}
                              {u.isDeleted ? (
                                <>
                                  <button
                                    onClick={() => handleRestore(u)}
                                    disabled={!!rowActing}
                                    title="Restore account"
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                                  >
                                    {isSpinning('restore')
                                      ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      : <ArchiveRestore size={15} />}
                                  </button>
                                  <button
                                    onClick={() => setHardDeleteTarget(u)}
                                    disabled={!!rowActing}
                                    title="Permanently delete"
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Suspend / Activate toggle */}
                                  <button
                                    onClick={() => u.isActive ? handleSuspend(u) : handleActivate(u)}
                                    disabled={!!rowActing}
                                    title={u.isActive ? 'Suspend account' : 'Activate account'}
                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                      u.isActive
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-gray-400 hover:bg-gray-100'
                                    }`}
                                  >
                                    {isSpinning('suspend') || isSpinning('activate')
                                      ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      : u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                  </button>

                                  {/* Force password reset */}
                                  <button
                                    onClick={() => setResetTarget(u)}
                                    disabled={!!rowActing}
                                    title="Force password reset (sends reset link to user)"
                                    className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-40"
                                  >
                                    <KeyRound size={14} />
                                  </button>

                                  {/* Soft delete (archive) */}
                                  <button
                                    onClick={() => handleSoftDelete(u)}
                                    disabled={!!rowActing}
                                    title="Archive user (soft delete — reversible)"
                                    className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-40"
                                  >
                                    {isSpinning('soft-delete')
                                      ? <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                      : <Archive size={14} />}
                                  </button>

                                  {/* Hard delete */}
                                  <button
                                    onClick={() => setHardDeleteTarget(u)}
                                    disabled={!!rowActing}
                                    title="Permanently delete (irreversible)"
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
                    {(search || filter !== 'all') && ' (filtered)'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Action Guide</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <ToggleRight size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Suspend/Activate</strong> — Blocks or restores login. All data is preserved. Suspending a landlord cascades to their tenants.</span>
              </div>
              <div className="flex items-start gap-2">
                <KeyRound size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <span><strong>Force Reset</strong> — Sends a secure 60-minute reset link to the user's email. Admin never sees or knows the password.</span>
              </div>
              <div className="flex items-start gap-2">
                <Archive size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span><strong>Archive</strong> — Soft deletes the account. Data is fully preserved and the account can be restored at any time.</span>
              </div>
              <div className="flex items-start gap-2">
                <Trash2 size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong>Hard Delete</strong> — Permanently removes the user and all their data. Requires typing DELETE to confirm. Irreversible.</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Hard delete modal ── */}
      {hardDeleteTarget && (
        <HardDeleteModal
          user={hardDeleteTarget}
          onConfirm={handleHardDeleteConfirm}
          onCancel={() => setHardDeleteTarget(null)}
          loading={hardDeleting}
        />
      )}

      {/* ── Force reset modal ── */}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onConfirm={handleForceReset}
          onCancel={() => setResetTarget(null)}
          loading={resetting}
        />
      )}

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        danger={confirm.danger !== false}
        loading={confirm.loading}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </Layout>
  );
};

export default Users;
