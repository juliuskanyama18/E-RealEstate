import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const FONT = '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: FONT, fontSize: 14, color: NAVY,
  border: '1.5px solid #d1d5db', borderRadius: 6,
  padding: '10px 12px', outline: 'none', background: '#fff',
};
const labelStyle = {
  display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 700,
  color: '#5a7a90', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
};
const SectionCard = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 20, overflow: 'hidden' }}>
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f2f5' }}>
      <h3 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h3>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
);

const AccountSettings = () => {
  const { user, applySession, token } = useAuth();

  /* ── Profile form ───────────────────────────────────────── */
  const [profile, setProfile]             = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await axios.put(`${backendUrl}${API.updateProfile}`, profile);
      if (data.success) {
        applySession(token, { ...user, name: data.data.name, phone: data.data.phone });
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  /* ── Password form ──────────────────────────────────────── */
  const [pw, setPw]             = useState({ current: '', newPw: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.newPw) { toast.error('All password fields are required'); return; }
    if (pw.newPw.length < 6)      { toast.error('New password must be at least 6 characters'); return; }
    if (pw.newPw !== pw.confirm)  { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      const { data } = await axios.put(`${backendUrl}${API.changePassword}`, {
        currentPassword: pw.current,
        newPassword: pw.newPw,
      });
      if (data.success) {
        setPw({ current: '', newPw: '', confirm: '' });
        toast.success('Password changed successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const btnStyle = (disabled) => ({
    background: disabled ? '#6b7280' : NAVY, color: '#fff',
    border: 'none', borderRadius: 60, padding: '10px 28px',
    fontFamily: FONT, fontSize: 13, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <Layout>
      <main style={{ flex: 1, background: '#f5f6f8', padding: '32px 28px', fontFamily: FONT }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 24px' }}>
            Account Settings
          </h1>

          {/* ── Profile ──────────────────────────────────────── */}
          <SectionCard title="Profile">
            <form onSubmit={handleProfileSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={profile.name} placeholder="Your name"
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <input style={inputStyle} value={profile.phone} placeholder="+255..."
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email</label>
                <input style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
                  value={user?.email || ''} readOnly />
                <p style={{ fontFamily: FONT, fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <button type="submit" disabled={savingProfile} style={btnStyle(savingProfile)}
                onMouseEnter={e => { if (!savingProfile) e.currentTarget.style.background = '#033a6d'; }}
                onMouseLeave={e => { if (!savingProfile) e.currentTarget.style.background = NAVY; }}>
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </SectionCard>

          {/* ── Change Password ───────────────────────────────── */}
          <SectionCard title="Change Password">
            <form onSubmit={handlePasswordSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Current Password</label>
                <input type="password" style={inputStyle} value={pw.current} placeholder="••••••••"
                  onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>New Password</label>
                <input type="password" style={inputStyle} value={pw.newPw} placeholder="Min. 6 characters"
                  onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" style={inputStyle} value={pw.confirm} placeholder="Repeat new password"
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = NAVY; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; }} />
              </div>
              <button type="submit" disabled={savingPw} style={btnStyle(savingPw)}
                onMouseEnter={e => { if (!savingPw) e.currentTarget.style.background = '#033a6d'; }}
                onMouseLeave={e => { if (!savingPw) e.currentTarget.style.background = NAVY; }}>
                {savingPw ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </SectionCard>

        </div>
      </main>
    </Layout>
  );
};

export default AccountSettings;
