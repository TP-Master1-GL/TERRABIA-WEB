import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.90.191:8082/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Services des produits - Données mockées temporaires
export const productsAPI = {
  getAll: (params = {}) => {
    // Données mockées temporaires
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
        images: ['/api/placeholder/400/300']
      },
      {
        id: 2,
        name: 'Bananes plantains',
        description: 'Bananes plantains mûres et savoureuses',
        price: 800,
        category: 'Fruits',
        unit: 'régime',
        stockQuantity: 25,
        farmerName: 'Marie Fermière',
        farmerLocation: 'Douala',
        rating: 4.8,
        reviewCount: 15,
        images: ['/api/placeholder/400/300']
      },
      {
        id: 3,
        name: 'Pommes de terre',
        description: 'Pommes de terre nouvelles de saison',
        price: 1200,
        category: 'Tubercules',
        unit: 'kg',
        stockQuantity: 100,
        farmerName: 'Pierre Cultivateur',
        farmerLocation: 'Bafoussam',
        rating: 4.2,
        reviewCount: 18,
        images: ['/api/placeholder/400/300']
      },
      {
        id: 4,
        name: 'Aubergines locales',
        description: 'Aubergines fraîches et fermes',
        price: 900,
        category: 'Légumes',
        unit: 'kg',
        stockQuantity: 30,
        farmerName: 'Alice Maraîchère',
        farmerLocation: 'Garoua',
        rating: 4.6,
        reviewCount: 12,
        images: ['/api/placeholder/400/300']
      },
      {
        id: 5,
        name: 'Oignons violets',
        description: 'Oignons violets parfumés',
        price: 1100,
        category: 'Légumes',
        unit: 'kg',
        stockQuantity: 40,
        farmerName: 'David Producteur',
        farmerLocation: 'Maroua',
        rating: 4.4,
        reviewCount: 9,
        images: ['/api/placeholder/400/300']
      },
      {
        id: 6,
        name: 'Carottes fraîches',
        description: 'Carottes croquantes et sucrées',
        price: 950,
        category: 'Légumes',
        unit: 'kg',
        stockQuantity: 35,
        farmerName: 'Sophie Jardinière',
        farmerLocation: 'Ngaoundéré',
        rating: 4.7,
        reviewCount: 21,
        images: ['/api/placeholder/400/300']
      }
    ];

    return Promise.resolve({ data: mockProducts });
  },
  
  getById: (id) => {
    const mockProducts = [
      {
        id: 1,
        name: 'Tomates fraîches',
        description: 'Tomates rouges et juteuses cultivées localement dans les régions fertiles du Cameroun. Récoltées à maturité pour garantir un goût exceptionnel.',
        price: 1500,
        category: 'Légumes',
        unit: 'kg',
        stockQuantity: 50,
        farmerName: 'Jean Agriculteur',
        farmerLocation: 'Yaoundé, Centre',
        farmerId: 1,
        rating: 4.5,
        reviewCount: 23,
        images: [
          '/api/placeholder/600/400',
          '/api/placeholder/600/400',
          '/api/placeholder/600/400'
        ],
        details: {
          cultivation: 'Agriculture biologique',
          harvest: 'Récolte manuelle',
          conservation: 'Conserver au frais',
          origin: 'Production locale'
        }
      }
    ];
    
    const product = mockProducts.find(p => p.id === parseInt(id));
    return Promise.resolve({ data: product });
  },
  
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// Services des commandes
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getBuyerOrders: () => api.get('/orders/buyer'),
  getFarmerOrders: () => api.get('/orders/farmer'),
};

// Services de livraison
export const deliveryAPI = {
  track: (orderId) => api.get(`/delivery/track/${orderId}`),
  assignDriver: (orderId, driverId) => api.post(`/delivery/assign`, { orderId, driverId }),
  updateLocation: (locationData) => api.post('/delivery/location', locationData),
  calculateRoute: (points) => api.post('/delivery/route', { points }),
};

// Services de notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  subscribe: (subscriptionData) => api.post('/notifications/subscribe', subscriptionData),
};

export default api;