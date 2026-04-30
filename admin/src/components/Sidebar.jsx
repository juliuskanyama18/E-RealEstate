import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Users, Wrench,
  ShieldCheck, Home, Landmark, CreditCard, LogOut, Settings, UserCog, CircleDollarSign, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Nav config ─────────────────────────────────────────────── */
const landlordSections = [
  {
    label: null,
    links: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    end: true },
      { to: '/organisation', icon: Landmark,        label: 'Organisation' },
      { to: '/houses',       icon: Building2,       label: 'Properties' },
      { to: '/tenants',      icon: Users,           label: 'Tenants' },
      { to: '/payments',     icon: CreditCard,      label: 'Payments' },
      { to: '/maintenance',  icon: Wrench,          label: 'Maintenance' },
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
      { to: '/admin/users',       icon: UserCog,   label: 'User Management' },
      { to: '/admin/landlords',   icon: Building2, label: 'Landlords' },
      { to: '/admin/tenants',     icon: Users,     label: 'Tenants' },
      { to: '/admin/maintenance', icon: Wrench,    label: 'Maintenance' },
      { to: '/admin/payments',    icon: CreditCard,label: 'Payments' },
      { to: '/admin/settings',    icon: Settings,  label: 'Settings' },
    ],
  },
];

const tenantSections = [
  {
    label: null,
    links: [
      { to: '/portal',             icon: LayoutDashboard,  label: 'Dashboard',       end: true },
      { to: '/portal/history',     icon: CircleDollarSign, label: 'Payment History'           },
      { to: '/portal/maintenance', icon: Wrench,           label: 'Maintenance'               },
      { to: '/portal/documents',   icon: FileText,         label: 'Documents'                 },
    ],
  },
];

const sectionsByRole = {
  landlord:   landlordSections,
  superadmin: superadminSections,
  tenant:     tenantSections,
};

/* ── Widths ─────────────────────────────────────────────────── */
const OPEN_W = 256;
const MINI_W = 60;

/* ── Component ──────────────────────────────────────────────── */
const Sidebar = ({ mode = 'open' }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = sectionsByRole[role] || [];

  const collapsed = mode === 'collapsed';
  const hidden    = mode === 'hidden';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarW = collapsed ? MINI_W : OPEN_W;

  return (
    <>
      {/* Spacer — mirrors the sidebar width so content (including navbar) shifts with it */}
      <div
        className="flex-shrink-0 transition-all duration-300"
        style={{ width: hidden ? 0 : sidebarW }}
        aria-hidden="true"
      />

      <aside
        className="fixed left-0 top-0 h-screen flex flex-col z-30"
        style={{
          background: '#042238',
          borderRight: '1px solid #0a3050',
          width: sidebarW,
          transform: hidden ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'width 220ms cubic-bezier(0.4,0,0.6,1), transform 220ms cubic-bezier(0.4,0,0.6,1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Logo ──────────────────────────────────────────────── */}
        <NavLink
          to={role === 'tenant' ? '/portal' : role === 'superadmin' ? '/admin' : '/dashboard'}
          style={{
            height: 64,
            padding: collapsed ? '0 4px' : '0 14px',
            borderBottom: '1px solid #0a3050',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
            textDecoration: 'none',
          }}
        >
          {collapsed ? (
            <img
              src="/favicon.png"
              alt="Kanyama Estates"
              style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }}
            />
          ) : (
            <img
              src="/logo.png"
              alt="Kanyama Estates"
              style={{ width: '100%', height: 'auto', maxHeight: 86, objectFit: 'contain', flexShrink: 0 }}
            />
          )}
        </NavLink>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 0' }}>
          {sections.map((section, si) => (
            <div key={si} style={{ marginBottom: section.label ? 8 : 0 }}>
              {/* Section label — only when expanded */}
              {section.label && !collapsed && (
                <p style={{
                  padding: '4px 20px 6px',
                  fontSize: 11, fontWeight: 700,
                  color: '#7ea8c4',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {section.label}
                </p>
              )}

              {section.links.map(({ to, icon: Icon, label, end: isEnd }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={isEnd}
                  title={collapsed ? label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : 10,
                    padding: collapsed ? '10px 0' : '9px 20px',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#ffffff' : '#93c5d8',
                    background: isActive ? '#ffffff18' : 'transparent',
                    borderLeft: isActive ? `3px solid #4da6d0` : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
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
                      {/* Hide label text when collapsed */}
                      {!collapsed && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── User + Logout ──────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid #0a3050',
          padding: collapsed ? '12px 0' : '12px 16px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 10,
          overflow: 'hidden',
        }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#ffffff25', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
          </div>

          {/* Name + email + logout — hidden when collapsed */}
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
