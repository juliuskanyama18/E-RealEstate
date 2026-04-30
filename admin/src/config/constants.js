export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';

export const API = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  forgotPassword: '/api/auth/forgot-password',
  setPassword: '/api/auth/set-password',
  updateProfile: '/api/auth/profile',
  changePassword: '/api/auth/password',
  googleAuth: '/api/auth/google',
  admin: {
    stats:       '/api/admin/stats',
    landlords:   '/api/admin/landlords',
    tenants:     '/api/admin/tenants',
    maintenance: '/api/admin/maintenance',
    rentRecords: '/api/admin/rent-records',
    users:       '/api/admin/users',
  },
  houses: '/api/landlord/houses',
  leases: '/api/landlord/leases',
  reminders: '/api/landlord/reminders',
  tenants: '/api/landlord/tenants',
  maintenance: '/api/landlord/maintenance',
  payments: '/api/landlord/payments',
  charges: '/api/landlord/charges',
  cashflow: '/api/landlord/cashflow',
  org: '/api/landlord/org',
  orgPayments: '/api/landlord/org-payments',
  orgPayment:  (id) => `/api/landlord/org-payments/${id}`,
  expenses:      '/api/landlord/expenses',
  expense:       (id) => `/api/landlord/expenses/${id}`,
  houseExpenses: (houseId) => `/api/landlord/houses/${houseId}/expenses`,
  suppliers: '/api/landlord/suppliers',
  tenant: {
    me: '/api/tenant/me',
    status: '/api/tenant/rent-status',
    history: '/api/tenant/rent-history',
    schedule: '/api/tenant/schedule',
    maintenance: '/api/tenant/maintenance',
    landlord: '/api/tenant/landlord',
    documents: '/api/tenant/documents',
    reminders: '/api/tenant/reminders',
  },
};

export const TOKEN_KEY = 'rental_token';
export const USER_KEY = 'rental_user';
