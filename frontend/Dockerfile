# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY vite.config.js ./
COPY .env ./

# Installer les dépendances
RUN npm install --prefer-offline --no-audit

# Copier les sources
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist

# Installer serve et curl pour health check
RUN npm install -g serve && \
    apk add --no-cache curl

# Créer un user non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 && \
    chown -R reactuser:nodejs /app

USER reactuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5173/ || exit 1

EXPOSE 5173

# Commande avec serve
CMD ["serve", "-s", "dist", "-l", "5173"]

# # Dockerfile (Alternative Nginx)
# FROM node:18-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# COPY vite.config.js ./
# COPY .env ./

# RUN npm ci --prefer-offline --no-audit

# COPY . .

# RUN npm run build

# # Étape production avec Nginx
# FROM nginx:alpine

# # Installer curl pour health check
# RUN apk add --no-cache curl

# # Copier config nginx personnalisée
# COPY nginx.conf /etc/nginx/nginx.conf

# # Copier les fichiers buildés
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Changer le port par défaut de 80 à 5173
# RUN sed -i 's/listen\(.*\)80;/listen 5173;/g' /etc/nginx/nginx.conf

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:5173/ || exit 1

# EXPOSE 5173

# CMD ["nginx", "-g", "daemon off;"]