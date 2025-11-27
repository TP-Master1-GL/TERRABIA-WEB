FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=terra_product.settings

# Create and set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    python3-dev \
    pkg-config \
    default-libmysqlclient-dev \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8083

# CORRECTION : Utiliser python -m gunicorn au lieu de gunicorn directement
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8083", "--workers", "3", "terra_product.wsgi:application"]