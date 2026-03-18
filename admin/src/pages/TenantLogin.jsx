import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { backendUrl, API } from '../config/constants';
import toast from 'react-hot-toast';

const TenantLogin = () => {
  const { login, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // 'login' | 'forgot' | 'sent'
  const [view, setView] = useState('login');

  const [form,  setForm]  = useState({ email: '', password: '' });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Already authenticated → redirect
  if (isAuthenticated) {
    navigate(role === 'tenant' ? '/portal' : '/dashboard', { replace: true });
    return null;
  }

  /* ── Login submit ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        if (data.data.user.role !== 'tenant') {
          logout();
          toast.error('This portal is for tenants only. Please use the landlord login.');
          return;
        }
        toast.success('Welcome back!');
        navigate('/portal', { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email address');
    setLoading(true);
    try {
      await axios.post(`${backendUrl}${API.forgotPassword}`, { email: email.trim() });
      setView('sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 font-sans">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Close / back-to-home (login view) or back-to-login (forgot view) */}
        {view === 'login' ? (
          <Link
            to="/"
            aria-label="Back to home"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        ) : (
          <button
            onClick={() => { setView('login'); setEmail(''); }}
            aria-label="Back to login"
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16 9H2M2 9L8 3M2 9L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
          <>
            <div className="text-center mb-8">
              <Link to="/" className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
                Rental Management System
              </Link>
              <p className="text-gray-500 text-sm mt-2">Tenant portal — sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setEmail(form.email); setView('forgot'); }}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Don't remember your password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Access is set up by your landlord.{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Landlord login
              </Link>
            </p>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === 'forgot' && (
          <>
            <div className="text-center mb-8 pt-4">
              {/* House icon matching the screenshot style */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="#2563EB" fillOpacity="0.15" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M9 21V12h6v9" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Please enter your email address. We will send<br />you an email to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgot} className="space-y-4">
              <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2.5 gap-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  placeholder="yours@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    SEND EMAIL
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Remembered it?{' '}
              <button onClick={() => setView('login')} className="text-blue-600 hover:underline font-medium">
                Back to sign in
              </button>
            </p>
          </>
        )}

        {/* ── EMAIL SENT CONFIRMATION ── */}
        {view === 'sent' && (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              If <strong>{email}</strong> is registered, a password reset link has been sent. Check your inbox and follow the instructions.
            </p>
            <button
              onClick={() => { setView('login'); setEmail(''); }}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TenantLogin;
