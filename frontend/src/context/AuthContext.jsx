import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const endpoint =
        role === 'admin'
          ? '/api/auth/admin/login'
          : '/api/auth/company/login';

      const { data } = await axios.post(endpoint, { email, password });
      setUser(data);
      navigate(role === 'admin' ? '/admin/dashboard' : '/company/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post('/api/auth/admin/register', { name, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:');
    }
  };

  const updateProfile = async (formData) => {
    try {
      await axios.put('/api/admin/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh user
      const { data } = await axios.get('/api/auth/me');
      setUser(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to refresh user:');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, refreshUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

