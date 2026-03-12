import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Users, Wrench,
  ShieldCheck, Home, Landmark, BarChart2,
} from 'lucide-react';

/* ── Nav config ─────────────────────────────────────────────── */
const landlordSections = [
  {
    label: null,
    links: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/organisation', icon: Landmark, label: 'Organisation' },
      { to: '/houses', icon: Building2, label: 'Properties' },
      { to: '/tenants', icon: Users, label: 'Tenants' },
      { to: '/reports', icon: BarChart2, label: 'Reports' },
      { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    ],
  },
];

const superadminSections = [
  {
    label: null,
    links: [
      { to: '/admin', icon: ShieldCheck, label: 'Overview', end: true },
    ],
  },
  {
    label: 'Platform',
    links: [
      { to: '/admin/landlords', icon: Building2, label: 'Landlords' },
    ],
  },
];

const tenantSections = [
  {
    label: null,
    links: [
      { to: '/portal', icon: Home, label: 'My Rental', end: true },
    ],
  },
];

const sectionsByRole = {
  landlord: landlordSections,
  superadmin: superadminSections,
  tenant: tenantSections,
};

/* ── Component ──────────────────────────────────────────────── */
const Sidebar = ({ isOpen = true }) => {
  const { role } = useAuth();
  const sections = sectionsByRole[role] || [];

  return (
    <>
      {/* Spacer keeps flex layout correct when sidebar is fixed */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 flex flex-col z-30 border-r border-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Logo Area ─────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Building2 size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">RentalSaaS</p>
              <p className="text-gray-400 text-xs mt-0.5">Tanzania</p>
            </div>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.links.map(({ to, icon: Icon, label, end: isEnd }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={isEnd}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
