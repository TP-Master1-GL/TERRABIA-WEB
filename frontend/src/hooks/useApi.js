import { useState, useEffect } from 'react';
import { tokenService } from '../services/api';

export const useApi = (apiFunction, initialData = null, immediate = true, dependencies = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorObj = {
        message: err.message || 'Une erreur est survenue',
        status: err.status,
        code: err.code
      };
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { 
    data, 
    loading, 
    error, 
    execute, 
    setData,
    refetch: () => execute(...dependencies)
  };
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(tokenService.isValid());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = tokenService.isValid();
      setIsAuthenticated(authStatus);
      
      // Récupérer les infos utilisateur si authentifié
      if (authStatus) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error('Erreur parsing user data:', e);
          }
        }
      } else {
        setUser(null);
      }
    };

    // Vérifier immédiatement
    checkAuth();

    // Écouter les événements de déconnexion
    window.addEventListener('unauthorized', checkAuth);
    window.addEventListener('storage', checkAuth); // Écouter les changements de localStorage
    
    return () => {
      window.removeEventListener('unauthorized', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return { 
    isAuthenticated, 
    user,
    checkAuth: () => setIsAuthenticated(tokenService.isValid())
  };
};