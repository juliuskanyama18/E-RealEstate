import { useAuth } from '../contexts/AuthContext';

const roleBadge = {
  landlord: 'bg-blue-100 text-blue-700',
  superadmin: 'bg-purple-100 text-purple-700',
  tenant: 'bg-green-100 text-green-700',
};

const Navbar = ({ title }) => {
  const { user, role } = useAuth();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge[role]}`}>{role}</span>
        <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
      </div>
    </header>
  );
};

export default Navbar;
