import axios from 'axios';

// Configuration de l'API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://192.168.90.191:8082';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Configuration Axios de base
const api = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour la gestion des tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajout du timestamp pour éviter le cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour la gestion globale des erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { status, data } = error.response || {};
    
    // Gestion des erreurs HTTP
    switch (status) {
      case 401:
        // Token expiré ou invalide
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('unauthorized'));
        break;
        
      case 403:
        // Accès refusé
        window.dispatchEvent(new Event('forbidden'));
        break;
        
      case 500:
        // Erreur serveur
        console.error('Erreur serveur:', data?.message || 'Internal Server Error');
        break;
        
      case 502:
      case 503:
        // Service indisponible
        console.error('Service temporairement indisponible');
        break;
        
      default:
        console.error('Erreur API:', error.message);
    }
    
    return Promise.reject({
      status: status || 0,
      message: data?.message || error.message,
      code: data?.code || 'UNKNOWN_ERROR'
    });
  }
);

// Service de gestion des tokens
export const tokenService = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Services d'authentification (terra-auth-service)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
};

// Services des utilisateurs (terra-users-service)
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getFarmers: (params = {}) => api.get('/users/farmers', { params }),
  getDrivers: (params = {}) => api.get('/users/drivers', { params }),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Services des produits (terra-product-service)
export const productsAPI = {
  // Opérations CRUD de base
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  
  // Recherche et filtres
  search: (query, params = {}) => api.get('/products/search', { 
    params: { q: query, ...params } 
  }),
  getByCategory: (category, params = {}) => api.get(`/products/category/${category}`, { params }),
  getByFarmer: (farmerId, params = {}) => api.get(`/products/farmer/${farmerId}`, { params }),
  
  // Gestion des stocks
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
  getLowStock: (threshold = 10) => api.get('/products/stock/low', { 
    params: { threshold } 
  }),
  
  // Images des produits
  uploadImage: (productId, formData) => api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  
  // Avis et notations
  getReviews: (productId, params = {}) => api.get(`/products/${productId}/reviews`, { params }),
  addReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (productId, reviewId, reviewData) => api.put(`/products/${productId}/reviews/${reviewId}`, reviewData),
  
  // Statistiques (pour agriculteurs)
  getProductStats: (productId) => api.get(`/products/${productId}/stats`),
  getFarmerProductStats: (farmerId, params = {}) => api.get(`/products/farmer/${farmerId}/stats`, { params }),
};

// Services des commandes et transactions (terra-order-transaction-service)
export const ordersAPI = {
  // Commandes
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  
  // Commandes par utilisateur
  getBuyerOrders: (params = {}) => api.get('/orders/buyer/me', { params }),
  getFarmerOrders: (params = {}) => api.get('/orders/farmer/me', { params }),
  getDriverOrders: (params = {}) => api.get('/orders/driver/me', { params }),
  
  // Statuts des commandes
  updateStatus: (id, status, notes = '') => api.patch(`/orders/${id}/status`, { status, notes }),
  getStatusHistory: (id) => api.get(`/orders/${id}/status-history`),
  
  // Paiements
  initiatePayment: (orderId, paymentMethod) => api.post(`/orders/${orderId}/payment`, { paymentMethod }),
  confirmPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/payment/confirm`, paymentData),
  getPaymentStatus: (orderId) => api.get(`/orders/${orderId}/payment/status`),
  
  // Livraison
  scheduleDelivery: (orderId, deliveryData) => api.post(`/orders/${orderId}/delivery`, deliveryData),
  updateDelivery: (orderId, deliveryData) => api.put(`/orders/${id}/delivery`, deliveryData),
  
  // Statistiques
  getOrderStats: (params = {}) => api.get('/orders/stats', { params }),
  getRevenueStats: (params = {}) => api.get('/orders/revenue/stats', { params }),
};

// Services de livraison (intégré dans terra-order-transaction-service)
export const deliveryAPI = {
  // Suivi
  track: (orderId) => api.get(`/delivery/${orderId}/track`),
  getActiveDeliveries: (params = {}) => api.get('/delivery/active', { params }),
  
  // Assignation des livreurs
  assignDriver: (orderId, driverId) => api.post(`/delivery/${orderId}/assign`, { driverId }),
  availableDrivers: (location) => api.get('/delivery/drivers/available', { 
    params: { location } 
  }),
  
  // Mise à jour du statut
  updateStatus: (orderId, status, location = null) => api.patch(`/delivery/${orderId}/status`, { 
    status, 
    location 
  }),
  updateLocation: (orderId, locationData) => api.post(`/delivery/${orderId}/location`, locationData),
  
  // Calcul d'itinéraire
  calculateRoute: (points) => api.post('/delivery/route/calculate', { points }),
  estimateDeliveryTime: (orderId) => api.get(`/delivery/${orderId}/estimate-time`),
  
  // Historique
  getDeliveryHistory: (driverId, params = {}) => api.get(`/delivery/driver/${driverId}/history`, { params }),
};

// Services de notifications (terra-notification-service)
export const notificationsAPI = {
  // Notifications
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
  
  // Préférences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  
  // Abonnements
  subscribe: (subscriptionData) => api.post('/notifications/subscribe', subscriptionData),
  unsubscribe: (token) => api.post('/notifications/unsubscribe', { token }),
  
  // Notifications push
  sendTest: (notificationData) => api.post('/notifications/test', notificationData),
};

// Services des catégories
export const categoriesAPI = {
  getAll: (params = {}) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  getProducts: (id, params = {}) => api.get(`/categories/${id}/products`, { params }),
};

// Services des statistiques et rapports
export const analyticsAPI = {
  // Tableau de bord
  getDashboardStats: (params = {}) => api.get('/analytics/dashboard', { params }),
  
  // Statistiques agriculteur
  getFarmerAnalytics: (farmerId, params = {}) => api.get(`/analytics/farmer/${farmerId}`, { params }),
  
  // Statistiques vendeur
  getSalesAnalytics: (params = {}) => api.get('/analytics/sales', { params }),
  getProductAnalytics: (params = {}) => api.get('/analytics/products', { params }),
  
  // Rapports
  generateReport: (reportData) => api.post('/analytics/reports', reportData),
  getReport: (reportId) => api.get(`/analytics/reports/${reportId}`),
};

// Service de gestion des fichiers
export const filesAPI = {
  upload: (formData, onProgress = null) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    };
    return api.post('/files/upload', formData, config);
  },
  delete: (fileId) => api.delete(`/files/${fileId}`),
  get: (fileId) => api.get(`/files/${fileId}`),
};

// Utilitaires pour le mode démo/développement
export const demoAPI = {
  // Données mockées pour le développement
  getMockProducts: () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Tomates fraîches',
        description: 'Tomates rouges et juteuses cultivées localement',
        price: 1500,
        category: 'Légumes',
        unit: 'kg',
        stockQuantity: 50,
        farmerName: 'Jean Agriculteur',
        farmerLocation: 'Yaoundé',
        rating: 4.5,
        reviewCount: 23,
        images: ['/api/placeholder/400/300'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // ... autres produits mockés
    ];
    
    return Promise.resolve({ data: mockProducts });
  },
};

// Fonction utilitaire pour vérifier la santé des services
export const healthCheck = {
  checkAll: () => api.get('/health'),
  checkAuth: () => api.get('/auth/health'),
  checkProducts: () => api.get('/products/health'),
  checkOrders: () => api.get('/orders/health'),
  checkNotifications: () => api.get('/notifications/health'),
};

export default api;