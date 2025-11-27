import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '')
  
  // Configuration basée sur votre .env
  const API_GATEWAY_URL = env.VITE_API_GATEWAY_URL || 'http://localhost:8082'
  const AUTH_SERVICE_URL = env.VITE_AUTH_SERVICE_URL || 'http://localhost:8083'
  const USERS_SERVICE_URL = env.VITE_USERS_SERVICE_URL || 'http://localhost:8084'
  const PRODUCTS_SERVICE_URL = env.VITE_PRODUCTS_SERVICE_URL || 'http://localhost:8085'
  const ORDERS_SERVICE_URL = env.VITE_ORDERS_SERVICE_URL || 'http://localhost:8000'
  const NOTIFICATIONS_SERVICE_URL = env.VITE_NOTIFICATIONS_SERVICE_URL || 'http://localhost:4002'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0', // Important pour Docker
      strictPort: true,
      cors: true,
      // Proxy config pour le développement
      proxy: {
        // Routes via API Gateway
        '/auth': {
          target: API_GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: API_GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        '/products': {
          target: API_GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        '/orders': {
          target: API_GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        '/notifications': {
          target: API_GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        
        // Routes directes vers les services (fallback)
        '/api/auth': {
          target: AUTH_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/users': {
          target: USERS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/products': {
          target: PRODUCTS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/orders': {
          target: ORDERS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/notifications': {
          target: NOTIFICATIONS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        
        // Routes spécifiques pour la compatibilité
        '/api/register': {
          target: AUTH_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/login': {
          target: AUTH_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/profile': {
          target: AUTH_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/categories': {
          target: PRODUCTS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api/transactions': {
          target: ORDERS_SERVICE_URL,
          changeOrigin: true,
          secure: false,
        }
      },
    },
    preview: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: false, // DÉSACTIVÉ temporairement pour éviter les erreurs
      rollupOptions: {
        output: {
          manualChunks: undefined // DÉSACTIVÉ temporairement
        }
      }
    },
    // Configuration CSS simplifiée pour Tailwind v4
    css: {
      postcss: './postcss.config.js'
    },
    // Optimisations pour les performances
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
      exclude: ['@heroicons/react']
    }
  }
})