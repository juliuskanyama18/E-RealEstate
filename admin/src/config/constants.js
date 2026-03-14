export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';

export const API = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  forgotPassword: '/api/auth/forgot-password',
  admin: {
    stats: '/api/admin/stats',
    landlords: '/api/admin/landlords',
  },
  houses: '/api/landlord/houses',
  tenants: '/api/landlord/tenants',
  tenant: {
    me: '/api/tenant/me',
    status: '/api/tenant/rent-status',
    history: '/api/tenant/rent-history',
  },
};

export const TOKEN_KEY = 'rental_token';
export const USER_KEY = 'rental_user';
