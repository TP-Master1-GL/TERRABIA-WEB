from django.urls import path
from auth_app.views import LoginView, RefreshView, ValidateView, LogoutView

urlpatterns = [
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/refresh', RefreshView.as_view(), name='refresh'),
    path('auth/validate', ValidateView.as_view(), name='validate'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
]