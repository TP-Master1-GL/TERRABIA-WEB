# auth_app/urls.py
from django.urls import path
from .views import LoginView, RefreshView, ValidateView, LogoutView

urlpatterns = [
    path('auth/login', LoginView.as_view()),
    path('auth/refresh', RefreshView.as_view()),
    path('auth/validate', ValidateView.as_view()),
    path('auth/logout', LogoutView.as_view()),
]