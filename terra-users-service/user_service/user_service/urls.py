
from django.contrib import admin
from django.urls import path
from django.urls import re_path
from django.views.static import serve
import os
from pathlib import Path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, LoginView, ProfileView
from users.views import VerifyEmailView
from users.views import (
    RegisterView, LoginView, ProfileView, VerifyEmailView,
    UserListCreateView, UserRetrieveUpdateDestroyView
)
from users import views
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DOCS_ROOT = os.path.join(BASE_DIR, 'api_docs')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/<str:token>/', views.password_reset_confirm, name='password_reset_confirm'),

]

urlpatterns += [
    re_path(r'^docs/(?P<path>.*)$', serve, {'document_root': STATIC_DOCS_ROOT}),
]