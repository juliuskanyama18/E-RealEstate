import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Home, Users, LogOut, ShieldCheck, Building2, CreditCard,
} from 'lucide-react';

const landlordLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/houses', icon: Home, label: 'Houses' },
  { to: '/tenants', icon: Users, label: 'Tenants' },
];

const superadminLinks = [
  { to: '/admin', icon: ShieldCheck, label: 'Overview' },
  { to: '/admin/landlords', icon: Building2, label: 'Landlords' },
];

const tenantLinks = [
  { to: '/portal', icon: CreditCard, label: 'My Rental' },
];

const navByRole = {
  landlord: landlordLinks,
  superadmin: superadminLinks,
  tenant: tenantLinks,
};

const roleBadge = {
  landlord: 'bg-blue-100 text-blue-700',
  superadmin: 'bg-purple-100 text-purple-700',
  tenant: 'bg-green-100 text-green-700',
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    {/* Invisible spacer keeps flex layout correct when sidebar is fixed */}
    <div className="w-60 flex-shrink-0" aria-hidden="true" />
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-white text-xl font-bold tracking-tight">RentalSaaS</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="mb-3">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[role]}`}>
            {role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
