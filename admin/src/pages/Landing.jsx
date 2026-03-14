import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Wrench, CheckCircle2, BarChart3, Bell } from 'lucide-react';

/* ── dashboard mockup (right panel) ──────────────────────── */
const DashboardMockup = () => (
  <div className="relative w-full max-w-lg mx-auto">
    {/* outer shadow card */}
    <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
      {/* top bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 h-5 bg-gray-200 rounded-full" />
      </div>
      {/* content */}
      <div className="flex h-56">
        {/* sidebar */}
        <div className="w-14 bg-slate-800 flex flex-col items-center py-4 gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Building2 size={14} className="text-white" />
          </div>
          {[Building2, Users, CreditCard, Wrench, BarChart3].map((Icon, i) => (
            <div key={i} className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
              <Icon size={12} className="text-slate-400" />
            </div>
          ))}
        </div>
        {/* main area */}
        <div className="flex-1 p-4 bg-gray-50">
          {/* stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Properties', val: '12', color: 'text-blue-600' },
              { label: 'Tenants', val: '9', color: 'text-emerald-600' },
              { label: 'Revenue', val: 'TZS 4.2M', color: 'text-violet-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
          {/* table rows */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase border-b border-gray-50">
              <span>Property</span><span>Tenant</span><span>Status</span>
            </div>
            {[
              { addr: 'Msasani Villa', tenant: 'John M.', status: 'Paid', color: 'text-green-600 bg-green-50' },
              { addr: 'Kariakoo Apt', tenant: 'Mary S.', status: 'Due', color: 'text-yellow-600 bg-yellow-50' },
              { addr: 'Kinondoni Hse', tenant: 'Peter K.', status: 'Paid', color: 'text-green-600 bg-green-50' },
            ].map((r, i) => (
              <div key={i} className="grid grid-cols-3 px-3 py-1.5 text-xs border-b border-gray-50 last:border-0">
                <span className="text-gray-700 truncate">{r.addr}</span>
                <span className="text-gray-500">{r.tenant}</span>
                <span className={`inline-flex w-fit items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* floating notification card */}
    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 w-52">
      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={18} className="text-green-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-800">Rent collected</p>
        <p className="text-xs text-gray-400">TZS 650,000</p>
      </div>
    </div>
    {/* floating reminder card */}
    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 w-48">
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Bell size={18} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-800">Reminder sent</p>
        <p className="text-xs text-gray-400">3 tenants notified</p>
      </div>
    </div>
  </div>
);

/* ── features ────────────────────────────────────────────── */
const FEATURES = [
  { icon: Building2,  title: 'Property Management',  desc: 'Add, edit, and track all your rental units and occupancy in one dashboard.' },
  { icon: Users,      title: 'Tenant Portal',         desc: 'Give tenants login access to view balances, due dates, and payment history.' },
  { icon: CreditCard, title: 'Rent Tracking',         desc: 'Monitor payments, outstanding balances, and due dates at a glance.' },
  { icon: Wrench,     title: 'Maintenance Requests',  desc: 'Log and manage repair requests from new through to completed.' },
  { icon: Bell,       title: 'Automated Reminders',   desc: 'Tenants get email reminders before rent is due — every month, automatically.' },
  { icon: BarChart3,  title: 'Reports & Insights',    desc: 'Track income, expenses, and cashflow across all your properties.' },
];

/* ── main ────────────────────────────────────────────────── */
const Landing = () => (
  <div className="min-h-screen bg-white flex flex-col font-sans">

    {/* ── Navbar ───────────────────────────────────────── */}
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 hidden sm:block">Rental Management System</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Log in
          </Link>
          <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm">
            Get started
          </Link>
        </div>
      </div>
    </nav>

    {/* ── Hero ─────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      {/* left */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Simple property management<br />
          <span className="text-blue-600">software for landlords</span>
          <span className="text-blue-600">.</span>
        </h1>

        <p className="text-lg text-gray-500 mb-5 max-w-md leading-relaxed">
          Track properties, collect rent, manage tenants, and automate reminders — all from one clean dashboard.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            Get started free
          </Link>
          <Link to="/login" className="border border-gray-200 hover:border-gray-400 text-gray-700 px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors">
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-4">No credit card required. Free to use.</p>
      </div>

      {/* right */}
      <div className="hidden lg:block">
        <DashboardMockup />
      </div>
    </section>

    {/* ── Features ─────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need, nothing you don't</h2>
        <p className="text-gray-500 max-w-lg mx-auto">A complete toolkit for independent landlords — no complex setup, no unnecessary features.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Icon size={20} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA band ─────────────────────────────────────── */}
    <section className="bg-blue-600 py-10 px-6 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to manage your properties smarter?</h2>
      <p className="text-blue-100 mb-8 max-w-md mx-auto">Create your account in under a minute and start managing your rentals today.</p>
      <Link to="/register" className="inline-block bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm">
        Create free account
      </Link>
    </section>

    {/* ── Footer ───────────────────────────────────────── */}
    <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} Rental Management System. All rights reserved.
    </footer>

  </div>
);

export default Landing;
