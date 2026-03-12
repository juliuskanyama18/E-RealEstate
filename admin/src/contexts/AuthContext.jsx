import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backendUrl, API, TOKEN_KEY, USER_KEY } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((tok, userData) => {
    setToken(tok);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const restore = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) { setLoading(false); return; }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const { data } = await axios.get(`${backendUrl}${API.me}`);
        if (data.success) {
          applySession(storedToken, data.data);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [applySession, clearSession]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${backendUrl}${API.login}`, { email, password });
    if (data.success) applySession(data.data.token, data.data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post(`${backendUrl}${API.register}`, formData);
    if (data.success) applySession(data.data.token, data.data.user);
    return data;
  };

  const logout = () => clearSession();

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token && !!user, role: user?.role || null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
