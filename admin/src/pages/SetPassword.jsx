import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { backendUrl, API } from '../config/constants';

const NAVY = '#042238';
const FONT = '"Open Sans", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';

const SetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { applySession } = useAuth();

  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}${API.setPassword}/${token}`, { password });
      if (data.success) {
        applySession(data.data.token, data.data.user);
        const role = data.data.user?.role;
        if (role === 'superadmin') navigate('/admin', { replace: true });
        else if (role === 'landlord') navigate('/dashboard', { replace: true });
        else navigate('/portal', { replace: true });
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: FONT }}>
      {/* Top bar */}
      <div style={{ padding: '18px 32px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: NAVY, letterSpacing: '-0.01em' }}>
          Rental<br />Management
        </span>
      </div>

      {/* Centered form */}
      <div style={{
        margin: '120px auto 0',
        maxWidth: 400,
        padding: '0 24px',
      }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: NAVY,
          lineHeight: 1.3,
          marginBottom: 28,
          textAlign: 'center',
        }}>
          Set a password to access your Tenant Portal
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Password field */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 56px 14px 16px',
                fontSize: 15,
                border: `1.5px solid ${error ? '#ef4444' : '#d1d5db'}`,
                borderRadius: 8,
                outline: 'none',
                fontFamily: FONT,
                boxSizing: 'border-box',
                color: NAVY,
              }}
              onFocus={e => { e.target.style.borderColor = NAVY; }}
              onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#d1d5db'; }}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.05em',
                fontFamily: FONT,
              }}
            >
              {show ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '15px 24px',
              background: loading ? '#6b7280' : NAVY,
              color: '#fff',
              border: 'none',
              borderRadius: 60,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#033a6d'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = NAVY; }}
          >
            {loading ? 'Setting password…' : 'Set My Password'}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          marginTop: 32,
          textAlign: 'center',
          fontSize: 12,
          color: '#9ca3af',
          lineHeight: 1.6,
        }}>
          By continuing you agree to the{' '}
          <span style={{ color: NAVY, cursor: 'default' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: NAVY, cursor: 'default' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default SetPassword;
