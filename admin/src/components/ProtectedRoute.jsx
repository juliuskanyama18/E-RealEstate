import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const dashboardByRole = { landlord: '/dashboard', superadmin: '/admin', tenant: '/portal' };

const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to={dashboardByRole[role] || '/login'} replace />;

  return children;
};

export default ProtectedRoute;
