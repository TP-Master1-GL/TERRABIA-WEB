# # Dockerfile - terra-product-service

# # Image de base
# FROM python:3.10-slim

# # Variables d'environnement
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# # Répertoire de travail
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && \
#     apt-get install -y pkg-config default-libmysqlclient-dev build-essential && \
#     rm -rf /var/lib/apt/lists/*
# # Copier les requirements
# COPY requirements.txt .

# # Installer les dépendances
# RUN pip install -r requirements.txt

# # Copier tout le code
# COPY . .

# # Exposer le port (sera surchargé par le config server)
# #EXPOSE 8085

# # Commande de démarrage
# # CMD ["python3", "manage.py", "runserver", "0.0.0.0:8085"]
# CMD ["sh", "-c", "python3 manage.py runserver 0.0.0.0:${SERVER_PORT:-8083}"]





FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=terra_product.settings

# Create and set work directory
WORKDIR /app

# Install system dependencies - CORRECTION ICI
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p /app/logs


# Expose port
EXPOSE 8084

# # Set entrypoint
# ENTRYPOINT ["/app/entrypoint.sh"]

# Start server
CMD ["gunicorn", "--bind", "0.0.0.0:8083", "--workers", "3", "terra_product.wsgi:application"]