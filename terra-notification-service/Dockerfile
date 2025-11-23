# Étape 1 : Construire l'environnement
FROM node:20-alpine AS build

WORKDIR /app

# Installer uniquement les dépendances nécessaires
COPY package*.json ./
RUN npm install --production

# Copier le code source
COPY . .

# Étape 2 : Image finale
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape "build"
COPY --from=build /app /app

# Exposer ton port (ex: 3000)
EXPOSE 4002

# Commande de démarrage
CMD ["node", "src/index.js"]
