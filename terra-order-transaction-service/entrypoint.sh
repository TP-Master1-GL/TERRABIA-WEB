#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ..."
while ! nc -z $RABBITMQ_HOST $RABBITMQ_PORT; do
  sleep 0.1
done
echo "RabbitMQ started"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Create static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Register with Eureka
echo "Registering with Eureka..."
python manage.py shell -c "
from config.configuration_client import EurekaClient
EurekaClient.register_with_eureka()
"

# Start server
echo "Starting server..."
exec "$@"