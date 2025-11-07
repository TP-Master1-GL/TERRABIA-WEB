# Dockerfile - terra-auth-service

# Image de base
FROM python:3.10-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier tout le code
COPY . .

# Exposer le port (sera surchargé par la config)
#EXPOSE 8083

# Commande de démarrage
#CMD ["python3", "manage.py", "runserver", "0.0.0.0:8083"]
CMD ["sh", "-c", "python3 manage.py runserver 0.0.0.0:${SERVER_PORT:-8083}"]
