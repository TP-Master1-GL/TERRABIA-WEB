# FROM python:3.10-slim

# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1

# WORKDIR /app

# # Installer UNIQUEMENT les dépendances essentielles
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#         gcc \
#         python3-dev \
#         libpq-dev \
#         && apt-get clean \
#         && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# RUN pip install --no-cache-dir --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

# COPY . .

# EXPOSE 8084

# CMD ["sh", "-c", "python manage.py migrate --noinput  && gunicorn --bind 0.0.0.0:8084 --workers 3 terra_users.wsgi:application"]





FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


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
CMD ["gunicorn", "--bind", "0.0.0.0:8084", "--workers", "3", "terra_users.wsgi:application"]