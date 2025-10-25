# # auth_app/tests/conftest.py
# import pytest
# from unittest.mock import patch, MagicMock
# from django.conf import settings
# from auth_app.config import get_fake_config

# @pytest.fixture(autouse=True)
# def mock_config_and_services():
#     """Mock config, RabbitMQ, Eureka, et ROOT_URLCONF pour reverse()."""
#     patches = [
#         patch('auth_app.config.get_config', return_value=get_fake_config()),
#         patch('auth_app.rabbitmq_consumer.start_consumer'),
#         patch('auth_app.apps.AuthAppConfig._register_eureka'),
#     ]

#     # Mock views.get_config si views existe
#     try:
#         import auth_app.views
#         patches.append(patch('auth_app.views.get_config', return_value=get_fake_config()))
#     except Exception:
#         pass

#     # === MOCK ROOT_URLCONF ===
#     patches.append(patch.object(settings, 'ROOT_URLCONF', 'auth_app.urls'))

#     # === MOCK urlpatterns avec structure minimale (Django 5.2) ===
#     mock_urlpatterns = [
#         type('URLPattern', (), {
#             'name': 'login',
#             '_regex': r'^login/$',  # ← Django 5.2 utilise _regex
#             'callback': lambda x: x,
#         })(),
#         type('URLPattern', (), {
#             'name': 'refresh',
#             '_regex': r'^refresh/$',
#         })(),
#         type('URLPattern', (), {
#             'name': 'validate',
#             '_regex': r'^validate/$',
#         })(),
#         type('URLPattern', (), {
#             'name': 'logout',
#             '_regex': r'^logout/$',
#         })(),
#         type('URLPattern', (), {
#             'name': 'register',
#             '_regex': r'^register/$',
#         })(),
#     ]

#     with patch.multiple('auth_app.apps', AuthAppConfig=MagicMock()):
#         with patch('auth_app.urls.urlpatterns', mock_urlpatterns):
#             for p in patches:
#                 p.start()
#             yield
#             for p in patches:
#                 # p.stop()