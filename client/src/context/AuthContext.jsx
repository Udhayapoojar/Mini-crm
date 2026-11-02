import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe, logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('crm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('crm_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('crm_token');
      if (savedToken) {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('crm_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.success && res.data) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('crm_token', userToken);
      localStorage.setItem('crm_user', JSON.stringify(userData));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      // Continue client cleanup even if logout request fails
    } finally {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

