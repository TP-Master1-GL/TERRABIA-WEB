"""
Django settings for terra_product_service project.
"""

from pathlib import Path
from dotenv import load_dotenv
import os
import sys

# ---- BASE_DIR ----
BASE_DIR = Path(__file__).resolve().parent.parent

# Charger le .env global
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ---- SECURITY ----
SECRET_KEY = os.getenv("SECRET_KEY", "insecure-default-key")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# ---- APPLICATIONS ----
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'drf_yasg',

    'product_app',
]

# ---- MIDDLEWARE ----
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---- URL / WSGI ----
ROOT_URLCONF = 'terra_product_service.urls'
WSGI_APPLICATION = 'terra_product_service.wsgi.application'

# ---- TEMPLATES ----
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

# ---- DATABASE ----
if 'test' in sys.argv or 'pytest' in sys.modules:
    # DB pour les tests
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
else:
    # DB réelle, valeurs fournies par .env ou par Config Server
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv("DB_NAME", "terabia_product"),
            'USER': os.getenv("DB_USER", "terabia_user"),
            'PASSWORD': os.getenv("DB_PASSWORD", "terabia_pass"),
            'HOST': os.getenv("DB_HOST", "localhost"),
            'PORT': os.getenv("DB_PORT", "3306"),
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

# ---- PASSWORD VALIDATORS ----
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---- INTERNATIONALIZATION ----
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---- STATIC FILES ----
STATIC_URL = 'static/'

# ---- DEFAULT AUTO FIELD ----
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---- EXTERNAL SERVICES (uniquement ce qui n'est pas géré par Config Server) ----
CONFIG_SERVICE_URL = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
EUREKA_URL = os.getenv("EUREKA_URL", "http://localhost:8761/eureka")
SERVICE_NAME = os.getenv("SERVICE_NAME", "terra-product-service")
