import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lire les variables d'env de développement (optionnel)
const AUTH_SERVICE = process.env.VITE_AUTH_SERVICE || 'http://localhost:8083'
const CATALOG_SERVICE = process.env.VITE_CATALOG_SERVICE || 'http://localhost:8084'
const ORDER_SERVICE = process.env.VITE_ORDER_SERVICE || 'http://localhost:8086'
const LOGISTICS_SERVICE = process.env.VITE_LOGISTICS_SERVICE || 'http://localhost:8084'
const NOTIF_SERVICE = process.env.VITE_NOTIF_SERVICE || 'http://localhost:8085'
const WEBSOCKET_SERVICE = process.env.VITE_WS_SERVICE || 'ws://localhost:8090'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // proxy config pour le développement local
    proxy: {
      // auth
      '/api/auth': {
        target: AUTH_SERVICE,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/auth'),
      },
      // catalogue / produits
      '/api/products': {
        target: CATALOG_SERVICE,
        changeOrigin: true,
        secure: false,
      },
      '/api/categories': {
        target: CATALOG_SERVICE,
        changeOrigin: true,
        secure: false,
      },
      // commandes, paiements
      '/api/orders': {
        target: ORDER_SERVICE,
        changeOrigin: true,
        secure: false,
      },
      // logistique (REST)
      '/api/logistics': {
        target: LOGISTICS_SERVICE,
        changeOrigin: true,
        secure: false,
      },
      // notifications
      '/api/notifications': {
        target: NOTIF_SERVICE,
        changeOrigin: true,
        secure: false,
      },
      // websocket (suivi en temps réel)
      '/ws': {
        target: WEBSOCKET_SERVICE,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
