import os, sys
import environ
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY', default='terra-order-secret-key-2024')
DEBUG = env.bool('DEBUG', default=True)
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'channels',
    'order_app',
    'django_celery_results',
    'drf_spectacular',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'terra_orders.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'terra_orders.wsgi.application'
ASGI_APPLICATION = 'terra_orders.asgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='terra_orders_db'),
        'USER': env('DB_USER', default='terra_user'),
        'PASSWORD': env('DB_PASSWORD', default='terra_password'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'order_app.authentication.MicroserviceAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True

# Service Configuration
SERVICE_CONFIG = {
    'name': 'terra-order-transaction-service',
    'version': '1.0.0',
}

# Microservices URLs
MICROSERVICES = {
    'user_service': env('USER_SERVICE_URL', default='http://localhost:8001'),
    'catalog_service': env('CATALOG_SERVICE_URL', default='http://localhost:8002'),
    'logistics_service': env('LOGISTICS_SERVICE_URL', default='http://localhost:8003'),
    'notification_service': env('NOTIFICATION_SERVICE_URL', default='http://localhost:8004'),
    'config_service': env('CONFIG_SERVICE_URL', default='http://localhost:8888'),
    'eureka_service': env('EUREKA_SERVICE_URL', default='http://localhost:8761/eureka'),
}

# RabbitMQ Configuration
RABBITMQ = {
    'host': env('RABBITMQ_HOST', default='localhost'),
    'port': env('RABBITMQ_PORT', default=5672),
    'username': env('RABBITMQ_USERNAME', default='terra_user'),
    'password': env('RABBITMQ_PASSWORD', default='terra_passwoed'),
    'vhost': env('RABBITMQ_VHOST', default='terra_vhost'),
}

# Celery Configuration
CELERY_BROKER_URL = f"amqp://{RABBITMQ['username']}:{RABBITMQ['password']}@{RABBITMQ['host']}:{RABBITMQ['port']}//"
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Channels for WebSockets
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(env('REDIS_HOST', default='localhost'), env('REDIS_PORT', default=6379))],
        },
    },
}

# Logging - Configuration corrigée
import logging.config
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_DIR, 'order_service.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'order_app': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Service Port
SERVICE_PORT = env.int('SERVICE_PORT', default=8000)

# Swagger Settings
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'JWT Token format: Bearer <token>'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'DOC_EXPANSION': 'none',
    'DEEP_LINKING': True,
}

# Redoc Settings
REDOC_SETTINGS = {
    'LAZY_RENDERING': False,
    'HIDE_HOSTNAME': False,
    'EXPAND_RESPONSES': ['200', '201'],
}


# Configuration Spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'Terrabia Order & Transaction Service API',
    'DESCRIPTION': 'API for managing orders and transactions in Terrabia platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

if 'test' in sys.argv:
    # Utiliser SQLite en mémoire pour les tests
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Désactiver l'authentification pour les tests
    REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = []
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = []
    
    # Désactiver RabbitMQ pour les tests
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True