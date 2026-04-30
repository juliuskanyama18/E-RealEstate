import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Wrench, CheckCircle2, BarChart3, Bell } from 'lucide-react';

const NAVY = '#042238';
const NAVY_LIGHT = 'rgba(4,34,56,0.07)';

/* ── dashboard mockup (right panel) ──────────────────────── */
const DashboardMockup = () => (
  <div className="relative w-full" style={{ maxWidth: 580 }}>
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)' }}>
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-5 h-5 bg-gray-200 rounded-full" />
      </div>
      {/* content */}
      <div className="flex" style={{ height: 340 }}>
        {/* sidebar — uses the real app navy */}
        <div className="w-16 flex flex-col items-center py-5 gap-3 flex-shrink-0" style={{ background: NAVY }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Building2 size={15} className="text-white" />
          </div>
          {[Building2, Users, CreditCard, Wrench, BarChart3].map((Icon, i) => (
            <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <Icon size={13} style={{ color: 'rgba(255,255,255,0.45)' }} />
            </div>
          ))}
        </div>
        {/* main area */}
        <div className="flex-1 p-5 bg-gray-50 overflow-hidden">
          {/* greeting skeleton */}
          <div className="mb-4">
            <div style={{ width: 140, height: 8, background: NAVY, borderRadius: 4, opacity: 0.75, marginBottom: 5 }} />
            <div style={{ width: 100, height: 6, background: '#cbd5e1', borderRadius: 4 }} />
          </div>
          {/* stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Properties', val: '12', color: NAVY },
              { label: 'Tenants', val: '9', color: '#16a34a' },
              { label: 'Revenue', val: 'TZS 4.2M', color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <p style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-50" style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Property</span><span>Tenant</span><span>Status</span>
            </div>
            {[
              { addr: 'Msasani Villa',   tenant: 'John M.',  status: 'Paid',    bg: '#dcfce7', col: '#16a34a' },
              { addr: 'Kariakoo Apt',    tenant: 'Mary S.',  status: 'Due',     bg: '#fef3c7', col: '#d97706' },
              { addr: 'Kinondoni Hse',   tenant: 'Peter K.', status: 'Paid',    bg: '#dcfce7', col: '#16a34a' },
              { addr: 'Mikocheni Flat',  tenant: 'Grace L.', status: 'Overdue', bg: '#fee2e2', col: '#dc2626' },
            ].map((r, i) => (
              <div key={i} className="grid grid-cols-3 px-4 py-2.5 border-b border-gray-50 last:border-0 items-center">
                <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.addr}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{r.tenant}</span>
                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: r.bg, color: r.col, width: 'fit-content' }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* floating — rent collected */}
    <div style={{ position: 'absolute', bottom: -16, left: -16, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, width: 210 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Rent collected</p>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>TZS 650,000</p>
      </div>
    </div>
    {/* floating — reminder */}
    <div style={{ position: 'absolute', top: -16, right: -16, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, width: 200 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={20} style={{ color: NAVY }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Reminder sent</p>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>3 tenants notified</p>
      </div>
    </div>
  </div>
);

/* ── features ────────────────────────────────────────────── */
const FEATURES = [
  { icon: Building2,  title: 'Property Management',  desc: 'Add, edit, and track all your rental units and occupancy in one dashboard.',  iconBg: 'rgba(4,34,56,0.07)',   iconColor: NAVY },
  { icon: Users,      title: 'Tenant Portal',         desc: 'Give tenants login access to view balances, due dates, and payment history.', iconBg: 'rgba(249,115,22,0.10)', iconColor: '#ea580c' },
  { icon: CreditCard, title: 'Rent Tracking',         desc: 'Monitor payments, outstanding balances, and due dates at a glance.',          iconBg: 'rgba(4,34,56,0.07)',   iconColor: NAVY },
  { icon: Wrench,     title: 'Maintenance Requests',  desc: 'Log and manage repair requests from new through to completed.',               iconBg: 'rgba(249,115,22,0.10)', iconColor: '#ea580c' },
  { icon: Bell,       title: 'Automated Reminders',   desc: 'Tenants get email reminders before rent is due — every month, automatically.', iconBg: 'rgba(4,34,56,0.07)',  iconColor: NAVY },
  { icon: BarChart3,  title: 'Reports & Insights',    desc: 'Track income, expenses, and cashflow across all your properties.',            iconBg: 'rgba(249,115,22,0.10)', iconColor: '#ea580c' },
];

/* ── main ────────────────────────────────────────────────── */
const Landing = () => (
  <div className="min-h-screen bg-white flex flex-col font-sans">

    {/* ── Navbar ───────────────────────────────────────── */}
    <nav className="sticky top-0 z-20 border-b" style={{ background: NAVY, borderColor: '#0a3050' }}>
      <div className="w-full flex items-center justify-between px-6 sm:px-10 py-3 sm:py-4">
        <Link to="/" className="flex items-center min-w-0">
          <img src="/logo.png" alt="Kanyama Estates" style={{ width: 260, height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link to="/login" className="hidden xs:block text-sm font-medium transition-colors sm:block" style={{ color: 'rgba(147,197,216,0.85)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(147,197,216,0.85)'}>
            <span className="hidden sm:inline">Landlord login</span>
            <span className="sm:hidden">Login</span>
          </Link>
          <Link to="/register" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            style={{ background: '#f97316', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
            onMouseLeave={e => e.currentTarget.style.background = '#f97316'}>
            Get started
          </Link>
        </div>
      </div>
    </nav>

    {/* ── Hero ─────────────────────────────────────────── */}
    <section style={{ background: '#f3f5f7', position: 'relative', overflow: 'hidden' }}
      className="px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* left */}
        <div>
          <h1 style={{ fontSize: 'clamp(2.6rem, 5vw, 3.8rem)', fontWeight: 800, color: NAVY, lineHeight: 1.1, marginBottom: 20 }}>
            Simple property<br />
            management <span className="hero-software">software</span><br />
            for landlords.
          </h1>

          <p style={{ fontSize: 18, color: '#4b6283', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Covering all the bases from rent collection to tenant management.
            Build a more profitable rental portfolio directly from your desktop or mobile.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register" style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff',
              padding: '14px 32px', borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}>
              Get started free
            </Link>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff',
              padding: '14px 28px', borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}>
              Sign in
            </Link>
          </div>

          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
            No credit card required. Free to get started.
          </p>
        </div>

        {/* right — dashboard mockup */}
        <div className="hidden lg:block" style={{ transform: 'perspective(1400px) rotateY(-3deg) rotateX(2deg)', transformOrigin: 'center center' }}>
          <DashboardMockup />
        </div>
      </div>
    </section>

    {/* ── Features ─────────────────────────────────────── */}
    <section className="w-full px-6 sm:px-10 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3" style={{ color: NAVY }}>Everything you need, nothing you don't</h2>
        <p className="text-gray-500 max-w-lg mx-auto">A complete toolkit for independent landlords — no complex setup, no unnecessary features.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
              <Icon size={20} style={{ color: iconColor }} />
            </div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA band ─────────────────────────────────────── */}
    <section className="py-14 px-6 text-center" style={{ background: NAVY }}>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to manage your properties smarter?</h2>
      <p className="mb-8 max-w-md mx-auto" style={{ color: 'rgba(147,197,216,0.8)' }}>
        Create your account in under a minute and start managing your rentals today.
      </p>
      <Link to="/register"
        className="inline-block font-bold px-8 py-3.5 rounded-xl text-sm"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'}
        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}>
        Create free account
      </Link>
    </section>

    {/* ── Footer ───────────────────────────────────────── */}
    <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} Kanyama Estates. All rights reserved.
    </footer>

  </div>
);

export default Landing;
