// Configuration des endpoints API
export const API_CONFIG = {
  // Service d'authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    PASSWORD_RESET: '/auth/password-reset-request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm'
  },

  // Service des utilisateurs
  USERS: {
    BASE: '/users/users',
    BY_ID: '/users/users/{id}',
    FARMERS: '/users/users?role=vendeur',
    DRIVERS: '/users/users?role=entreprise_livraison'
  },

  // Service des produits
  PRODUCTS: {
    BASE: '/products/produits',
    BY_ID: '/products/produits/{id}',
    SEARCH: '/products/produits/recherche',
    CATEGORIES: '/products/categories',
    CATEGORY_BY_ID: '/products/categories/{id}',
    MEDIA: '/products/medias',
    MEDIA_BY_ID: '/products/medias/{id}'
  },

  // Service des commandes
  ORDERS: {
    BASE: '/orders/orders',
    BY_ID: '/orders/orders/{id}',
    BUYER_ORDERS: '/orders/orders/buyer_orders',
    FARMER_ORDERS: '/orders/orders/farmer_orders',
    CANCEL: '/orders/orders/{id}/cancel',
    PROCESS_PAYMENT: '/orders/orders/{id}/process_payment',
    TRANSACTIONS: '/orders/transactions',
    TRANSACTIONS_BY_ID: '/orders/transactions/{id}',
    USER_TRANSACTIONS: '/orders/transactions/user_transactions'
  },

  // Service des notifications
  NOTIFICATIONS: {
    CONSUME: {
      USER_CREATED: '/notifications/consume/user-created',
      ORDER_CREATED: '/notifications/consume/order-created',
      ORDER_COMPLETED: '/notifications/consume/order-completed',
      ORDER_PAID: '/notifications/consume/order-paid',
      ORDER_CANCELLED: '/notifications/consume/order-cancelled'
    }
  },

  // Configuration et santé
  CONFIG: {
    EUREKA_REGISTER: '/config/eureka/register',
    EUREKA_UNREGISTER: '/config/eureka/unregister',
    REFRESH: '/config/refresh'
  },

  HEALTH: {
    BASE: '/health',
    AUTH: '/auth/health',
    USERS: '/users/health',
    PRODUCTS: '/products/health',
    ORDERS: '/orders/health',
    NOTIFICATIONS: '/notifications/health'
  }
};

// Rôles utilisateur
export const USER_ROLES = {
  BUYER: 'acheteur',
  SELLER: 'vendeur',
  DELIVERY: 'entreprise_livraison',
  ADMIN: 'admin'
};

// Statuts des commandes
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};