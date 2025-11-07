from .settings import *
import sys

# Utiliser SQLite en mémoire pour les tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Désactiver l'authentification pour les tests
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Désactiver les tâches asynchrones pour les tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Désactiver les checks de sécurité pour les tests
DEBUG = True
SECRET_KEY = 'test-secret-key'

# Désactiver les services externes
MICROSERVICES = {
    'user_service': 'http://test-user-service',
    'catalog_service': 'http://test-catalog-service',
    'logistics_service': 'http://test-logistics-service',
    'notification_service': 'http://test-notification-service',
    'config_service': 'http://test-config-service',
    'eureka_service': 'http://test-eureka-service',
}

# Désactiver RabbitMQ pour les tests
RABBITMQ = {
    'host': 'localhost',
    'port': 5672,
    'username': 'test',
    'password': 'test',
    'vhost': 'test',
}

# Désactiver les logs bruyants
import logging
logging.disable(logging.CRITICAL)