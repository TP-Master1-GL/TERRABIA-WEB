FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set work directory
WORKDIR /app

# Install system dependencies
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

# CORRECTION : Utiliser python -m gunicorn au lieu de gunicorn directement
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8084", "--workers", "3", "terra_users.wsgi:application"]