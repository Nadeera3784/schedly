import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          // Get user data
          const res = await api.get('/auth/me');
          
          setUser(res.data.data);
          setLoading(false);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/register', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in state
      setToken(res.data.token);
      
      // Set user
      setUser(res.data.user);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/login', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token in state
      setToken(res.data.token);
      
      // Set user
      setUser(res.data.user);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove token from state
    setToken(null);
    
    // Clear user
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext); 