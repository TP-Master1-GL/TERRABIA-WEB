import pytest
import django
from django.test import TestCase
from django.conf import settings

def pytest_configure():
    # Configuration pour les tests
    settings.configure(
        DEBUG=True,
        SECRET_KEY='test-secret-key',
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        INSTALLED_APPS=[
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'rest_framework',
            'order_app',
        ],
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': [],
            'DEFAULT_PERMISSION_CLASSES': [],
        },
        USE_TZ=True,
    )
    django.setup()

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Donne accès à la base de données à tous les tests"""
    pass