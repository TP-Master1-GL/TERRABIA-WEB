# Dockerfile - terra-auth-service

# Image de base
FROM python:3.10-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système pour mysqlclient
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        build-essential \
        pkg-config \
        && rm -rf /var/lib/apt/lists/*

# Copier les fichiers requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier tout le code
COPY . .

# Commande de démarrage
CMD ["sh", "-c", "python3 manage.py runserver 0.0.0.0:${SERVER_PORT:-8083}"]