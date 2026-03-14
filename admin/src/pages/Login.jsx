import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Users, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const dashboardByRole = { landlord: '/dashboard', superadmin: '/admin', tenant: '/portal' };

const Login = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

      {/* ── Blue panel — top bar on mobile, left column on desktop ── */}
      <div className="bg-blue-600 flex flex-col lg:w-5/12 lg:min-h-screen lg:justify-between
                      px-6 py-5 lg:p-10">
        {/* Always-visible: logo row */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">Rental Management System</span>
        </Link>

        {/* Desktop-only: headline + bullets */}
        <div className="hidden lg:block mt-auto">
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
            Manage your properties<br />with confidence.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Everything you need to track rent, manage tenants, and keep your properties running smoothly — in one place.
          </p>
          <div className="space-y-3">
            {[
              { icon: Building2,   text: 'Track all your properties & occupancy' },
              { icon: Users,       text: 'Manage tenants and lease details' },
              { icon: CreditCard,  text: 'Monitor rent payments & balances' },
              { icon: CheckCircle2,text: 'Automated reminders, zero chasing' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-white" />
                </div>
                <span className="text-sm text-blue-100">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="hidden lg:block text-blue-200 text-xs mt-auto pt-8">© {new Date().getFullYear()} Rental Management System</p>
      </div>

      {/* ── Right / form panel ── */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center px-6 py-10 relative">
        <Link to="/" className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          {/* Google button */}
          <button
            type="button"
            onClick={() => toast('Google sign-in coming soon')}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
