export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';

export const API = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  forgotPassword: '/api/auth/forgot-password',
  setPassword: '/api/auth/set-password',
  admin: {
    stats:       '/api/admin/stats',
    landlords:   '/api/admin/landlords',
    tenants:     '/api/admin/tenants',
    maintenance: '/api/admin/maintenance',
    rentRecords: '/api/admin/rent-records',
    users:       '/api/admin/users',
  },
  houses: '/api/landlord/houses',
  tenants: '/api/landlord/tenants',
  maintenance: '/api/landlord/maintenance',
  payments: '/api/landlord/payments',
  cashflow: '/api/landlord/cashflow',
  org: '/api/landlord/org',
  tenant: {
    me: '/api/tenant/me',
    status: '/api/tenant/rent-status',
    history: '/api/tenant/rent-history',
    maintenance: '/api/tenant/maintenance',
  },
};

export const TOKEN_KEY = 'rental_token';
export const USER_KEY = 'rental_user';
