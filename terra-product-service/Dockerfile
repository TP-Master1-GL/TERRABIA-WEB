# Dockerfile - terra-product-service

# Image de base
FROM python:3.10-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Répertoire de travail
WORKDIR /app

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier tout le code
COPY . .

# Exposer le port (sera surchargé par le config server)
#EXPOSE 8085

# Commande de démarrage
# CMD ["python3", "manage.py", "runserver", "0.0.0.0:8085"]
CMD ["sh", "-c", "python3 manage.py runserver 0.0.0.0:${SERVER_PORT:-8083}"]
