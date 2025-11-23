import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      // Simulation - À REMPLACER par votre vrai API
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@terrabia.com',
        role: 'buyer',
        phone: '+237 6 XX XX XX XX',
        location: 'Douala, Cameroun'
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      // Simulation d'une connexion réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: credentials.email.includes('farmer') ? 'farmer' : 
               credentials.email.includes('driver') ? 'driver' : 'buyer',
        phone: '+237 6 XX XX XX XX',
        location: 'Douala, Cameroun',
        farmName: credentials.email.includes('farmer') ? 'Ma Ferme' : undefined
      };

      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('authToken', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Simulation d'une inscription réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        location: userData.location,
        bio: '',
        farmName: userData.role === 'farmer' ? `Ferme de ${userData.name}` : undefined
      };

      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('authToken', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { 
        success: false, 
        error: "Erreur d'inscription" 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setUser(prevUser => ({
        ...prevUser,
        ...profileData
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur de mise à jour' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};