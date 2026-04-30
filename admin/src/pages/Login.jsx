import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const dashboardByRole = { landlord: '/dashboard', superadmin: '/admin' };

/* ── Tiny dashboard mockup rendered with divs ── */
const DashboardMockup = () => (
  <div style={{
    borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
    transform: 'perspective(1200px) rotateX(3deg) rotateY(-1deg)',
    transformOrigin: 'top center',
  }}>
    {/* Browser chrome */}
    <div style={{ background: '#0a2a3d', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
      <div style={{ flex: 1, background: '#061e2c', borderRadius: 4, height: 18, marginLeft: 10, opacity: 0.7 }} />
    </div>

    {/* App shell */}
    <div style={{ display: 'flex', height: 230 }}>

      {/* Mini sidebar */}
      <div style={{ width: 48, background: '#042238', padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.12)', marginBottom: 4 }} />
        {[1,0,0,1,0,0].map((active, i) => (
          <div key={i} style={{
            width: 32, height: 5, borderRadius: 3,
            background: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, background: '#f5f6f8', padding: '10px 10px 0', overflow: 'hidden' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ width: 110, height: 7, background: '#042238', borderRadius: 3, opacity: 0.75, marginBottom: 3 }} />
          <div style={{ width: 80, height: 5, background: '#cbd5e1', borderRadius: 3 }} />
        </div>

        {/* Quick-action tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 7 }}>
          {['#dbeafe','#dcfce7','#fef3c7','#fce7f3'].map((bg, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 5, padding: '6px 4px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: bg, margin: '0 auto 4px' }} />
              <div style={{ width: '65%', height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto' }} />
            </div>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 7 }}>
          {[
            { accent: '#16a34a', label: 'Rent Received' },
            { accent: '#2563eb', label: 'Upcoming' },
            { accent: '#dc2626', label: 'Overdue' },
          ].map(({ accent, label }, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 5, padding: '7px 8px', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '80%', height: 4, background: '#e5e7eb', borderRadius: 2, marginBottom: 5 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, opacity: 0.18 }} />
                <div style={{ width: 40, height: 7, background: accent, borderRadius: 2, opacity: 0.55 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: '#fff', borderRadius: 5, padding: '8px 8px 0', border: '1px solid #e5e7eb' }}>
          <div style={{ width: 60, height: 5, background: '#e5e7eb', borderRadius: 3, marginBottom: 8 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 46 }}>
            {[28,42,36,60,44,68,38,52,58,46,70,54].map((h, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: '2px 2px 0 0',
                background: i === 3 || i === 6 ? '#2563eb' : '#e2e8f0',
                height: `${h}%`,
                opacity: i === 3 || i === 6 ? 0.85 : 1,
              }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
);

const Login = () => {
  const { login, googleLogin, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const data = await googleLogin(tokenResponse.access_token);
      if (data.success) {
        if (data.data.user.role === 'tenant') {
          logout();
          toast.error('This login is for landlords only. Use the tenant portal login.');
          return;
        }
        toast.success('Logged in successfully');
        navigate(dashboardByRole[data.data.user.role] || '/dashboard', { replace: true });
      } else {
        toast.error(data.message || 'Google login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google login failed'),
  });

  if (isAuthenticated) {
    navigate(dashboardByRole[role] || '/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        if (data.data.user.role === 'tenant') {
          logout();
          toast.error('This login is for landlords only. Use the tenant portal login.');
          return;
        }
        toast.success('Logged in successfully');
        navigate(dashboardByRole[data.data.user.role] || '/dashboard', { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* ── Left panel — dark navy with dashboard mockup ── */}
      <div
        className="flex flex-col lg:w-5/12 lg:min-h-screen px-6 py-5 lg:px-10 lg:py-8"
        style={{ background: '#042238' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="Kanyama Estates" style={{ width: 260, height: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Headline */}
        <div className="hidden lg:block mt-10">
          <h2 className="text-[28px] font-extrabold text-white leading-tight mb-3">
            Manage your properties<br />with confidence.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(147,197,216,0.75)' }}>
            Track rent, manage tenants, and keep your properties running
            smoothly — all in one place.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="hidden lg:block mt-8 flex-1 overflow-hidden">
          <DashboardMockup />
        </div>

        <p className="hidden lg:block text-xs mt-6" style={{ color: 'rgba(147,197,216,0.35)' }}>
          © {new Date().getFullYear()} Kanyama Estates System
        </p>
      </div>

      {/* ── Right / form panel ── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-10 relative">
        <Link
          to="/"
          className="absolute top-5 right-5 transition-colors"
          style={{ color: '#9ca3af' }}
          aria-label="Back to home"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="text-[26px] font-bold mb-1" style={{ color: '#042238' }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>Sign in to your account to continue</p>

          {/* Google button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: googleLoading ? 'not-allowed' : 'pointer', opacity: googleLoading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { if (!googleLoading) e.currentTarget.style.background = '#fff'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
            <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #e5e7eb', background: '#f9fafb', color: '#042238' }}
                onFocus={e => { e.target.style.border = '1px solid #2563eb'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.border = '1px solid #e5e7eb'; e.target.style.background = '#f9fafb'; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{ border: '1px solid #e5e7eb', background: '#f9fafb', color: '#042238' }}
                onFocus={e => { e.target.style.border = '1px solid #2563eb'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.border = '1px solid #e5e7eb'; e.target.style.background = '#f9fafb'; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all mt-1"
              style={{ background: loading ? '#93c5fd' : '#2563eb', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#2563eb' }}>
              Create one free
            </Link>
          </p>
          <p className="text-center text-sm mt-2" style={{ color: '#9ca3af' }}>
            Are you a tenant?{' '}
            <Link to="/tenant-login" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: '#2563eb' }}>
              Tenant portal login
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
