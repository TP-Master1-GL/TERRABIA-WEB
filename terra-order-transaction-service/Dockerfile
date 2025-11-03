FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=terra_orders.settings

# Create and set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Create entrypoint script
RUN echo '#!/bin/bash\n\
python manage.py migrate --noinput\n\
python manage.py collectstatic --noinput\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Start server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "terra_orders.wsgi:application"]