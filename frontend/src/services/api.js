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
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  validateToken: () => api.get('/auth/validate'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.patch('/auth/profile', profileData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/password-reset-request', { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/password-reset-confirm/${token}`, { new_password: newPassword }),
};

// Services des utilisateurs (terra-users-service)
export const usersAPI = {
  getAll: (params = {}) => api.get('/users/users', { params }),
  getById: (id) => api.get(`/users/users/${id}`),
  createUser: (userData) => api.post('/users/users', userData),
  updateUser: (id, userData) => api.put(`/users/users/${id}`, userData),
  partialUpdateUser: (id, userData) => api.patch(`/users/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/users/${id}`),
  
  // Filtres par rôle
  getFarmers: (params = {}) => api.get('/users/users', { params: { ...params, role: 'vendeur' } }),
  getDrivers: (params = {}) => api.get('/users/users', { params: { ...params, role: 'entreprise_livraison' } }),
  
  // Préférences utilisateur (à adapter selon votre implémentation backend)
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Services des produits (terra-product-service)
export const productsAPI = {
  // Opérations CRUD de base
  getAll: (params = {}) => api.get('/products/produits', { params }),
  getById: (id) => api.get(`/products/produits/${id}`),
  create: (productData) => api.post('/products/produits', productData),
  update: (id, productData) => api.put(`/products/produits/${id}`, productData),
  partialUpdate: (id, productData) => api.patch(`/products/produits/${id}`, productData),
  delete: (id) => api.delete(`/products/produits/${id}`),
  
  // Recherche et filtres
  search: (query, params = {}) => api.get('/products/produits/recherche', { 
    params: { q: query, ...params } 
  }),
  getByCategory: (categoryId, params = {}) => api.get(`/products/categories/${categoryId}/products`, { params }),
  getByFarmer: (farmerId, params = {}) => api.get('/products/produits', { 
    params: { ...params, farmer: farmerId } 
  }),
  
  // Gestion des catégories
  getCategories: (params = {}) => api.get('/products/categories', { params }),
  getCategoryById: (id) => api.get(`/products/categories/${id}`),
  createCategory: (categoryData) => api.post('/products/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/products/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),
  
  // Gestion des médias
  uploadMedia: (formData) => api.post('/products/medias', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMedia: (mediaId) => api.get(`/products/medias/${mediaId}`),
  updateMedia: (mediaId, mediaData) => api.put(`/products/medias/${mediaId}`, mediaData),
  deleteMedia: (mediaId) => api.delete(`/products/medias/${mediaId}`),
  
  // Gestion des stocks (à adapter selon votre implémentation)
  updateStock: (id, stockData) => api.patch(`/products/produits/${id}`, stockData),
  
  // Avis et notations (à implémenter selon votre backend)
  getReviews: (productId, params = {}) => api.get(`/products/produits/${productId}/reviews`, { params }),
  addReview: (productId, reviewData) => api.post(`/products/produits/${productId}/reviews`, reviewData),
};

// Services des commandes et transactions (terra-order-transaction-service)
export const ordersAPI = {
  // Commandes
  getAll: (params = {}) => api.get('/orders/orders', { params }),
  getById: (id) => api.get(`/orders/orders/${id}`),
  create: (orderData) => api.post('/orders/orders', orderData),
  update: (id, orderData) => api.put(`/orders/orders/${id}`, orderData),
  partialUpdate: (id, orderData) => api.patch(`/orders/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/orders/${id}`),
  cancel: (id, reason) => api.post(`/orders/orders/${id}/cancel`, { reason }),
  
  // Commandes par utilisateur
  getBuyerOrders: (params = {}) => api.get('/orders/orders/buyer_orders', { params }),
  getFarmerOrders: (params = {}) => api.get('/orders/orders/farmer_orders', { params }),
  
  // Paiements
  processPayment: (orderId, paymentData) => api.post(`/orders/orders/${orderId}/process_payment`, paymentData),
  
  // Transactions
  getAllTransactions: (params = {}) => api.get('/orders/transactions', { params }),
  getTransactionById: (id) => api.get(`/orders/transactions/${id}`),
  createTransaction: (transactionData) => api.post('/orders/transactions', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/orders/transactions/${id}`, transactionData),
  getUserTransactions: (params = {}) => api.get('/orders/transactions/user_transactions', { params }),
};

// Services de livraison (intégré dans terra-order-transaction-service)
export const deliveryAPI = {
  // Webhooks de livraison
  deliveryWebhook: (webhookData) => api.post('/orders/webhooks/delivery', webhookData),
  paymentWebhook: (webhookData) => api.post('/orders/webhooks/payment', webhookData),
  
  // Suivi (à adapter selon votre implémentation)
  track: (orderId) => api.get(`/orders/delivery/${orderId}/track`),
  updateStatus: (orderId, status, location = null) => api.patch(`/orders/orders/${orderId}`, { 
    status, 
    location 
  }),
};

// Services de notifications (terra-notification-service)
export const notificationsAPI = {
  // Endpoints de consommation (webhooks internes)
  consumeUserCreated: (userData) => api.post('/notifications/consume/user-created', userData),
  consumeOrderCreated: (orderData) => api.post('/notifications/consume/order-created', orderData),
  consumeOrderCompleted: (orderData) => api.post('/notifications/consume/order-completed', orderData),
  consumeOrderPaid: (orderData) => api.post('/notifications/consume/order-paid', orderData),
  consumeOrderCancelled: (orderData) => api.post('/notifications/consume/order-cancelled', orderData),
  
  // Gestion des notifications (à implémenter selon votre backend)
  getAll: (params = {}) => api.get('/notifications/notifications', { params }),
  getUnread: () => api.get('/notifications/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/notifications/${id}/read`),
};

// Services des catégories (déjà inclus dans productsAPI mais séparé pour compatibilité)
export const categoriesAPI = {
  getAll: (params = {}) => api.get('/products/categories', { params }),
  getById: (id) => api.get(`/products/categories/${id}`),
  create: (categoryData) => api.post('/products/categories', categoryData),
  update: (id, categoryData) => api.put(`/products/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/products/categories/${id}`),
  getProducts: (id, params = {}) => api.get(`/products/categories/${id}/products`, { params }),
};

// Services des statistiques et rapports
export const analyticsAPI = {
  // Tableau de bord (à adapter selon votre implémentation)
  getDashboardStats: (params = {}) => api.get('/analytics/dashboard', { params }),
  getSalesAnalytics: (params = {}) => api.get('/analytics/sales', { params }),
  
  // Génération de rapports (à implémenter)
  generateReport: (reportData) => api.post('/analytics/reports', reportData),
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

// Configuration et santé des services
export const configAPI = {
  eurekaRegister: (serviceData) => api.post('/config/eureka/register', serviceData),
  eurekaUnregister: (serviceData) => api.post('/config/eureka/unregister', serviceData),
  refreshConfig: () => api.post('/config/refresh'),
};

// Fonction utilitaire pour vérifier la santé des services
export const healthCheck = {
  checkAll: () => api.get('/health'),
  checkAuth: () => api.get('/auth/health'),
  checkProducts: () => api.get('/products/health'),
  checkOrders: () => api.get('/orders/health'),
  checkNotifications: () => api.get('/notifications/health'),
  checkUsers: () => api.get('/users/health'),
};

// Utilitaires pour le mode démo/développement
export const demoAPI = {
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
    ];
    
    return Promise.resolve({ data: mockProducts });
  },
};

export default api;