import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { backendUrl } from '../../config/constants';

/* ── shared header ────────────────────────────────────────────────────────── */
const PageHeader = ({ backTo, title, rightSlot }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        onClick={backTo}
        style={{ padding: '6px 16px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}
      >Back</button>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#042238' }}>{title}</h2>
    </div>
    {rightSlot}
  </div>
);

/* ── Rent Change List ─────────────────────────────────────────────────────── */
const RentChangeList = ({ houseId, leaseId, navigate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  const fetchHistory = async (token) => {
    const r = await axios.get(`${backendUrl}/api/landlord/leases/${leaseId}/rent-history`, { headers: { Authorization: `Bearer ${token}` } });
    return r.data.data || [];
  };

  useEffect(() => {
    if (!leaseId) { setLoading(false); return; }
    const token = localStorage.getItem('rental_token');
    (async () => {
      try {
        let data = await fetchHistory(token);
        if (data.length === 0 && !seeded.current) {
          seeded.current = true;
          const leaseRes = await axios.get(`${backendUrl}/api/landlord/houses/${houseId}/lease`, { headers: { Authorization: `Bearer ${token}` } });
          const lease = leaseRes.data.data;
          if (lease && lease.startDate && lease.rentAmount) {
            await axios.post(
              `${backendUrl}/api/landlord/leases/${leaseId}/rent-history`,
              { startDate: lease.startDate, amount: lease.rentAmount },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            data = await fetchHistory(token);
          }
        }
        setEntries(data);
      } catch {
        toast.error('Failed to load rent history');
      } finally {
        setLoading(false);
      }
    })();
  }, [leaseId, houseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const thS = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', letterSpacing: '0.04em' };
  const tdS = { padding: '14px 16px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' };

  return (
    <>
      <PageHeader
        backTo={() => navigate(`/houses/${houseId}`)}
        title="Rent Change"
        rightSlot={
          <button
            onClick={() => navigate(`/houses/${houseId}/rent-change/create`, { state: { leaseId } })}
            style={{ padding: '8px 18px', background: '#033A6D', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Add Rent Change</button>
        }
      />
      <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No rent changes recorded.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>START DATE</th>
                  <th style={thS}>AMOUNT</th>
                  <th style={{ ...thS, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e._id} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/houses/${houseId}/rent-change/${e._id}/edit`, { state: { leaseId, isFirst: e.isFirst } })}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={ev => ev.currentTarget.style.background = ''}
                  >
                    <td style={tdS}>{new Date(e.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={tdS}>TZS {Number(e.amount).toLocaleString()}</td>
                    <td style={{ ...tdS, textAlign: 'right' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

/* ── shared form card ─────────────────────────────────────────────────────── */
const FormCard = ({ startDate, setStartDate, amount, setAmount, readOnly, isFirst }) => {
  const lbl = { display: 'block', fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 0, minWidth: 120 };
  const row = { display: 'flex', alignItems: 'center', borderBottom: '1px solid #f3f4f6', padding: '14px 20px', gap: 16 };
  const inp = { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#042238', background: 'transparent', fontFamily: 'inherit', padding: '4px 0' };

  return (
    <div style={{ maxWidth: 860, margin: '28px auto', padding: '0 24px' }}>
      <div style={{ background: '#fff', borderRadius: 10, border: '2px solid #1d4ed8', overflow: 'hidden' }}>
        <div style={row}>
          <span style={lbl}>Start Date<span style={{ color: '#ef4444' }}>*</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              readOnly={readOnly}
              style={{ ...inp, cursor: readOnly ? 'default' : 'text', color: readOnly ? '#6b7280' : '#042238' }}
            />
          </div>
        </div>
        <div style={row}>
          <span style={lbl}>Amount<span style={{ color: '#ef4444' }}>*</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>TZS</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              readOnly={readOnly}
              style={{ ...inp, cursor: readOnly ? 'default' : 'text', color: readOnly ? '#6b7280' : '#042238' }}
            />
          </div>
        </div>
        {isFirst && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#eff6ff', borderTop: '1px solid #dbeafe' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1d4ed8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
            <span style={{ fontSize: 13, color: '#1d4ed8' }}>You cannot edit or delete the first rent change for a lease.</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Create page ──────────────────────────────────────────────────────────── */
const RentChangeCreate = ({ houseId, leaseId, navigate }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!startDate || !amount) { toast.error('Start date and amount are required'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('rental_token');
      await axios.post(`${backendUrl}/api/landlord/leases/${leaseId}/rent-history`,
        { startDate, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Rent change saved');
      navigate(`/houses/${houseId}/rent-change`, { state: { leaseId } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader
        backTo={() => navigate(`/houses/${houseId}/rent-change`, { state: { leaseId } })}
        title="Add New Rent Change"
        rightSlot={
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 28px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >{saving ? 'Saving…' : 'Save'}</button>
        }
      />
      <FormCard startDate={startDate} setStartDate={setStartDate} amount={amount} setAmount={setAmount} readOnly={false} isFirst={false} />
    </>
  );
};

/* ── Edit page ────────────────────────────────────────────────────────────── */
const RentChangeEdit = ({ houseId, leaseId, changeId, isFirst, navigate }) => {
  const [startDate, setStartDate] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rental_token');
    axios.get(`${backendUrl}/api/landlord/rent-history/${changeId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const e = r.data.data;
        setStartDate(e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '');
        setAmount(String(e.amount));
      })
      .catch(() => toast.error('Failed to load entry'));
  }, [changeId]);

  const handleSave = async () => {
    if (!startDate || !amount) { toast.error('Start date and amount are required'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('rental_token');
      await axios.put(`${backendUrl}/api/landlord/rent-history/${changeId}`,
        { startDate, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Rent change updated');
      navigate(`/houses/${houseId}/rent-change`, { state: { leaseId } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('rental_token');
      await axios.delete(`${backendUrl}/api/landlord/rent-history/${changeId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Rent change deleted');
      navigate(`/houses/${houseId}/rent-change`, { state: { leaseId } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <PageHeader
        backTo={() => navigate(`/houses/${houseId}/rent-change`, { state: { leaseId } })}
        title="Edit Rent Change"
        rightSlot={!isFirst && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 28px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >{saving ? 'Saving…' : 'Save'}</button>
        )}
      />
      <FormCard startDate={startDate} setStartDate={setStartDate} amount={amount} setAmount={setAmount} readOnly={!!isFirst} isFirst={!!isFirst} />
      {!isFirst && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 32px' }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ padding: '8px 20px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Delete</button>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Delete this Rent Change</h3>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Are you sure you want to delete this rent change? This cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{ padding: '9px 22px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >No</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '9px 22px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.7 : 1 }}
              >{deleting ? 'Deleting…' : 'Yes'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Router shell ─────────────────────────────────────────────────────────── */
export default function RentChange() {
  const { id: houseId, changeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const leaseId = location.state?.leaseId;
  const isFirst = location.state?.isFirst;
  const isCreate = location.pathname.endsWith('/create');
  const isEdit = !!changeId;

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        {isCreate
          ? <RentChangeCreate houseId={houseId} leaseId={leaseId} navigate={navigate} />
          : isEdit
            ? <RentChangeEdit houseId={houseId} leaseId={leaseId} changeId={changeId} isFirst={isFirst} navigate={navigate} />
            : <RentChangeList houseId={houseId} leaseId={leaseId} navigate={navigate} />
        }
      </div>
    </Layout>
  );
}
