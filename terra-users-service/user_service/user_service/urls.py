
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, LoginView, ProfileView
from users.views import VerifyEmailView
from users.views import (
    RegisterView, LoginView, ProfileView, VerifyEmailView,
    UserListCreateView, UserRetrieveUpdateDestroyView
)
from users import views

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