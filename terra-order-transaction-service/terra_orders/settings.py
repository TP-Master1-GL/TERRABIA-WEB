import os, sys
import environ
import requests
import json
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# Configuration Service
CONFIG_SERVICE_URL = env('CONFIG_SERVICE_URL', default='http://localhost:8080')
SERVICE_NAME = env('SERVICE_NAME', default='terra-order-transaction-service')
SERVICE_PROFILE = env('SERVICE_PROFILE', default='dev')

def get_config_from_config_service():
    """
    Récupère la configuration depuis le service de configuration Spring Boot
    """
    config_url = f"{CONFIG_SERVICE_URL}/{SERVICE_NAME}-{SERVICE_PROFILE}.json"
    
    try:
        print(f"🔧 Tentative de récupération de la configuration depuis: {config_url}")
        response = requests.get(config_url, timeout=10)
        response.raise_for_status()
        
        config_data = response.json()
        print("✅ Configuration récupérée avec succès depuis le service de configuration")
        return config_data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Impossible de récupérer la configuration: {e}")
        print("🔄 Utilisation des valeurs par défaut...")
        return {}

def setup_configuration():
    """
    Configure l'application avec les valeurs du service de configuration ou les valeurs par défaut
    """
    config_data = get_config_from_config_service()
    
    # DEBUG IMPORTANT - Afficher la structure complète
    if config_data:
        print(f"🎯 Configuration reçue - Clés: {list(config_data.keys())}")
        print(f"🔍 DEBUG - Contenu 'server': {config_data.get('server')}")
        print(f"🔍 DEBUG - Contenu 'database': {config_data.get('database')}")
    else:
        print("🔍 DEBUG - Aucune donnée de configuration reçue")
    
    # SECRET_KEY
    secret_key = None
    if config_data:
        secret_key = config_data.get('secret_key')
        print(f"🔍 DEBUG - Secret key from config: {secret_key is not None}")
    
    # DEBUG
    debug = env.bool('DEBUG', default=True)
    
    # PORT - CORRECTION CRITIQUE ICI
    server_port = None
    if config_data:
        # Essayer plusieurs chemins pour trouver le port
        server_port = (
            config_data.get('server', {}).get('port') or  # {"server": {"port": 8086}}
            config_data.get('port')                       # {"port": 8086}
        )
        print(f"🔍 DEBUG - Port from config: {server_port}")
    
    # Si le port n'est pas trouvé dans la config, utiliser .env ou défaut
    if not server_port:
        server_port = env.int('SERVICE_PORT', default=8000)
        print(f"🔍 DEBUG - Using fallback port: {server_port}")
    
    # Database configuration
    db_config = {}
    if config_data:
        db_config = config_data.get('database', {})
    
    # RabbitMQ configuration
    rabbitmq_config = {}
    if config_data:
        rabbitmq_config = config_data.get('rabbitmq', {})
    
    # Redis configuration
    redis_config = {}
    if config_data:
        redis_config = config_data.get('redis', {})
    
    return {
        'secret_key': secret_key,
        'debug': debug,
        'server_port': server_port,
        'db_config': db_config or {},
        'rabbitmq_config': rabbitmq_config or {},
        'redis_config': redis_config or {},
        'config_data': config_data
    }

# Chargement de la configuration
app_config = setup_configuration()

# DEBUG FINAL - Afficher le port qui sera utilisé
print(f"🎯 PORT FINAL POUR LE SERVICE: {app_config['server_port']}")

BUSINESS_CONFIG = {}

if app_config['config_data']:
    BUSINESS_CONFIG = {
        'ORDER_CONFIG': app_config['config_data'].get('order', {}),
        'TRANSACTION_CONFIG': app_config['config_data'].get('transaction', {}),
        'PAYMENT_CONFIG': app_config['config_data'].get('payment', {}),
        'DELIVERY_CONFIG': app_config['config_data'].get('delivery', {}),
        'STOCK_CONFIG': app_config['config_data'].get('stock', {}),
        'NOTIFICATION_CONFIG': app_config['config_data'].get('notifications', {}),
        'EVENTS_CONFIG': app_config['config_data'].get('events', {}),
        'QUEUES_CONFIG': app_config['config_data'].get('queues', {}),
        'RATE_LIMITS': app_config['config_data'].get('rate_limits', {}),
        'TIMEOUTS': app_config['config_data'].get('timeouts', {}),
        'FEATURES': app_config['config_data'].get('features', {}),
        'CURRENCY': app_config['config_data'].get('currency', {}),
        'AUDIT': app_config['config_data'].get('audit', {}),
        'HEALTH_CHECK': app_config['config_data'].get('health_check', {}),
        'LOGGING_CONFIG': app_config['config_data'].get('logging', {}),
    }
else:
    # Fallback configuration
    BUSINESS_CONFIG = {
        'ORDER_CONFIG': {
            'status': {
                'pending': 'PENDING',
                'confirmed': 'CONFIRMED',
                'paid': 'PAID',
                'in_delivery': 'IN_DELIVERY',
                'delivered': 'DELIVERED',
                'completed': 'COMPLETED',
                'cancelled': 'CANCELLED'
            },
            'number_prefix': 'TRB'
        },
        'TRANSACTION_CONFIG': {
            'types': {
                'payment': 'PAYMENT',
                'refund': 'REFUND',
                'commission': 'COMMISSION',
                'payout': 'PAYOUT'
            },
            'payment_methods': {
                'mobile_money': 'MOBILE_MONEY',
                'orange_money': 'ORANGE_MONEY',
                'mtn_momo': 'MTN_MOMO',
                'cash': 'CASH',
                'bank_transfer': 'BANK_TRANSFER'
            },
            'status': {
                'pending': 'PENDING',
                'processing': 'PROCESSING',
                'success': 'SUCCESS',
                'failed': 'FAILED',
                'reversed': 'REVERSED'
            },
            'reference_prefix': 'TXN'
        },
        'PAYMENT_CONFIG': {
            'simulation_enabled': True,
            'platform_commission_rate': 5.0
        },
        'DELIVERY_CONFIG': {
            'base_fee': 500,
            'free_threshold': 10000
        }
    }

# Rendre BUSINESS_CONFIG disponible dans tous les modules
import sys
sys.modules[__name__].__dict__['BUSINESS_CONFIG'] = BUSINESS_CONFIG

# Configuration Django de base avec fallbacks robustes
SECRET_KEY = app_config['secret_key'] or env('SECRET_KEY', default='terra-order-service-secret-key-2024')
DEBUG = app_config['debug']
SERVICE_PORT = app_config['server_port']  # ⬅️ UTILISATION DIRECTE DU PORT DE LA CONFIG
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1', '0.0.0.0']

print(f"🔧 Configuration finale:")
print(f"   - SECRET_KEY: {'***' + SECRET_KEY[-5:] if SECRET_KEY else 'NONE'}")
print(f"   - DEBUG: {DEBUG}")
print(f"   - SERVICE_PORT: {SERVICE_PORT}")

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

# Database Configuration avec fallbacks robustes
db_config = app_config['db_config']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': (
            db_config.get('name') or 
            db_config.get('database') or
            env('DB_NAME', default='terra_orders_db')
        ),
        'USER': (
            db_config.get('username') or 
            db_config.get('user') or
            env('DB_USER', default='terra_user')
        ),
        'PASSWORD': (
            db_config.get('password') or 
            env('DB_PASSWORD', default='terra_password')
        ),
        'HOST': (
            db_config.get('host') or 
            db_config.get('hostname') or
            env('DB_HOST', default='localhost')
        ),
        'PORT': (
            db_config.get('port') or 
            env('DB_PORT', default='5432')
        ),
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

# REST Framework - TEMPORAIREMENT SANS AUTH POUR TESTS
REST_FRAMEWORK = {
    # 'DEFAULT_AUTHENTICATION_CLASSES': [
    #     'order_app.authentication.MicroserviceAuthentication',
    # ],
    'DEFAULT_PERMISSION_CLASSES': [
        # 'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.AllowAny',  # ⬅️ POUR TESTS
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    f"http://localhost:{SERVICE_PORT}",
    f"http://127.0.0.1:{SERVICE_PORT}",
]

# Service Configuration
SERVICE_CONFIG = {
    'name': SERVICE_NAME,
    'version': '1.0.0',
    'port': SERVICE_PORT,
}

# Microservices URLs
MICROSERVICES = {
    'config_service': CONFIG_SERVICE_URL,
    'eureka_service': env('EUREKA_SERVICE_URL', default='http://localhost:8761'),
}

# RabbitMQ Configuration
rabbitmq_config = app_config['rabbitmq_config']

RABBITMQ = {
    'host': (
        rabbitmq_config.get('host') or 
        env('RABBITMQ_HOST', default='localhost')
    ),
    'port': (
        rabbitmq_config.get('port') or 
        env.int('RABBITMQ_PORT', default=5672)
    ),
    'username': (
        rabbitmq_config.get('username') or 
        env('RABBITMQ_USERNAME', default='guest')
    ),
    'password': (
        rabbitmq_config.get('password') or 
        env('RABBITMQ_PASSWORD', default='guest')
    ),
    'vhost': (
        rabbitmq_config.get('virtual-host') or 
        env('RABBITMQ_VHOST', default='/')
    ),
}

# Celery Configuration
CELERY_BROKER_URL = f"amqp://{RABBITMQ['username']}:{RABBITMQ['password']}@{RABBITMQ['host']}:{RABBITMQ['port']}/{RABBITMQ['vhost']}"
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Channels for WebSockets
redis_config = app_config['redis_config']

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(
                redis_config.get('host') or 
                env('REDIS_HOST', default='localhost'),
                redis_config.get('port') or 
                env.int('REDIS_PORT', default=6379)
            )],
        },
    },
}

# Logging
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

# Swagger Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Terrabia Order & Transaction Service API',
    'DESCRIPTION': 'API for managing orders and transactions in Terrabia platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Eureka Registration - VERSION AMÉLIORÉE
def register_with_eureka():
    """
    Enregistre le service auprès d'Eureka avec retry et fallback
    """
    eureka_url = env('EUREKA_SERVICE_URL', default='http://localhost:8761')
    
    eureka_payload = {
        "instance": {
            "instanceId": f"{SERVICE_NAME}:{SERVICE_PORT}",
            "app": SERVICE_NAME.upper().replace('-', '_'),
            "hostName": "localhost",
            "ipAddr": "127.0.0.1",
            "status": "UP",
            "port": {
                "$": int(SERVICE_PORT),
                "@enabled": "true",
            },
            "securePort": {
                "$": 8443,
                "@enabled": "false",
            },
            "healthCheckUrl": f"http://localhost:{SERVICE_PORT}/health/",
            "statusPageUrl": f"http://localhost:{SERVICE_PORT}/admin/",
            "homePageUrl": f"http://localhost:{SERVICE_PORT}/",
            "vipAddress": SERVICE_NAME,
            "secureVipAddress": SERVICE_NAME,
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            }
        }
    }
    
    print(f"🔧 Tentative d'enregistrement Eureka:")
    print(f"   Service: {SERVICE_NAME}")
    print(f"   Port: {SERVICE_PORT}")
    print(f"   URL de base: {eureka_url}")
    
    # Essayer différentes URLs Eureka
    eureka_urls_to_try = [
        f"{eureka_url}/eureka/apps/{SERVICE_NAME.upper().replace('-', '_')}",
        f"{eureka_url}/apps/{SERVICE_NAME.upper().replace('-', '_')}",
    ]
    
    for url in eureka_urls_to_try:
        try:
            print(f"   Essai sur: {url}")
            response = requests.post(
                url,
                json=eureka_payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                print("✅ Service enregistré auprès d'Eureka avec succès!")
                return True
            else:
                print(f"⚠️ Eureka a retourné: {response.status_code}")
                if response.text:
                    print(f"   Réponse: {response.text}")
                    
        except requests.exceptions.ConnectionError:
            print(f"❌ Impossible de se connecter à Eureka sur: {url}")
        except Exception as e:
            print(f"❌ Erreur avec Eureka: {e}")
    
    print("❌ Échec de l'enregistrement Eureka après tous les essais")
    return False

# Enregistrement Eureka au démarrage
if not 'test' in sys.argv and not 'migrate' in sys.argv and not 'collectstatic' in sys.argv:
    import threading
    import time
    
    def delayed_eureka_registration():
        """Attendre que Django soit complètement démarré avant de s'enregistrer sur Eureka"""
        time.sleep(3)
        register_with_eureka()
    
    eureka_thread = threading.Thread(target=delayed_eureka_registration)
    eureka_thread.daemon = True
    eureka_thread.start()

if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

# Affichage final
print(f"\n🎯 Service {SERVICE_NAME} configuré:")
print(f"   Port: {SERVICE_PORT}")
print(f"   Database: {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")
print(f"   RabbitMQ: {RABBITMQ['host']}:{RABBITMQ['port']}")
print(f"   Config Service: {CONFIG_SERVICE_URL}")
print("✅ Configuration Django chargée avec succès!\n")