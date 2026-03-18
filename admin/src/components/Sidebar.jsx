import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Users, Wrench,
  ShieldCheck, Home, Landmark, CreditCard, LogOut, Settings, UserCog,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Nav config ─────────────────────────────────────────────── */
const landlordSections = [
  {
    label: null,
    links: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/organisation', icon: Landmark, label: 'Organisation' },
      { to: '/houses', icon: Building2, label: 'Properties' },
      { to: '/tenants', icon: Users, label: 'Tenants' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
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
      { to: '/admin/users',       icon: UserCog,        label: 'User Management' },
      { to: '/admin/landlords',   icon: Building2,      label: 'Landlords' },
      { to: '/admin/tenants',     icon: Users,          label: 'Tenants' },
      { to: '/admin/maintenance', icon: Wrench,         label: 'Maintenance' },
      { to: '/admin/payments',    icon: CreditCard,     label: 'Payments' },
      { to: '/admin/settings',    icon: Settings,       label: 'Settings' },
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

/* ── Sidebar styles — matching Avail nav spec ────────────────── */
const navStyle = {
  width: '100%',
  height: '100%',
  overflow: 'visible',
  padding: '16px 0',
  zIndex: 1012,
  color: '#042238',
  fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  WebkitFontSmoothing: 'antialiased',
  textRendering: 'optimizeLegibility',
  lineHeight: 1.42857143,
  boxSizing: 'border-box',
};

/* ── Component ──────────────────────────────────────────────── */
const Sidebar = ({ isOpen = true }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = sectionsByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Flex spacer */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-30 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#042238', borderRight: '1px solid #0a3050' }}
      >
        {/* ── Logo ──────────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #0a3050', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#ffffff20', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Building2 size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#ffffff', lineHeight: 1.25, margin: 0 }}>
                Rental<br />Management
              </p>
              <p style={{ fontSize: 11, color: '#7ea8c4', margin: '2px 0 0' }}>Tanzania</p>
            </div>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav style={{ ...navStyle, color: '#fff', flex: 1, overflowY: 'auto' }}>
          {sections.map((section, si) => (
            <div key={si} style={{ marginBottom: section.label ? 8 : 0 }}>
              {section.label && (
                <p style={{
                  padding: '4px 20px 6px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#7ea8c4',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                  {section.label}
                </p>
              )}
              {section.links.map(({ to, icon: Icon, label, end: isEnd }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={isEnd}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 20px',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#ffffff' : '#93c5d8',
                    background: isActive ? '#ffffff18' : 'transparent',
                    borderLeft: isActive ? '3px solid #4da6d0' : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    lineHeight: 1.42857143,
                    WebkitFontSmoothing: 'antialiased',
                    textRendering: 'optimizeLegibility',
                    boxSizing: 'border-box',
                  })}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffffff12';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    const active = e.currentTarget.getAttribute('aria-current') === 'page';
                    e.currentTarget.style.background = active ? '#ffffff18' : 'transparent';
                    e.currentTarget.style.color = active ? '#ffffff' : '#93c5d8';
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        color={isActive ? '#ffffff' : '#7ea8c4'}
                        style={{ flexShrink: 0 }}
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── User + Logout ──────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #0a3050', padding: '12px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#ffffff25', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: 11, color: '#7ea8c4', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                flexShrink: 0, border: 'none', background: 'none',
                cursor: 'pointer', padding: 6, borderRadius: 6,
                color: '#7ea8c4', display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffffff15'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7ea8c4'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
