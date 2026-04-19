import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorFallback from './components/ErrorFallback';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import TenantLogin from './pages/TenantLogin';
import Register from './pages/Register';
import SetPassword from './pages/SetPassword';

// Landlord pages
import LandlordDashboard from './pages/landlord/Dashboard';
import Houses from './pages/landlord/Houses';
import AddProperty from './pages/landlord/AddProperty';
import HouseDetail from './pages/landlord/HouseDetail';
import CreateLease from './pages/landlord/CreateLease';
import RentChange from './pages/landlord/RentChange';
import Leases from './pages/landlord/Leases';
import EditProperty from './pages/landlord/EditProperty';
import Tenants from './pages/landlord/Tenants';
import TenantDetail from './pages/landlord/TenantDetail';
import Payments from './pages/landlord/Payments';
import PaymentDetail from './pages/landlord/PaymentDetail';
import RecordPayment from './pages/landlord/RecordPayment';
import SetUpMonthlyCharge from './pages/landlord/SetUpMonthlyCharge';
import SetUpOneTimeCharge from './pages/landlord/SetUpOneTimeCharge';
import Maintenance from './pages/landlord/Maintenance';
import MaintenanceDetail from './pages/landlord/MaintenanceDetail';
import Organisation from './pages/landlord/Organisation';
import AccountSettings from './pages/landlord/AccountSettings';

// Superadmin pages
import SuperadminDashboard from './pages/superadmin/Dashboard';
import Landlords from './pages/superadmin/Landlords';
import LandlordDetail from './pages/superadmin/LandlordDetail';
import AdminSettings from './pages/superadmin/Settings';
import AdminTenants from './pages/superadmin/Tenants';
import AdminMaintenance from './pages/superadmin/Maintenance';
import AdminPayments from './pages/superadmin/Payments';
import AdminUsers from './pages/superadmin/Users';

// Tenant portal
import TenantPortal from './pages/tenant/Dashboard';

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/set-password/:token" element={<SetPassword />} />

        {/* Landlord */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['landlord']}><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/houses" element={<ProtectedRoute roles={['landlord']}><Houses /></ProtectedRoute>} />
        <Route path="/houses/new" element={<ProtectedRoute roles={['landlord']}><AddProperty /></ProtectedRoute>} />
        <Route path="/houses/:id" element={<ProtectedRoute roles={['landlord']}><HouseDetail /></ProtectedRoute>} />
        <Route path="/houses/:id/create-lease" element={<ProtectedRoute roles={['landlord']}><CreateLease /></ProtectedRoute>} />
        <Route path="/houses/:id/leases" element={<ProtectedRoute roles={['landlord']}><Leases /></ProtectedRoute>} />
        <Route path="/houses/:id/edit" element={<ProtectedRoute roles={['landlord']}><EditProperty /></ProtectedRoute>} />
        <Route path="/houses/:id/rent-change" element={<ProtectedRoute roles={['landlord']}><RentChange /></ProtectedRoute>} />
        <Route path="/houses/:id/rent-change/create" element={<ProtectedRoute roles={['landlord']}><RentChange /></ProtectedRoute>} />
        <Route path="/houses/:id/rent-change/:changeId/edit" element={<ProtectedRoute roles={['landlord']}><RentChange /></ProtectedRoute>} />
        <Route path="/tenants" element={<ProtectedRoute roles={['landlord']}><Tenants /></ProtectedRoute>} />
        <Route path="/tenants/:id" element={<ProtectedRoute roles={['landlord']}><TenantDetail /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute roles={['landlord']}><Payments /></ProtectedRoute>} />
        <Route path="/payments/record" element={<ProtectedRoute roles={['landlord']}><RecordPayment /></ProtectedRoute>} />
        <Route path="/payments/:id" element={<ProtectedRoute roles={['landlord']}><PaymentDetail /></ProtectedRoute>} />
        <Route path="/payments/charges/monthly" element={<ProtectedRoute roles={['landlord']}><SetUpMonthlyCharge /></ProtectedRoute>} />
        <Route path="/payments/charges/one-time" element={<ProtectedRoute roles={['landlord']}><SetUpOneTimeCharge /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute roles={['landlord']}><Maintenance /></ProtectedRoute>} />
        <Route path="/maintenance/:id" element={<ProtectedRoute roles={['landlord']}><MaintenanceDetail /></ProtectedRoute>} />
        <Route path="/organisation" element={<ProtectedRoute roles={['landlord']}><Organisation /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute roles={['landlord']}><AccountSettings /></ProtectedRoute>} />

        {/* Superadmin */}
        <Route path="/admin" element={<ProtectedRoute roles={['superadmin']}><SuperadminDashboard /></ProtectedRoute>} />
        <Route path="/admin/landlords" element={<ProtectedRoute roles={['superadmin']}><Landlords /></ProtectedRoute>} />
        <Route path="/admin/landlords/:id" element={<ProtectedRoute roles={['superadmin']}><LandlordDetail /></ProtectedRoute>} />
        <Route path="/admin/users"         element={<ProtectedRoute roles={['superadmin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/tenants"       element={<ProtectedRoute roles={['superadmin']}><AdminTenants /></ProtectedRoute>} />
        <Route path="/admin/maintenance"   element={<ProtectedRoute roles={['superadmin']}><AdminMaintenance /></ProtectedRoute>} />
        <Route path="/admin/payments"      element={<ProtectedRoute roles={['superadmin']}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/settings"      element={<ProtectedRoute roles={['superadmin']}><AdminSettings /></ProtectedRoute>} />

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
