import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorFallback from './components/ErrorFallback';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Landlord pages
import LandlordDashboard from './pages/landlord/Dashboard';
import Houses from './pages/landlord/Houses';
import AddProperty from './pages/landlord/AddProperty';
import HouseDetail from './pages/landlord/HouseDetail';
import Tenants from './pages/landlord/Tenants';
import TenantDetail from './pages/landlord/TenantDetail';
import Reports from './pages/landlord/Reports';
import Maintenance from './pages/landlord/Maintenance';
import Organisation from './pages/landlord/Organisation';
import AccountSettings from './pages/landlord/AccountSettings';

// Superadmin pages
import SuperadminDashboard from './pages/superadmin/Dashboard';
import Landlords from './pages/superadmin/Landlords';

// Tenant portal
import TenantPortal from './pages/tenant/Dashboard';

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Landlord */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['landlord']}><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/houses" element={<ProtectedRoute roles={['landlord']}><Houses /></ProtectedRoute>} />
        <Route path="/houses/new" element={<ProtectedRoute roles={['landlord']}><AddProperty /></ProtectedRoute>} />
        <Route path="/houses/:id" element={<ProtectedRoute roles={['landlord']}><HouseDetail /></ProtectedRoute>} />
        <Route path="/tenants" element={<ProtectedRoute roles={['landlord']}><Tenants /></ProtectedRoute>} />
        <Route path="/tenants/:id" element={<ProtectedRoute roles={['landlord']}><TenantDetail /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['landlord']}><Reports /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute roles={['landlord']}><Maintenance /></ProtectedRoute>} />
        <Route path="/organisation" element={<ProtectedRoute roles={['landlord']}><Organisation /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute roles={['landlord']}><AccountSettings /></ProtectedRoute>} />

        {/* Superadmin */}
        <Route path="/admin" element={<ProtectedRoute roles={['superadmin']}><SuperadminDashboard /></ProtectedRoute>} />
        <Route path="/admin/landlords" element={<ProtectedRoute roles={['superadmin']}><Landlords /></ProtectedRoute>} />

        {/* Tenant portal */}
        <Route path="/portal" element={<ProtectedRoute roles={['tenant']}><TenantPortal /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#fff', borderRadius: '8px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
