import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenService } from '../services/api';

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

  useEffect(() => {
    const token = tokenService.getToken();
    if (token && tokenService.isValid()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
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
      const response = await authAPI.login(credentials);
      
      // Adaptation selon la structure de réponse de votre backend
      const { accessToken, refreshToken, user: userData } = response.data;
      
      // Stockage des tokens
      tokenService.setToken(accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Email ou mot de passe incorrect' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Adaptation des données pour correspondre à votre backend
      const registerData = {
        email: userData.email,
        password: userData.password,
        username: userData.name,
        role: userData.role,
        phone_number: userData.phone,
        address: userData.location
      };
      
      const response = await authAPI.register(registerData);
      
      // Gestion de la réponse selon votre backend
      const { access, refresh, user: newUser } = response.data;
      
      // Stockage des tokens
      tokenService.setToken(access);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || "Erreur d'inscription" 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      tokenService.removeToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erreur de mise à jour' 
      };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await authAPI.refreshToken(refreshToken);
      const { accessToken, access } = response.data;
      
      tokenService.setToken(accessToken || access);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    loading,
    isAuthenticated: !!user && tokenService.isValid(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};